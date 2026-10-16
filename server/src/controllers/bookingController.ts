import type { Request, Response } from "express";
import type { ApiResponse, BookingStatus, AdminBookingFilters } from "../types/index.js";
import type { CreateBookingInput } from "../validators/bookingValidator.js";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getAdminSummary,
  getAllUser,
} from "../services/bookingService.js";

// ── Customer ──────────────────────────────────────────────────────────────────

/**
 * POST /api/bookings
 * Authenticated customer creates a booking.
 */
export async function createBookingHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const input  = req.body as CreateBookingInput;
    const booking = await createBooking(userId, input);

    const body: ApiResponse<typeof booking> = {
      success: true,
      message: "Booking created successfully.",
      data: booking,
    };
    res.status(201).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";

    let status = 400;
    if (message === "Service not found.") status = 404;
    if (message.startsWith("You already have a booking")) status = 409;
    if (message.startsWith("This time slot is already booked")) status = 409;

    res.status(status).json({ success: false, message } satisfies ApiResponse);
  }
}

/**
 * GET /api/bookings/mine
 * Query params: page, pageSize
 * Returns paginated bookings for the authenticated customer.
 */
export async function getMyBookingsHandler(req: Request, res: Response): Promise<void> {
  try {
    const page     = req.query["page"]     ? Number(req.query["page"])     : 1;
    const pageSize = req.query["pageSize"] ? Number(req.query["pageSize"]) : 10;

    const result = await getMyBookings(req.user!.id, page, pageSize);

    const body: ApiResponse<typeof result> = {
      success: true,
      message: "Bookings fetched successfully.",
      data: result,
    };
    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    res.status(500).json({ success: false, message } satisfies ApiResponse);
  }
}

/**
 * PATCH /api/bookings/:id/cancel
 * Customer cancels their own booking.
 */
export async function cancelBookingHandler(req: Request, res: Response): Promise<void> {
  try {
    const bookingId = String(req.params["id"] ?? "");
    const userId    = req.user!.id;
    const booking   = await cancelBooking(bookingId, userId);

    const body: ApiResponse<typeof booking> = {
      success: true,
      message: "Booking cancelled successfully.",
      data: booking,
    };
    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    const status =
      message === "Booking not found."                              ? 404 :
      message === "You do not have permission to cancel this booking." ? 403 :
      400;
    res.status(status).json({ success: false, message } satisfies ApiResponse);
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/bookings
 * Query params: status, userId, serviceId, page, pageSize
 */
export async function listAllBookingsHandler(req: Request, res: Response): Promise<void> {
  try {
    const filters: AdminBookingFilters = {
      status:    req.query["status"]    as BookingStatus | undefined,
      userId:    req.query["userId"]    ? Number(req.query["userId"])   : undefined,
      serviceId: req.query["serviceId"] as string | undefined,
      search:    req.query["search"]    as string | undefined,
      dateFrom:  req.query["dateFrom"]  as string | undefined,
      dateTo:    req.query["dateTo"]    as string | undefined,
      page:      req.query["page"]      ? Number(req.query["page"])     : 1,
      pageSize:  req.query["pageSize"]  ? Number(req.query["pageSize"]) : 20,
    };

    const result = await getAllBookings(filters);

    const body: ApiResponse<typeof result> = {
      success: true,
      message: "Bookings fetched successfully.",
      data: result,
    };
    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    res.status(500).json({ success: false, message } satisfies ApiResponse);
  }
}


export async function listAllUsersHandler(req: Request, res: Response): Promise<void> {
  try {
    const filters: AdminBookingFilters = {
      status:    req.query["status"]    as BookingStatus | undefined,
      userId:    req.query["userId"]    ? Number(req.query["userId"])   : undefined,
      serviceId: req.query["serviceId"] as string | undefined,
      page:      req.query["page"]      ? Number(req.query["page"])     : 1,
      pageSize:  req.query["pageSize"]  ? Number(req.query["pageSize"]) : 20,
    };

    const result = await getAllUser(filters);

    const body: ApiResponse<typeof result> = {
      success: true,
      message: "User fetched successfully.",
      data: result,
    };
    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    res.status(500).json({ success: false, message } satisfies ApiResponse);
  }
}

/**
 * PATCH /api/admin/bookings/:id/status
 */
export async function updateBookingStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const bookingId = String(req.params["id"] ?? "");
    const { status } = req.body as { status: BookingStatus };
    const booking = await updateBookingStatus(bookingId, status);

    const body: ApiResponse<typeof booking> = {
      success: true,
      message: `Booking status updated to "${status}".`,
      data: booking,
    };
    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    const status  = message === "Booking not found." ? 404 : 400;
    res.status(status).json({ success: false, message } satisfies ApiResponse);
  }
}

/**
 * GET /api/admin/summary
 */
export async function adminSummaryHandler(_req: Request, res: Response): Promise<void> {
  try {
    const summary = await getAdminSummary();

    const body: ApiResponse<typeof summary> = {
      success: true,
      message: "Summary fetched successfully.",
      data: summary,
    };
    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    res.status(500).json({ success: false, message } satisfies ApiResponse);
  }
}
