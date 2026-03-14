import { create } from "zustand";

export interface PickupRequest {
  id: string;
  delegateName: string;
  childName: string;
  schoolName: string;
  requestedAt: string;
}

export interface PickupState {
  activePickupRequest: PickupRequest | null;
  timeoutRemaining: number; // seconds
  setActive: (req: PickupRequest | null) => void;
  setTimeoutRemaining: (seconds: number) => void;
}

export const usePickupStore = create((set: any) => ({
  activePickupRequest: null,
  timeoutRemaining: 0,
  setActive: (req: PickupRequest | null) => set({ activePickupRequest: req }),
  setTimeoutRemaining: (seconds: number) => set({ timeoutRemaining: seconds })
}));
