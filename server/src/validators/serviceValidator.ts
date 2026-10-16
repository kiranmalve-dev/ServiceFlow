import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../types/index.js";

const VALID_CATEGORIES = ["Cleaning", "Plumbing", "Electrical", "HVAC", "Gardening"];

/**
 * Validates the body for creating a service (all fields required).
 */
export function validateCreateService(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { name, category, description, price, duration } = req.body as Record<string, unknown>;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ success: false, message: "name must be at least 2 characters." } satisfies ApiResponse);
    return;
  }

  if (!category || typeof category !== "string" || !VALID_CATEGORIES.includes(category)) {
    res.status(400).json({
      success: false,
      message: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
    } satisfies ApiResponse);
    return;
  }

  if (!description || typeof description !== "string" || description.trim().length < 5) {
    res.status(400).json({ success: false, message: "description must be at least 5 characters." } satisfies ApiResponse);
    return;
  }

  if (price === undefined || typeof price !== "number" || price <= 0 || !Number.isInteger(price)) {
    res.status(400).json({ success: false, message: "price must be a positive integer (cents, e.g. 9500 = $95.00)." } satisfies ApiResponse);
    return;
  }

  if (duration === undefined || typeof duration !== "number" || duration <= 0 || !Number.isInteger(duration)) {
    res.status(400).json({ success: false, message: "duration must be a positive integer (minutes)." } satisfies ApiResponse);
    return;
  }

  next();
}

/**
 * Validates the body for updating a service (all fields optional, but if present must be valid).
 */
export function validateUpdateService(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as Record<string, unknown>;

  if ("name" in body && (typeof body["name"] !== "string" || (body["name"] as string).trim().length < 2)) {
    res.status(400).json({ success: false, message: "name must be at least 2 characters." } satisfies ApiResponse);
    return;
  }

  if ("category" in body && (typeof body["category"] !== "string" || !VALID_CATEGORIES.includes(body["category"] as string))) {
    res.status(400).json({
      success: false,
      message: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
    } satisfies ApiResponse);
    return;
  }

  if ("description" in body && (typeof body["description"] !== "string" || (body["description"] as string).trim().length < 5)) {
    res.status(400).json({ success: false, message: "description must be at least 5 characters." } satisfies ApiResponse);
    return;
  }

  if ("price" in body && (typeof body["price"] !== "number" || (body["price"] as number) <= 0 || !Number.isInteger(body["price"] as number))) {
    res.status(400).json({ success: false, message: "price must be a positive integer (cents)." } satisfies ApiResponse);
    return;
  }

  if ("duration" in body && (typeof body["duration"] !== "number" || (body["duration"] as number) <= 0 || !Number.isInteger(body["duration"] as number))) {
    res.status(400).json({ success: false, message: "duration must be a positive integer (minutes)." } satisfies ApiResponse);
    return;
  }

  if ("isActive" in body && typeof body["isActive"] !== "boolean") {
    res.status(400).json({ success: false, message: "isActive must be a boolean." } satisfies ApiResponse);
    return;
  }

  next();
}
