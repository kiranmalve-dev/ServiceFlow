import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ApiResponse } from "../types/index.js";

const PORTALS = ["customer", "admin"] as const;
export type Portal = (typeof PORTALS)[number];

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),

  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, "Password must be at least 6 characters."),

  portal: z
    .string()
    .refine(
      (val): val is Portal => (PORTALS as readonly string[]).includes(val),
      { message: `portal must be one of: ${PORTALS.join(", ")}.` }
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;

export function validateLoginBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid request body.";
    const body: ApiResponse = { success: false, message: firstError };
    res.status(400).json(body);
    return;
  }
  req.body = result.data;
  next();
}
