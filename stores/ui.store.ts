import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  pageTitle: string;
  rightPanelOpen: boolean;
  selectedChildId: string | null;
  viewMode: "list" | "grid";
  notificationCount: number;
  panicActive: boolean;
}

interface UIActions {
  setPageTitle: (title: string) => void;
  openRightPanel: (childId: string) => void;
  closeRightPanel: () => void;
  setViewMode: (mode: "list" | "grid") => void;
  setNotificationCount: (count: number) => void;
  setPanicActive: (active: boolean) => void;
}

export const useUIStore = create(
  persist(
    (set: any) => ({
      pageTitle: "Dashboard",
      rightPanelOpen: false,
      selectedChildId: null,
      viewMode: "list",
      notificationCount: 0,
      panicActive: false,

      setPageTitle: (title: string) => set({ pageTitle: title }),
      openRightPanel: (childId: string) => set({ rightPanelOpen: true, selectedChildId: childId }),
      closeRightPanel: () => set({ rightPanelOpen: false, selectedChildId: null }),
      setViewMode: (mode: "list" | "grid") => set({ viewMode: mode }),
      setNotificationCount: (count: number) => set({ notificationCount: count }),
      setPanicActive: (active: boolean) => set({ panicActive: active }),
    }),
    {
      name: "safepick-ui",
    }
  ) as any
);
