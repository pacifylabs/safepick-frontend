import { create } from "zustand";
import { ReactNode } from "react";

export type ToastVariant = "success" | "warning" | "danger" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  icon?: ReactNode;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id, duration: toast.duration ?? 3000 }],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
