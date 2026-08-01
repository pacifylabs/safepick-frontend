import { create } from "zustand";
import Cookies from "js-cookie";
import { hasSessionCookie } from "@/lib/session";

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: "PARENT" | "DELEGATE" | "SCHOOL_ADMIN";
  phoneVerified?: boolean;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser) => void;
  markAuthenticated: () => void;
  clearSession: () => void;
  clearMswSession: () => void;
}

/**
 * Holds identity, never credentials.
 *
 * Access and refresh tokens now live in httpOnly cookies the browser attaches
 * on its own, so nothing here is readable by injected script. isAuthenticated
 * is seeded from the readable CSRF cookie purely so the first render does not
 * flash a signed-out state; the server remains the authority.
 */
export const useAuthStore = create((set: any) => ({
  user: null,
  isAuthenticated: hasSessionCookie(),
  setSession: (user: AuthUser) => set({ user, isAuthenticated: true }),
  markAuthenticated: () => set({ isAuthenticated: true }),
  clearSession: () => set({ user: null, isAuthenticated: false }),
  clearMswSession: () => {
    // Legacy demo cookies from before the httpOnly migration.
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("delegate-access-token");
    Cookies.remove("safepick_secondary_token");
    set({ user: null, isAuthenticated: false });
  }
})) as any;
