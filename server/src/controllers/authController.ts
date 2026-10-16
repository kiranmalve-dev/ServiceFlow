import type { Request, Response } from "express";
import { loginUser } from "../services/authService.js";
import type { LoginBody, ApiResponse } from "../types/index.js";
import type { Portal } from "../validators/authValidator.js";

const IS_PRODUCTION = process.env["NODE_ENV"] === "production";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const PORTAL_MISMATCH_MSG =
  "Access denied. You are not authorised to log in through this portal."

export const COOKIE_NAME: Record<Portal, string> = {
  customer: "cus_token",
  admin:    "adm_token",
};

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password, portal } = req.body as LoginBody;
  try {
    const { token, user } = await loginUser(email, password, portal);
    const cookieName = COOKIE_NAME[portal];
    res.cookie(cookieName, token, {
      httpOnly: true,                              
      secure: IS_PRODUCTION,                       
      sameSite: IS_PRODUCTION ? "strict" : "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    const body: ApiResponse<typeof user> = {
      success: true,
      message: "Login successful.",
      data: user,
    };

    res.status(200).json(body);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";

    const body: ApiResponse = { success: false, message };

    let status = 500;
    if (message === "Invalid email or password.") status = 401;
    if (message === PORTAL_MISMATCH_MSG)          status = 403;

    res.status(status).json(body);
  }
}

export function logout(req: Request, res: Response): void {
  // Clear whichever portal cookie is present in this request.
  const cookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? ("strict" as const) : ("lax" as const),
    path: "/",
  };

  // Clear both so a single /logout call cleans up regardless of which portal
  // the client is logged into (e.g. a browser with two tabs).
  if (req.cookies?.["cus_token"]) res.clearCookie("cus_token", cookieOptions);
  if (req.cookies?.["adm_token"]) res.clearCookie("adm_token", cookieOptions);

  const body: ApiResponse = { success: true, message: "Logged out successfully." };
  res.status(200).json(body);
}
