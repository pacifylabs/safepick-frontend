import { create } from "zustand";
import Cookies from "js-cookie";

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: "PARENT" | "DELEGATE" | "SCHOOL_ADMIN";
  phoneVerified?: boolean;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, token: string) => void;
  clearSession: () => void;
  clearMswSession: () => void;
}

export const useAuthStore = create((set: any) => ({
  user: null,
  accessToken: Cookies.get("accessToken") || null,
  isAuthenticated: !!Cookies.get("accessToken"),
  setSession: (user: AuthUser, token: string) => {
    Cookies.set("accessToken", token, { expires: 7 });
    set({ user, accessToken: token, isAuthenticated: true });
  },
  clearSession: () => {
    Cookies.remove("accessToken");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  clearMswSession: () => {
    // Clear both real and demo sessions
    Cookies.remove("accessToken");
    Cookies.remove("delegate-access-token");
    Cookies.remove("safepick_secondary_token");
    set({ user: null, accessToken: null, isAuthenticated: false });
  }
})) as any;
