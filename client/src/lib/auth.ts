/**
 * Shared login API function.
 *
 * The backend:
 *  - Sets an HttpOnly cookie (`cus_token` or `adm_token`) in the Set-Cookie header.
 *  - Returns { success, message, data: { id, email, name, role } } in the body.
 *    NOTE: no `token` field in the body — the token lives only in the HttpOnly cookie.
 *  - Returns 403 when the account role doesn't match the requested portal.
 *  - Returns 401 for invalid credentials.
 */

import api, { type ApiErrorResponse } from "@/src/lib/axiosIntercepter";

export type { ApiErrorResponse };

// ── Types ─────────────────────────────────────────────────────────────────────

export type LoginPortal = "customer" | "admin";

/** Matches the `data` field returned by POST /auth/login */
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

/** Full response shape from POST /auth/login */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
  portal: LoginPortal;
}

// ── Portal mismatch messages ──────────────────────────────────────────────────

const PORTAL_MISMATCH: Record<LoginPortal, string> = {
  customer: "This account does not have customer access. Please use the Admin portal.",
  admin:    "This account does not have admin access. Please use the Customer portal.",
};

// ── loginWithPortal ───────────────────────────────────────────────────────────

export async function loginWithPortal(payload: LoginPayload): Promise<LoginResponse> {
  try {
    // withCredentials: true is set on the axios instance, so the browser
    // will store the HttpOnly cookie from the Set-Cookie response header.
    return await api.post<LoginResponse>("/auth/login", payload);
  } catch (err) {
    const apiErr = err as ApiErrorResponse;
    if (apiErr.status === 403) {
      throw { ...apiErr, message: PORTAL_MISMATCH[payload.portal] } satisfies ApiErrorResponse;
    }
    throw apiErr;
  }
}

export async function logout(){
  try {
     return await api.post<LoginResponse>("/auth/logout");
  } catch (err) {
    const apiErr = err as ApiErrorResponse;
    if (apiErr.status === 403) {
      // throw { ...apiErr, message: PORTAL_MISMATCH[payload.portal] } satisfies ApiErrorResponse;
    }
    throw apiErr;
  }
}
