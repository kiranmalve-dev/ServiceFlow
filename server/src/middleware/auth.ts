import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload, ApiResponse } from "../types/index.js";
import { COOKIE_NAME } from "../controllers/authController.js";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "dev_secret_change_in_production";

/**
 * Extends Express Request to carry the decoded JWT payload
 * after requireAuth middleware runs.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// ── requireAuth ───────────────────────────────────────────────────────────────

/**
 * Role-aware auth middleware factory.
 *
 * Each role has its own cookie name:
 *   customer  →  cus_token
 *   admin     →  adm_token
 *
 * This means a customer cookie is physically absent from the admin-route
 * cookie lookup, providing hard isolation without any role-string comparison.
 *
 * Returns 401 when the expected cookie is missing or the token is invalid/expired.
 */
function makeRequireAuth(role: "customer" | "admin") {
  const cookieName = COOKIE_NAME[role];

  return function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const token: string | undefined = req.cookies?.[cookieName];

    if (!token) {
      const body: ApiResponse = { success: false, message: "Authentication required." };
      res.status(401).json(body);
      return;
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;

      // Double-check: even if someone somehow presents a valid token in the
      // wrong cookie jar, the role inside must match what this route expects.
      if (payload.role !== role) {
        const body: ApiResponse = {
          success: false,
          message: `Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)}s only.`,
        };
        res.status(403).json(body);
        return;
      }

      req.user = payload;
      next();
    } catch {
      const body: ApiResponse = {
        success: false,
        message: "Invalid or expired session. Please log in again.",
      };
      res.status(401).json(body);
    }
  };
}

// ── Public middleware exports ─────────────────────────────────────────────────

/**
 * Reads cus_token cookie. Attaches decoded payload to req.user.
 * Returns 401 if missing/invalid, 403 if role mismatch.
 */
export const requireCustomerAuth = makeRequireAuth("customer");

/**
 * Reads adm_token cookie. Attaches decoded payload to req.user.
 * Returns 401 if missing/invalid, 403 if role mismatch.
 */
export const requireAdminAuth = makeRequireAuth("admin");

/**
 * Generic requireAuth — kept for backward compatibility on routes that
 * only need "some valid session". Tries cus_token first, then adm_token.
 *
 * Prefer requireCustomerAuth / requireAdminAuth on role-specific routes.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const cusToken: string | undefined = req.cookies?.["cus_token"];
  const admToken: string | undefined = req.cookies?.["adm_token"];
  const token = cusToken ?? admToken;

  if (!token) {
    const body: ApiResponse = { success: false, message: "Authentication required." };
    res.status(401).json(body);
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    const body: ApiResponse = {
      success: false,
      message: "Invalid or expired session. Please log in again.",
    };
    res.status(401).json(body);
  }
}

/**
 * requireAdmin — use after requireAdminAuth, or standalone (reads adm_token).
 * Kept as a shorthand alias.
 */
export const requireAdmin = requireAdminAuth;

/**
 * requireCustomer — use after requireCustomerAuth, or standalone (reads cus_token).
 * Kept as a shorthand alias.
 */
export const requireCustomer = requireCustomerAuth;
