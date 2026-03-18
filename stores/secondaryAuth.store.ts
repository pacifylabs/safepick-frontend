import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { SecondaryGuardianAccount } from "@/types/secondaryGuardian.types";

interface SecondaryAuthState {
  secondaryGuardian: SecondaryGuardianAccount | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  pendingPickupRequestId: string | null;
  setSecondaryGuardian: (
    guardian: SecondaryGuardianAccount,
    tokens: { accessToken: string; refreshToken: string },
    pendingId?: string | null
  ) => void;
  clearSecondaryGuardian: () => void;
}

export const useSecondaryAuthStore = create(
  persist(
    (set: any) => ({
      secondaryGuardian: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      pendingPickupRequestId: null,
      setSecondaryGuardian: (
        guardian: SecondaryGuardianAccount,
        tokens: { accessToken: string; refreshToken: string },
        pendingId: string | null = null
      ) => {
        Cookies.set("safepick_secondary_token", tokens.accessToken, { expires: 7 });
        set({
          secondaryGuardian: guardian,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          pendingPickupRequestId: pendingId,
        });
      },
      clearSecondaryGuardian: () => {
        Cookies.remove("safepick_secondary_token");
        set({
          secondaryGuardian: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          pendingPickupRequestId: null,
        });
      },
    }),
    {
      name: "secondary-auth-storage",
    }
  ) as any
);
