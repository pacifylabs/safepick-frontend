import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SosAlert } from "@/types/emergency.types";

interface EmergencyState {
  panicActive: boolean;
  activeSosId: string | null;
  activeSosAlert: SosAlert | null;
  
  setPanicActive: (active: boolean) => void;
  setActiveSosId: (id: string | null) => void;
  setActiveSosAlert: (alert: SosAlert | null) => void;
  resetEmergency: () => void;
}

export const useEmergencyStore = create((set: any) => ({
  panicActive: false,
  activeSosId: null,
  activeSosAlert: null,

  setPanicActive: (active: boolean) => set({ panicActive: active }),
  setActiveSosId: (id: string | null) => set({ activeSosId: id }),
  setActiveSosAlert: (alert: SosAlert | null) => set({ activeSosAlert: alert }),
  
  resetEmergency: () => set({ 
    panicActive: false, 
    activeSosId: null, 
    activeSosAlert: null 
  }),
})) as any;
