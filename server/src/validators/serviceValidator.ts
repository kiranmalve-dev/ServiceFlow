
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ApiResponse } from "../types/index.js";

const VALID_CATEGORIES = [
  "Cleaning",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Gardening",
] as const;

// Common validation rules
const serviceFields = {
  name: z.string().trim().min(2, {
    message: "name must be at least 2 characters.",
  }),

  category: z.enum(VALID_CATEGORIES, {
    message: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
  }),

  description: z.string().trim().min(5, {
    message: "description must be at least 5 characters.",
  }),

  price: z
    .number()
    .int("price must be an integer.")
    .positive("price must be greater than zero."),

  duration: z
    .number()
    .int("duration must be an integer.")
    .positive("duration must be greater than zero."),
};

// Schema for creating a service
export const createServiceSchema = z.object(serviceFields);

// Schema for updating a service
export const updateServiceSchema = z
  .object({
    ...serviceFields,
    isActive: z.boolean(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  });

// Infer TypeScript types directly from schemas
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

// ── Middleware helpers ────────────────────────────────────────────────────────

export function validateCreateService(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = createServiceSchema.safeParse(req.body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid request body.";
    const body: ApiResponse = { success: false, message: firstError };
    res.status(400).json(body);
    return;
  }
  req.body = result.data;
  next();
}

export function validateUpdateService(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = updateServiceSchema.safeParse(req.body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid request body.";
    const body: ApiResponse = { success: false, message: firstError };
    res.status(400).json(body);
    return;
  }
  req.body = result.data;
  next();
}
