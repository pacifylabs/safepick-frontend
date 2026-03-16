"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface FallbackBannerProps {
  reason: "QR_EXPIRED" | "QR_INVALID" | "OTP_FAILED" | "BIOMETRIC_FAILED" | "BIOMETRIC_UNSUPPORTED";
  onDismiss: () => void;
}

const messages = {
  QR_EXPIRED: "QR code expired — switching to OTP",
  QR_INVALID: "QR code invalid — switching to OTP",
  OTP_FAILED: "OTP failed — switching to biometric",
  BIOMETRIC_FAILED: "Biometric failed — switching to OTP",
  BIOMETRIC_UNSUPPORTED: "Biometric unavailable — switching to OTP",
};

export function FallbackBanner({ reason, onDismiss }: FallbackBannerProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      className="bg-[#EF9F27] px-8 py-3.5 flex items-center gap-4 z-[60]"
    >
      <AlertTriangle className="w-5 h-5 text-[#0B1A2C]" />
      <p className="font-body text-[#0B1A2C] font-semibold flex-1">
        {messages[reason]}
      </p>
      <button onClick={onDismiss} className="p-1 hover:bg-black/10 rounded-full transition-colors">
        <X className="w-5 h-5 text-[#0B1A2C]" />
      </button>
    </motion.div>
  );
}
