import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  pageTitle: string;
  rightPanelOpen: boolean;
  selectedChildId: string | null;
  viewMode: "list" | "grid";
  notificationCount: number;
  panicActive: boolean;
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
}

interface UIActions {
  setPageTitle: (title: string) => void;
  openRightPanel: (childId: string) => void;
  closeRightPanel: () => void;
  setViewMode: (mode: "list" | "grid") => void;
  setNotificationCount: (count: number) => void;
  setPanicActive: (active: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create(
  persist(
    (set: any, get: any) => ({
      pageTitle: "Dashboard",
      rightPanelOpen: false,
      selectedChildId: null,
      viewMode: "list",
      notificationCount: 0,
      panicActive: false,
      theme: "system",
      resolvedTheme: "light",

      setPageTitle: (title: string) => set({ pageTitle: title }),
      openRightPanel: (childId: string) => set({ rightPanelOpen: true, selectedChildId: childId }),
      closeRightPanel: () => set({ rightPanelOpen: false, selectedChildId: null }),
      setViewMode: (mode: "list" | "grid") => set({ viewMode: mode }),
      setNotificationCount: (count: number) => set({ notificationCount: count }),
      setPanicActive: (active: boolean) => set({ panicActive: active }),
      setTheme: (theme: "light" | "dark" | "system") => {
        localStorage.setItem("safepick-theme", theme);
        
        let resolved: "light" | "dark" = "light";
        if (theme === "system") {
          resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else {
          resolved = theme;
        }

        if (resolved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

        set({ theme, resolvedTheme: resolved });
      },
    }),
    {
      name: "safepick-ui",
    }
  ) as any
);
