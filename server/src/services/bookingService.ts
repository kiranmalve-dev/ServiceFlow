import prisma from "../lib/prisma.js";
import type {
  BookingStatus,
  AdminBookingFilters,
} from "../types/index.js";
import { VALID_STATUS_TRANSITIONS } from "../types/index.js";

const db = prisma as any;

// ── Shared booking select shape ───────────────────────────────────────────────

const bookingSelect = {
  id: true,
  status: true,
  scheduledAt: true,
  address: true,
  notes: true,
  quotedPrice: true,
  quotedService: true,
  createdAt: true,
  updatedAt: true,
  service: {
    select: { id: true, name: true, category: true, duration: true },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
};

// ── Customer operations ───────────────────────────────────────────────────────

/**
 * POST /api/bookings
 *
 * Creates a booking after checking two conflict rules:
 *
 *  Rule 1 — Per-user duplicate:
 *    The same customer cannot have an active booking for the same service
 *    whose time window overlaps the requested slot.
 *    "Active" means status NOT IN (CANCELLED, COMPLETED).
 *
 *  Rule 2 — Per-service slot:
 *    No two active bookings for the same service can overlap in time.
 *    Overlap = requested start is before an existing end
 *              AND existing start is before requested end.
 *    (This assumes one provider per service / single-resource scheduling.)
 *
 * Overlap formula (all times in UTC):
 *   conflictStart < requestedEnd  AND  requestedStart < conflictEnd
 *   where End = Start + duration (minutes).
 */
export async function createBooking(
  userId: number,
  input: { serviceId: string; scheduledAt: string; address: string; notes?: string }
) {
  // 1. Fetch the service — must exist and be active
  const service = await db.service.findUnique({ where: { id: input.serviceId } });
  if (!service) throw new Error("Service not found.");
  if (!service.isActive) throw new Error("This service is currently unavailable.");

  const requestedStart = new Date(input.scheduledAt);
  const durationMs     = service.duration * 60 * 1000;
  const requestedEnd   = new Date(requestedStart.getTime() + durationMs);

  // Non-terminal statuses that block a slot
  const activeStatuses: BookingStatus[] = ["PENDING", "CONFIRMED"];

  // 2. Rule 1 — same user + same service + overlapping window
  const userConflict = await db.booking.findFirst({
    where: {
      userId,
      serviceId: input.serviceId,
      status:    { in: activeStatuses },
      // Overlap: existing.scheduledAt < requestedEnd
      //      AND requestedStart      < existing.scheduledAt + duration
      // We express the second half by checking scheduledAt < requestedEnd
      // and handle the duration offset in the post-query filter below, OR
      // we use a raw date range query that SQLite supports via gte/lt.
      scheduledAt: {
        // existing slot starts before our slot ends …
        lt: requestedEnd,
        // … and existing slot ends after our slot starts
        // existing end = scheduledAt + duration → we cannot express this
        // in Prisma without raw SQL for SQLite, so we use a safe window:
        // fetch any booking whose start falls within ±duration of ours
        // and then do an exact overlap check in JS.
        gte: new Date(requestedStart.getTime() - durationMs),
      },
    },
    select: { id: true, scheduledAt: true },
  });

  if (userConflict) {
    // Exact overlap check in JS
    const existingStart = userConflict.scheduledAt as Date;
    const existingEnd   = new Date(existingStart.getTime() + durationMs);
    if (requestedStart < existingEnd && existingStart < requestedEnd) {
      throw new Error(
        `You already have a booking for this service that overlaps with ${requestedStart.toISOString()}. ` +
        `Please choose a different time slot.`
      );
    }
  }

  // 3. Rule 2 — same service + overlapping window (any user)
  const serviceConflict = await db.booking.findFirst({
    where: {
      serviceId: input.serviceId,
      status:    { in: activeStatuses },
      scheduledAt: {
        lt:  requestedEnd,
        gte: new Date(requestedStart.getTime() - durationMs),
      },
    },
    select: { id: true, scheduledAt: true },
  });

  if (serviceConflict) {
    const existingStart = serviceConflict.scheduledAt as Date;
    const existingEnd   = new Date(existingStart.getTime() + durationMs);
    if (requestedStart < existingEnd && existingStart < requestedEnd) {
      throw new Error(
        `This time slot is already booked. Please choose a different time.`
      );
    }
  }

  // 4. All checks passed — create the booking
  const booking = await db.booking.create({
    data: {
      userId,
      serviceId:     input.serviceId,
      scheduledAt:   requestedStart,
      address:       input.address.trim(),
      notes:         input.notes ?? "",
      quotedPrice:   service.price,
      quotedService: service.name,
      status:        "PENDING",
    },
    select: bookingSelect,
  });

  return booking;
}

/**
 * GET /api/bookings/mine
 * Returns paginated bookings belonging to the authenticated user.
 */
export async function getMyBookings(
  userId: number,
  page: number = 1,
  pageSize: number = 10
) {
  const safePage     = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const skip         = (safePage - 1) * safePageSize;

  const [total, bookings] = await Promise.all([
    db.booking.count({ where: { userId } }),
    db.booking.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: safePageSize,
      select: bookingSelect,
    }),
  ]);

  return {
    data: bookings,
    meta: {
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(total / safePageSize),
    },
  };
}

