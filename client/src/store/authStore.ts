import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AdminUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user: AdminUser) => {
        set({ user, isAuthenticated: true });
      },

      clearAuth: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
