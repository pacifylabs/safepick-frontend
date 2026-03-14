import { create } from "zustand";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  variant?: "info" | "warning" | "danger";
}

export interface AlertState {
  queue: NotificationItem[];
  push: (n: NotificationItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useAlertStore = create((set: any, get: any) => ({
  queue: [],
  push: (n: NotificationItem) => set({ queue: [...get().queue, n] }),
  remove: (id: string) =>
    set({ queue: get().queue.filter((n: NotificationItem) => n.id !== id) }),
  clear: () => set({ queue: [] })
}));
