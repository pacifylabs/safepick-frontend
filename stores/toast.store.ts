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

export const useToastStore = create((set: any) => ({
  toasts: [],
  addToast: (toast: any) => {
    const id = crypto.randomUUID();
    set((state: any) => ({
      toasts: [...state.toasts, { ...toast, id, duration: toast.duration ?? 3000 }],
    }));
  },
  removeToast: (id: any) =>
    set((state: any) => ({
      toasts: state.toasts.filter((t: any) => t.id !== id),
    })),
}));
