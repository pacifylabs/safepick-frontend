import { create } from "zustand";

export interface PickupRequestShort {
  id: string;
  delegateName: string;
  childName: string;
  schoolName: string;
  requestedAt: string;
}

export interface PickupState {
  activePickupRequest: PickupRequestShort | null;
  activePickupRequestId: string | null;
  qrOverlayAuthorizationId: string | null;
  timeoutRemaining: number; // seconds
  setActive: (req: PickupRequestShort | null) => void;
  setActivePickupRequestId: (id: string | null) => void;
  setQrOverlayAuthorizationId: (id: string | null) => void;
  setTimeoutRemaining: (seconds: number) => void;
}

export const usePickupStore = create((set: any) => ({
  activePickupRequest: null,
  activePickupRequestId: null,
  qrOverlayAuthorizationId: null,
  timeoutRemaining: 0,
  setActive: (req: PickupRequestShort | null) => set({ activePickupRequest: req }),
  setActivePickupRequestId: (id: string | null) => set({ activePickupRequestId: id }),
  setQrOverlayAuthorizationId: (id: string | null) => set({ qrOverlayAuthorizationId: id }),
  setTimeoutRemaining: (seconds: number) => set({ timeoutRemaining: seconds }),
}));
