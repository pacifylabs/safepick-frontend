"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  School as SchoolIcon,
  ChevronRight,
  Info,
  Phone
} from "lucide-react";
import { useEmergencyStatus, useTriggerPanic, useDeactivatePanic } from "@/hooks/useEmergency";
import Link from "next/link";

export default function EmergencyPage() {
  const { data: status, isLoading: statusLoading } = useEmergencyStatus();
  const triggerPanic = useTriggerPanic();
  const deactivatePanic = useDeactivatePanic();

  const [panicConfirmStep, setPanicConfirmStep] = useState<"IDLE" | "CONFIRM">("IDLE");
  const [deactivateConfirmStep, setDeactivateConfirmStep] = useState<"IDLE" | "CONFIRM">("IDLE");
  const [countdown, setCountdown] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePanicClick = () => {
    if (panicConfirmStep === "IDLE") {
      setPanicConfirmStep("CONFIRM");
      setCountdown(5);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPanicConfirmStep("IDLE");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setPanicConfirmStep("IDLE");
      triggerPanic.mutate();
    }
  };

  const handleDeactivateClick = () => {
    if (deactivateConfirmStep === "IDLE") {
      setDeactivateConfirmStep("CONFIRM");
      setCountdown(3);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setDeactivateConfirmStep("IDLE");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDeactivateConfirmStep("IDLE");
      deactivatePanic.mutate();
    }
  };

  if (statusLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  const isPanicActive = status?.panicActive || false;

  return (
    <div className={`min-h-full transition-colors duration-500 p-4 md:p-8 ${isPanicActive ? 'bg-[#1A0707]' : 'bg-[var(--bg-page)]'}`}>
      <div className="w-full max-w-8xl mx-auto space-y-8 md:space-y-12">
        {/* HEADER */}
        <div>
          <h1 className={`text-[1.5rem] font-semibold text-[var(--text-primary)] ${isPanicActive ? 'text-white' : 'text-[var(--text-primary)]'}`}>
            Emergency control
          </h1>
          <p className={`text-[0.875rem] text-[var(--text-secondary)] ${isPanicActive ? 'text-white/60' : 'text-[var(--text-secondary)]'}`}>
            Manage critical security alerts and system-wide lockouts.
          </p>
        </div>
      
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[0.875rem] mb-4 md:mb-8">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={`${isPanicActive ? 'text-white' : 'text-[var(--text-primary)]'} font-medium`}>Emergency Controls</span>
        </div>
      
        {/* MAIN ACTION AREA */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 md:gap-12">
          <div className="w-full max-w-[500px] flex flex-col items-center mx-auto lg:mx-0">
            <AnimatePresence mode="wait">
              {!isPanicActive ? (
                <motion.div
                  key="inactive"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[32px] p-6 md:p-10 flex flex-col items-center text-center shadow-sm"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-coral/10 flex items-center justify-center mb-6 md:mb-8">
                    <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-[#D85A30]" />
                  </div>
                  
                  <h3 className="text-[1.25rem] md:text-[1.5rem] font-semibold text-[var(--text-primary)] mb-4">Panic Trigger</h3>
                  <p className="text-sm md:text-base text-[var(--text-secondary)] mb-8 md:mb-10 leading-relaxed">
                    Instantly suspend all delegate authorizations and notify all schools. Use only in case of actual threat.
                  </p>

                  <button
                    onClick={handlePanicClick}
                    className={`relative w-full h-16 md:h-20 rounded-2xl font-display text-lg md:text-xl font-bold transition-all overflow-hidden ${
                      panicConfirmStep === "CONFIRM" 
                        ? "bg-[#D85A30] text-white shadow-lg shadow-coral/20" 
                        : "bg-white/[0.05] border-2 border-[#D85A30] text-[#D85A30] hover:bg-[#D85A30]/5"
                    }`}
                  >
                    {panicConfirmStep === "CONFIRM" ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[0.65rem] md:text-sm uppercase tracking-widest opacity-80">Tap again to confirm</span>
                        <span className="mt-0.5 md:mt-1">ACTIVATE PANIC ({countdown}s)</span>
                      </div>
                    ) : (
                      "TRIGGER SYSTEM PANIC"
                    )}
                    {panicConfirmStep === "CONFIRM" && (
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1.5 bg-white/30"
                      />
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, x: [0, -8, 8, -8, 8, 0] }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full bg-[#1A0707] border-2 border-[#D85A30]/40 rounded-[32px] p-6 md:p-10 flex flex-col items-center text-center shadow-2xl shadow-coral/10"
                >
                  <motion.div 
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#D85A30]/20 flex items-center justify-center mb-6 md:mb-8"
                  >
                    <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-[#D85A30]" />
                  </motion.div>
                  
                  <h3 className="text-[1.5rem] md:text-[1.75rem] font-bold text-white mb-2">PANIC MODE ACTIVE</h3>
                  <p className="text-[#D85A30] font-bold uppercase tracking-widest text-[0.65rem] md:text-[0.75rem] mb-6 md:mb-8">System-wide lockdown engaged</p>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mb-8 md:mb-10">
                    <div className="bg-white/5 rounded-2xl p-3 md:p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-[#D85A30] mb-1 justify-center">
                        <Users className="w-4 h-4" />
                        <span className="text-lg md:text-xl font-bold">{status?.delegatesSuspended || 0}</span>
                      </div>
                      <p className="text-[0.55rem] md:text-[0.65rem] text-white/40 uppercase font-bold tracking-wider">Delegates Suspended</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 md:p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-[#EF9F27] mb-1 justify-center">
                        <SchoolIcon className="w-4 h-4" />
                        <span className="text-lg md:text-xl font-bold">{status?.schoolsNotified || 0}</span>
                      </div>
                      <p className="text-[0.55rem] md:text-[0.65rem] text-white/40 uppercase font-bold tracking-wider">Schools Notified</p>
                    </div>
                  </div>

                  <button
                    onClick={handleDeactivateClick}
                    className={`relative w-full h-14 md:h-16 rounded-2xl font-display text-base md:text-lg font-bold transition-all overflow-hidden ${
                      deactivateConfirmStep === "CONFIRM" 
                        ? "bg-[#0FA37F] text-white" 
                        : "bg-white/10 text-white/60 hover:text-white hover:bg-white/15 border border-white/10"
                    }`}
                  >
                    {deactivateConfirmStep === "CONFIRM" ? (
                      `Tap again to deactivate (${countdown}s)`
                    ) : (
                      "Deactivate Panic Mode"
                    )}
                    {deactivateConfirmStep === "CONFIRM" && (
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 bg-white/30"
                      />
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* EMERGENCY INFO */}
          <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
            <div className={`p-5 md:p-6 rounded-3xl border ${isPanicActive ? 'bg-white/5 border-white/10' : 'bg-[var(--bg-surface)] border-[var(--border)] shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPanicActive ? 'bg-white/10 text-white' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className={`font-bold text-lg ${isPanicActive ? 'text-white' : 'text-[var(--text-primary)]'}`}>Automatic Lockdown</h4>
              </div>
              <p className={`text-sm md:text-[0.875rem] leading-relaxed ${isPanicActive ? 'text-white/60' : 'text-[var(--text-secondary)]'}`}>
                Triggering panic mode instantly invalidates all active QR codes and authorization links. Schools receive an immediate high-priority alert.
              </p>
            </div>

            <div className={`p-5 md:p-6 rounded-3xl border ${isPanicActive ? 'bg-white/5 border-white/10' : 'bg-[var(--bg-surface)] border-[var(--border)] shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPanicActive ? 'bg-white/10 text-white' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'}`}>
                  <Info className="w-6 h-6" />
                </div>
                <h4 className={`font-bold text-lg ${isPanicActive ? 'text-white' : 'text-[var(--text-primary)]'}`}>Verification Required</h4>
              </div>
              <p className={`text-sm md:text-[0.875rem] leading-relaxed ${isPanicActive ? 'text-white/60' : 'text-[var(--text-secondary)]'}`}>
                Deactivating panic mode requires a cooling period. All delegates will remain suspended until you manually re-verify them in the Delegates section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
