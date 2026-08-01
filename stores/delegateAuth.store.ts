import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DelegateAccount } from "@/types/delegate.types";
import { hasSessionCookie } from "@/lib/session";

interface DelegateAuthState {
  delegate: DelegateAccount | null;
  isAuthenticated: boolean;
  setDelegate: (delegate: DelegateAccount) => void;
  markAuthenticated: () => void;
  clearDelegate: () => void;
  updateFcmToken: (token: string) => void;
}

/**
 * Holds the delegate profile, never credentials. Tokens were previously
 * persisted here (localStorage via `persist`, plus a readable cookie), which
 * put a 7-day refresh token within reach of any injected script; they now
 * live in httpOnly cookies instead.
 */
export const useDelegateAuthStore = create(
  persist(
    (set: any) => ({
      delegate: null,
      isAuthenticated: false,
      setDelegate: (delegate: DelegateAccount) =>
        set({ delegate, isAuthenticated: !!delegate }),
      markAuthenticated: () => set({ isAuthenticated: hasSessionCookie() }),
      clearDelegate: () =>
        set({
          delegate: null,
          isAuthenticated: false,
        }),
      updateFcmToken: (fcmToken: string) =>
        set((state: any) => ({
          delegate: state.delegate
            ? { ...state.delegate, fcmToken }
            : null,
        })),
    }),
    {
      name: "delegate-auth-storage",
      // Profile only. Credentials must never reach localStorage.
      partialize: (state: any) => ({ delegate: state.delegate }),
    }
  ) as any
);
