"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { useEmergencyStore } from "@/stores/emergency.store";
import { useCancelSos } from "@/hooks/useEmergency";

export const SosNotificationBanner = () => {
  const activeSosId = useEmergencyStore((state: any) => state.activeSosId);
  const cancelSos = useCancelSos();

  if (!activeSosId) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-[#D85A30] text-white overflow-hidden sticky top-0 z-[60]"
    >
      <div className="px-6 py-3 flex items-center justify-between gap-4 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ShieldAlert className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <p className="font-display font-bold text-[0.875rem] uppercase tracking-wider">
              SOS ALERT ACTIVE
            </p>
            <p className="text-[0.75rem] opacity-90">
              Emergency services and guardians have been notified of your location.
            </p>
          </div>
        </div>

        <button
          onClick={() => cancelSos.mutate()}
          disabled={cancelSos.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-[0.75rem] font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {cancelSos.isPending ? "Cancelling..." : "Cancel Alert"}
        </button>
      </div>
    </motion.div>
  );
};
