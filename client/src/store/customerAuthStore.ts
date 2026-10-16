import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * WHY WE DON'T WRITE COOKIES HERE
 * ─────────────────────────────────
 * The backend sets an HttpOnly cookie named `cus_token` in the Set-Cookie
 * response header when the customer logs in.  HttpOnly cookies:
 *   - are stored and sent automatically by the browser on every request
 *   - cannot be read or written by JavaScript (document.cookie / js-cookie)
 *
 * The previous store wrote `customer_token` via js-cookie — a different name
 * that the backend never reads.  Every subsequent authenticated request got
 * 401 because `cus_token` was missing from the cookie jar.
 *
 * The correct pattern for HttpOnly cookies:
 *   - login  → backend sets `cus_token` via Set-Cookie header (automatic)
 *   - logout → call POST /auth/logout so the backend clears `cus_token`
 *   - this store holds only the user object for UI display
 */

export interface CustomerUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface CustomerAuthState {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  setAuth: (user: CustomerUser) => void;
  clearAuth: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user: CustomerUser) => {
        set({ user, isAuthenticated: true });
      },
      clearAuth: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "customer-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
