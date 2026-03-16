"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scan, 
  Search, 
  Loader2, 
  ShieldAlert, 
  ArrowLeft,
  ShieldX
} from "lucide-react";
import { useScanQr } from "@/hooks/useVerification";
import { useVerificationStore } from "@/stores/verification.store";
import { GateSessionView } from "@/components/gate/GateSessionView";
import { Button } from "@/components/ui/Button";

export default function GatePage() {
  const { 
    activeSession, 
    setSession, 
    currentStep, 
    setCurrentStep, 
    resetSession 
  } = useVerificationStore();

  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isViolation, setIsViolation] = useState(false);
  
  const scanQr = useScanQr();

  const handleScan = async (payload: string) => {
    try {
      setError(null);
      const session = await scanQr.mutateAsync({ qrPayload: payload });
      setSession(session);
      setCurrentStep("IDENTITY_CONFIRMED");
    } catch (err: any) {
      if (err.error === "AUTHORIZATION_RULES_VIOLATED") {
        setIsViolation(true);
      } else {
        setError(err.message || "Invalid or expired QR code");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) handleScan(manualCode.toUpperCase());
  };

  if (isViolation) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-[#0B1A2C] flex flex-col items-center justify-center p-12 text-center"
      >
        <div className="w-32 h-32 rounded-3xl bg-[#D85A30]/10 flex items-center justify-center mb-8">
          <ShieldX className="w-20 h-20 text-[#D85A30]" />
        </div>
        <h1 className="font-display text-5xl font-semibold text-white mb-4 tracking-tight">Access not permitted</h1>
        <p className="text-white/60 text-2xl max-w-2xl leading-relaxed mb-8">
          This delegate is not authorized for pickup at this time based on the security rules set by the parent.
        </p>
        <div className="bg-[#D85A30]/20 border border-[#D85A30]/30 rounded-2xl p-6 mb-12 flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-[#D85A30]" />
          <p className="text-[#D85A30] text-xl font-bold uppercase tracking-wider">Do not release child</p>
        </div>
        <Button variant="ghost" className="text-white/40 hover:text-white text-xl" onClick={() => setIsViolation(false)}>
          <ArrowLeft className="mr-3" />
          Back to scanner
        </Button>
      </motion.div>
    );
  }

  if (activeSession) {
    return <GateSessionView session={activeSession} onSessionEnd={resetSession} />;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-12 relative">
      <div className="max-w-[600px] w-full text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/50 text-2xl mb-12 font-medium"
        >
          Scan delegate QR code to begin verification
        </motion.p>

        {/* SCANNER FRAME */}
        <div className="relative inline-block mb-16">
          <motion.div 
            animate={{ 
              boxShadow: scanQr.isPending 
                ? "0 0 0 0px rgba(15, 163, 127, 0)" 
                : ["0 0 0 0px rgba(15, 163, 127, 0.1)", "0 0 0 20px rgba(15, 163, 127, 0)"] 
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-[400px] h-[400px] bg-black/40 rounded-[40px] border-2 border-white/5 relative overflow-hidden flex items-center justify-center group cursor-pointer"
            onClick={() => handleScan("vsn_01HXYZ_valid")}
          >
            {/* L-Brackets */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#0FA37F] rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#0FA37F] rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#0FA37F] rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#0FA37F] rounded-br-lg" />

            <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center">
              <Scan className="w-12 h-12 text-white/10 group-hover:text-white/20 transition-colors" />
            </div>

            {/* Scanning line */}
            {!scanQr.isPending && (
              <motion.div 
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#0FA37F] to-transparent z-10"
              />
            )}

            {/* Overlay for Scanning State */}
            <AnimatePresence>
              {scanQr.isPending && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#0B1A2C]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20"
                >
                  <Loader2 className="w-12 h-12 text-[#0FA37F] animate-spin" />
                  <p className="text-[#0FA37F] font-bold uppercase tracking-widest text-sm">Processing...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error state */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-[#D85A30]/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-30"
                >
                  <ShieldAlert className="w-16 h-16 text-white mb-4" />
                  <p className="text-white text-xl font-bold leading-tight">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#0FA37F] animate-pulse" />
            <span className="text-white/30 uppercase tracking-[0.2em] font-bold text-xs">Scanner Active</span>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-12">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-white/20 uppercase font-bold tracking-widest text-sm">or enter code</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <form onSubmit={handleManualSubmit} className="flex gap-4 max-w-[480px] mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
            <input 
              type="text" 
              placeholder="Authorization ID"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full h-20 pl-16 pr-6 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-2xl font-display outline-none focus:border-[#0FA37F] transition-all placeholder:text-white/10 uppercase"
            />
          </div>
          <Button 
            variant="primary" 
            type="submit"
            className="h-20 px-10 rounded-2xl text-xl"
            disabled={!manualCode || scanQr.isPending}
          >
            Find
          </Button>
        </form>
      </div>
    </div>
  );
}
