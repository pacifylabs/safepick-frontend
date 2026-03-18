import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { DelegateAccount } from "@/types/delegate.types";

interface DelegateAuthState {
  delegate: DelegateAccount | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setDelegate: (delegate: DelegateAccount) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearDelegate: () => void;
  updateFcmToken: (token: string) => void;
}

export const useDelegateAuthStore = create(
  persist(
    (set: any) => ({
      delegate: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setDelegate: (delegate: DelegateAccount) =>
        set({ delegate, isAuthenticated: !!delegate }),
      setTokens: (accessToken: string, refreshToken: string) => {
        Cookies.set("delegate-access-token", accessToken, { expires: 7 });
        set({ accessToken, refreshToken });
      },
      clearDelegate: () => {
        Cookies.remove("delegate-access-token");
        set({
          delegate: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      updateFcmToken: (fcmToken: string) =>
        set((state: any) => ({
          delegate: state.delegate
            ? { ...state.delegate, fcmToken }
            : null,
        })),
    }),
    {
      name: "delegate-auth-storage",
    }
  ) as any
);
