import prisma from "../lib/prisma.js";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CreateServiceInput {
  name: string;
  category: string;
  description: string;
  price: number;      // stored in cents
  duration: number;   // stored in minutes
}

export interface UpdateServiceInput {
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
}

export interface ServiceFilters {
  category?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

// ── CRUD operations ──────────────────────────────────────────────────────────

/**
 * GET /api/services
 * Returns active services with optional filters + pagination.
 * Supports: ?category= &search= &page= &pageSize=
 */
export async function getAllServices(filters: ServiceFilters = {}) {
  const db = prisma as any;

  const page     = Math.max(1, filters.page     ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 10));
  const skip     = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (filters.isActive !== undefined) {
    where["isActive"] = filters.isActive;
  }

  if (filters.category) {
    where["category"] = filters.category;
  }

  if (filters.search) {
    where["OR"] = [
      { name:        { contains: filters.search } },
      { description: { contains: filters.search } },
      { category:    { contains: filters.search } },
    ];
  }

  const [total, services] = await Promise.all([
    db.service.count({ where }),
    db.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    data: services,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * GET /api/services/:id
 */
export async function getServiceById(id: string) {
  const db = prisma as any;

  const service = await db.service.findUnique({ where: { id } });

  if (!service) {
    throw new Error("Service not found.");
  }

  return service;
}

/**
 * POST /api/admin/services
 */
export async function createService(input: CreateServiceInput) {
  const db = prisma as any;

  const service = await db.service.create({
    data: {
      name:        input.name.trim(),
      category:    input.category,
      description: input.description.trim(),
      price:       input.price,
      duration:    input.duration,
    },
  });

  return service;
}

/**
 * PATCH /api/admin/services/:id
 * Partial update — only fields present in input are updated.
 */
export async function updateService(id: string, input: UpdateServiceInput) {
  const db = prisma as any;

  // Make sure it exists first
  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Service not found.");
  }

  const data: Record<string, unknown> = {};
  if (input.name       !== undefined) data["name"]        = input.name.trim();
  if (input.category   !== undefined) data["category"]    = input.category;
  if (input.description !== undefined) data["description"] = input.description.trim();
  if (input.price      !== undefined) data["price"]       = input.price;
  if (input.duration   !== undefined) data["duration"]    = input.duration;
  if (input.isActive   !== undefined) data["isActive"]    = input.isActive;

  const updated = await db.service.update({ where: { id }, data });

  return updated;
}

/**
 * DELETE /api/admin/services/:id
 * Hard delete — only allowed if no bookings reference this service.
 * Otherwise use PATCH to deactivate (isActive: false).
 */
export async function deleteService(id: string) {
  const db = prisma as any;

  const existing = await db.service.findUnique({
    where: { id },
    include: { bookings: { take: 1 } },
  });

  if (!existing) {
    throw new Error("Service not found.");
  }

  if (existing.bookings.length > 0) {
    throw new Error(
      "Cannot delete a service that has existing bookings. Deactivate it instead (isActive: false)."
    );
  }

  await db.service.delete({ where: { id } });
}
