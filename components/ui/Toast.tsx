"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToastStore, Toast as ToastType } from "@/stores/toast.store";
import { useEffect } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const variantStyles = {
  success: "bg-[#0B1A2C] text-white",
  warning: "bg-[#FAEEDA] text-[#0B1A2C]",
  danger: "bg-[#FAECE7] text-[#0B1A2C]",
  info: "bg-[#0B1A2C] text-white",
};

const iconStyles = {
  success: "text-[#0FA37F]",
  warning: "text-[#EF9F27]",
  danger: "text-[#D85A30]",
  info: "text-white/70",
};

const icons = {
  success: CheckCircle,
  warning: AlertCircle,
  danger: AlertTriangle,
  info: Info,
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-[400px] px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const Icon = icons[toast.variant];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -20, opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-lg min-w-[280px] pointer-events-auto ${variantStyles[toast.variant]}`}
    >
      {toast.icon || <Icon className={`w-5 h-5 flex-shrink-0 ${iconStyles[toast.variant]}`} />}
      <p className="font-body text-[0.875rem] font-medium leading-tight">
        {toast.message}
      </p>
    </motion.div>
  );
}
