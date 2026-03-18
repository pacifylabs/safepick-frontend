"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  ShieldX, 
  User, 
  Phone, 
  Loader2,
  AlertTriangle,
  MapPin,
  QrCode,
  Smartphone,
  Fingerprint,
  XCircle,
  History
} from "lucide-react";
import { 
  useSecondaryPickupRequest, 
  useRespondAsSecondary 
} from "@/hooks/useSecondaryGuardian";
import { useSecondaryAuthStore } from "@/stores/secondaryAuth.store";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { format } from "date-fns";

export default function SecondaryPickupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { secondaryGuardian } = useSecondaryAuthStore();
  const { data: request, isLoading, error } = useSecondaryPickupRequest(id);
  const respondMutation = useRespondAsSecondary();

  const [decision, setDecision] = useState<"APPROVE" | "DENY" | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState<"APPROVE" | "DENY" | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  const handleStartHold = (type: "APPROVE" | "DENY") => {
    if (respondMutation.isPending || decision) return;
    setHolding(type);
    setHoldProgress(0);
    holdInterval.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdInterval.current!);
          handleRespond(type);
          return 100;
        }
        return prev + 5; // 100% in 500ms (20 steps of 25ms)
      });
    }, 25);
  };

  const handleStopHold = () => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    setHolding(null);
    setHoldProgress(0);
  };

  const handleRespond = async (choice: "APPROVE" | "DENY") => {
    try {
      await respondMutation.mutateAsync({ id, decision: choice });
      setDecision(choice);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1A2C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#0B1A2C] flex flex-col items-center justify-center px-6 text-center">
        <ShieldX className="w-16 h-16 text-[#D85A30] mb-6" />
        <h1 className="font-display text-[1.75rem] text-white mb-3">Link expired or invalid</h1>
        <p className="font-body text-[0.875rem] text-white/50 max-w-[300px] leading-relaxed mb-8">
          The pickup request window has closed or the link is invalid. Check your history for past authorizations.
        </p>
        <Button variant="ghost" onClick={() => router.push("/secondary/history")} className="text-[#0FA37F]">
          View history
        </Button>
      </div>
    );
  }

  // Handle post-response states
  const isApproved = decision === "APPROVE" || request.status === "APPROVED" || request.status === "APPROVED_VIA_OVERRIDE";
  const isDenied = decision === "DENY" || request.status === "DENIED";

  if (isApproved) {
    return (
      <div className="min-h-screen bg-[#0B1A2C] flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <CheckCircle className="w-20 h-20 text-[#0FA37F] mx-auto" />
        </motion.div>
        <h1 className="font-display text-[2rem] text-white mt-6 mb-3">
          Release approved
        </h1>
        <p className="font-body text-[0.875rem] text-white/50 max-w-[280px] mx-auto leading-relaxed mb-12">
          The school has been notified. {request.delegate.fullName} can now collect {request.child.fullName}.
        </p>
        <Button variant="ghost" onClick={() => router.push("/secondary/history")} className="text-white/40 gap-2">
          <History className="w-4 h-4" />
          View pickup history
        </Button>
      </div>
    );
  }

  if (isDenied) {
    return (
      <div className="min-h-screen bg-[#0B1A2C] flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <XCircle className="w-20 h-20 text-[#D85A30] mx-auto" />
        </motion.div>
        <h1 className="font-display text-[2rem] text-white mt-6 mb-3 text-[#D85A30]">
          Release denied
        </h1>
        <p className="font-body text-[0.875rem] text-white/50 max-w-[280px] mx-auto leading-relaxed mb-12">
          The school has been alerted not to release {request.child.fullName}. A security incident has been filed.
        </p>
        <Button variant="ghost" onClick={() => router.push("/secondary/history")} className="text-white/40 gap-2">
          <History className="w-4 h-4" />
          View pickup history
        </Button>
      </div>
    );
  }

  return (
    <main className="bg-[#0B1A2C] min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] mx-auto flex flex-col items-center"
      >
        <Logo variant="light" size="sm" className="mb-8" />
        
        <span className="font-body text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#0FA37F] mb-3">
          PICKUP APPROVAL REQUEST
        </span>
        
        <h1 className="font-display text-[2rem] font-semibold text-white text-center leading-[1.08] tracking-[-0.03em] mb-2">
          Decision needed
        </h1>
        
        <p className="font-body text-[0.875rem] text-white/50 text-center leading-relaxed mb-8">
          The primary parent did not respond. Your decision is needed now.
        </p>

        {/* Countdown Timer */}
        <div className="flex flex-col items-center mb-10">
          <motion.p 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className={`font-display text-[4rem] font-semibold text-center leading-none ${
              request.secondsRemaining < 15 ? "text-[#D85A30]" : 
              request.secondsRemaining < 60 ? "text-[#EF9F27]" : "text-white"
            }`}
          >
            {Math.floor(request.secondsRemaining / 60)}:{(request.secondsRemaining % 60).toString().padStart(2, "0")}
          </motion.p>
          <p className="font-body text-[0.72rem] uppercase tracking-widest text-white/30 mt-2 font-bold">TIME REMAINING</p>
        </div>

        {/* Content Cards */}
        <div className="w-full space-y-4 mb-10">
          {/* Delegate Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-xl font-bold overflow-hidden border border-white/10">
                {request.delegate.photoUrl ? (
                  <img src={request.delegate.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  request.delegate.fullName[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[0.68rem] uppercase tracking-widest text-white/40 mb-1 font-bold">COLLECTING</p>
                <p className="font-display text-[1.125rem] font-semibold text-white truncate">{request.delegate.fullName}</p>
                <div className="inline-block bg-white/10 rounded-full px-3 py-1 mt-1">
                  <p className="font-body text-[0.72rem] text-white/60">{request.delegate.relationship}</p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#0FA37F]" />
            </div>
          </div>

          {/* Child + School Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#0FA37F]/20 flex items-center justify-center text-[#0FA37F] font-bold border border-[#0FA37F]/20">
                {request.child.fullName[0]}
              </div>
              <div>
                <p className="font-body text-[0.875rem] font-medium text-white">{request.child.fullName}</p>
                <p className="font-body text-[0.75rem] text-white/50">{request.child.grade}</p>
              </div>
            </div>
            <div className="h-px bg-white/10 mb-3" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/30" />
              <p className="font-body text-[0.82rem] text-white/60 truncate">
                {request.school.name} &middot; {request.school.address}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-fit mx-auto">
            {request.verificationMethod === "QR" && <QrCode className="w-4 h-4 text-[#0FA37F]" />}
            {request.verificationMethod === "OTP" && <Smartphone className="w-4 h-4 text-[#0FA37F]" />}
            {request.verificationMethod === "BIOMETRIC" && <Fingerprint className="w-4 h-4 text-[#0FA37F]" />}
            <p className="font-body text-[0.72rem] text-white/50">
              Verified via {request.verificationMethod}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          {/* Approve Button */}
          <div className="relative overflow-hidden rounded-full">
            <button
              className={`w-full py-4 rounded-full font-body text-[1rem] font-medium transition-all duration-200 h-16 ${
                respondMutation.isPending ? "bg-[#0FA37F]/50 cursor-not-allowed" : "bg-[#0FA37F] text-white"
              }`}
              onMouseDown={() => handleStartHold("APPROVE")}
              onMouseUp={handleStopHold}
              onMouseLeave={handleStopHold}
              onTouchStart={() => handleStartHold("APPROVE")}
              onTouchEnd={handleStopHold}
              disabled={respondMutation.isPending}
            >
              {respondMutation.isPending && holding === "APPROVE" ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Approving...</span>
                </div>
              ) : (
                "Approve release"
              )}
            </button>
            {holding === "APPROVE" && (
              <div 
                className="absolute bottom-0 left-0 h-1.5 bg-white/30 transition-all duration-25" 
                style={{ width: `${holdProgress}%` }}
              />
            )}
          </div>

          {/* Deny Button */}
          <div className="relative overflow-hidden rounded-full">
            <button
              className={`w-full py-4 rounded-full font-body text-[1rem] font-medium border transition-all duration-200 h-16 ${
                respondMutation.isPending ? "border-[#D85A30]/10 text-[#D85A30]/50 cursor-not-allowed" : "bg-[#D85A30]/10 border-[#D85A30]/30 text-[#D85A30]"
              }`}
              onMouseDown={() => handleStartHold("DENY")}
              onMouseUp={handleStopHold}
              onMouseLeave={handleStopHold}
              onTouchStart={() => handleStartHold("DENY")}
              onTouchEnd={handleStopHold}
              disabled={respondMutation.isPending}
            >
              {respondMutation.isPending && holding === "DENY" ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Denying...</span>
                </div>
              ) : (
                "Deny release"
              )}
            </button>
            {holding === "DENY" && (
              <div 
                className="absolute bottom-0 left-0 h-1.5 bg-[#D85A30]/30 transition-all duration-25" 
                style={{ width: `${holdProgress}%` }}
              />
            )}
          </div>

          <p className="font-body text-[0.65rem] text-white/25 text-center mt-1 uppercase tracking-widest font-bold">
            Hold either button for 0.5s to confirm
          </p>

          {respondMutation.isError && (
            <div className="bg-[#D85A30]/10 border border-[#D85A30]/30 rounded-xl p-3 mt-2 text-center">
              <p className="font-body text-[0.74rem] text-[#D85A30]">
                Something went wrong. Please try again.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
