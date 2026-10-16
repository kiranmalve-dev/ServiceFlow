import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ApiResponse } from "../types/index.js";

// ── Create booking ────────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  serviceId: z
    .string()
    .min(1, "serviceId is required."),

  scheduledAt: z
    .string()
    .min(1, "scheduledAt is required.")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "scheduledAt must be a valid ISO date string.",
    })
    .refine((val) => new Date(val) > new Date(), {
      message: "scheduledAt must be a future date.",
    }),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters."),
  notes: z
    .string()
    .optional()
    .default(""),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export function validateCreateBooking(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = createBookingSchema.safeParse(req.body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid request body.";
    const body: ApiResponse = { success: false, message: firstError };
    res.status(400).json(body);
    return;
  }

  req.body = result.data;
  next();
}

// ── Admin status update ───────────────────────────────────────────────────────

const VALID_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

export const updateStatusSchema = z.object({
  status: z
    .string()
    .min(1, "status is required.")
    .refine(
      (val): val is typeof VALID_STATUSES[number] => (VALID_STATUSES as readonly string[]).includes(val),
      { message: `status must be one of: ${VALID_STATUSES.join(", ")}.` }
    ),
});

export function validateUpdateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = updateStatusSchema.safeParse(req.body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid status value.";
    const body: ApiResponse = { success: false, message: firstError };
    res.status(400).json(body);
    return;
  }

  req.body = result.data;
  next();
}
