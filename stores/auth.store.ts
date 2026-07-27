import { create } from "zustand";
import Cookies from "js-cookie";

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
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, token: string, refreshToken?: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  clearMswSession: () => void;
}

export const useAuthStore = create((set: any) => ({
  user: null,
  accessToken: Cookies.get("accessToken") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  isAuthenticated: !!Cookies.get("accessToken"),
  setSession: (user: AuthUser, token: string, refreshToken?: string) => {
    Cookies.set("accessToken", token, { expires: 7, sameSite: "strict" });
    if (refreshToken) {
      Cookies.set("refreshToken", refreshToken, { expires: 7, sameSite: "strict" });
    }
    set({
      user,
      accessToken: token,
      ...(refreshToken ? { refreshToken } : {}),
      isAuthenticated: true
    });
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set("accessToken", accessToken, { expires: 7, sameSite: "strict" });
    Cookies.set("refreshToken", refreshToken, { expires: 7, sameSite: "strict" });
    set({ accessToken, refreshToken, isAuthenticated: true });
  },
  clearSession: () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
  clearMswSession: () => {
    // Clear both real and demo sessions
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("delegate-access-token");
    Cookies.remove("safepick_secondary_token");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  }
})) as any;