export async function cancelBooking(bookingId: string, userId: number) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new Error("Booking not found.");
  if (booking.userId !== userId) throw new Error("You do not have permission to cancel this booking.");

  const current = booking.status as BookingStatus;
  if (!VALID_STATUS_TRANSITIONS[current].includes("CANCELLED")) {
    throw new Error(`Cannot cancel a booking with status "${current}".`);
  }

  const updated = await db.booking.update({
    where: { id: bookingId },
    data:  { status: "CANCELLED" },
    select: bookingSelect,
  });

  return updated;
}

// ── Admin operations ──────────────────────────────────────────────────────────

export async function getAllBookings(filters: AdminBookingFilters = {}) {
  const page     = Math.max(1, filters.page     ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const skip     = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters.status)    where["status"]    = filters.status;
  if (filters.userId)    where["userId"]    = filters.userId;
  if (filters.serviceId) where["serviceId"] = filters.serviceId;

  if (filters.dateFrom || filters.dateTo) {
    const scheduledAt: Record<string, Date> = {};

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      from.setUTCHours(0, 0, 0, 0);
      scheduledAt["gte"] = from;
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setUTCHours(23, 59, 59, 999);
      scheduledAt["lte"] = to;
    }

    where["scheduledAt"] = scheduledAt;
  }

  // ── Search filter on user name / service name ────────────────────────────
  if (filters.search) {
    where["OR"] = [
      { user:    { name:  { contains: filters.search } } },
      { service: { name:  { contains: filters.search } } },
      { address: { contains: filters.search } },
    ];
  }

  const [total, bookings] = await Promise.all([
    db.booking.count({ where }),
    db.booking.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: bookingSelect,
    }),
  ]);

  return {
    data: bookings,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}


export  async  function getAllUser(filters: AdminBookingFilters = {}) {
   const page     = Math.max(1, filters.page     ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const skip     = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (filters.status)    where["status"]    = filters.status;
  if (filters.userId)    where["userId"]    = filters.userId;
  if (filters.serviceId) where["serviceId"] = filters.serviceId;

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
/**
 * PATCH /api/admin/bookings/:id/status
 * Admin can move a booking through valid status transitions.
 */
export async function updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new Error("Booking not found.");

  const current = booking.status as BookingStatus;
  const allowed = VALID_STATUS_TRANSITIONS[current];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid transition: "${current}" → "${newStatus}". Allowed: ${
        allowed.length ? allowed.join(", ") : "none (terminal status)"
      }.`
    );
  }

  const updated = await db.booking.update({
    where: { id: bookingId },
    data:  { status: newStatus },
    select: bookingSelect,
  });

  return updated;
}

// ── Admin summary ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/summary
 * DB-derived dashboard stats.
 */
export async function getAdminSummary() {
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    totalServices,
    activeServices,
    totalCustomers,
  ] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: "PENDING" } }),
    db.booking.count({ where: { status: "CONFIRMED" } }),
    db.booking.count({ where: { status: "COMPLETED" } }),
    db.booking.count({ where: { status: "CANCELLED" } }),
    // Revenue = sum of quotedPrice for COMPLETED bookings
    db.booking.aggregate({
      where: { status: "COMPLETED" },
      _sum: { quotedPrice: true },
    }),
    db.service.count(),
    db.service.count({ where: { isActive: true } }),
    db.user.count({ where: { role: "customer" } }),
  ]);

  return {
    bookings: {
      total:     totalBookings,
      pending:   pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
    },
    revenue: {
      // quotedPrice is stored in cents
      totalCents:  totalRevenue._sum?.quotedPrice ?? 0,
      totalFormatted: `$${((totalRevenue._sum?.quotedPrice ?? 0) / 100).toFixed(2)}`,
    },
    services: {
      total:  totalServices,
      active: activeServices,
    },
    customers: {
      total: totalCustomers,
    },
  };
}
