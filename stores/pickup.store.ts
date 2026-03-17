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

export const usePickupStore = create<PickupState>((set) => ({
  activePickupRequest: null,
  activePickupRequestId: null,
  qrOverlayAuthorizationId: null,
  timeoutRemaining: 0,
  setActive: (req) => set({ activePickupRequest: req }),
  setActivePickupRequestId: (id) => set({ activePickupRequestId: id }),
  setQrOverlayAuthorizationId: (id) => set({ qrOverlayAuthorizationId: id }),
  setTimeoutRemaining: (seconds) => set({ timeoutRemaining: seconds }),
}));
