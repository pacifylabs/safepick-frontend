"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  ShieldX, 
  ShieldCheck, 
  MapPin, 
  QrCode, 
  Smartphone, 
  Fingerprint, 
  AlertTriangle,
  XCircle,
  User,
  Loader2
} from "lucide-react";
import { 
  useValidateSecondaryToken, 
  useRespondAsSecondary 
} from "@/hooks/useOverride";
import { Logo } from "@/components/ui/Logo";
import { format } from "date-fns";

export default function SecondaryGuardianPage() {
  const { token } = useParams<{ token: string }>();
  const { data: request, isLoading, error, refetch } = useValidateSecondaryToken(token);
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
      await respondMutation.mutateAsync({ token, decision: choice });
      setDecision(choice);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="full-viewport bg-[#0B1A2C] flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin text-white" />
      </div>
    );
  }

  // Handle specific error states from the validate endpoint
  const errorMsg = error instanceof Error ? error.message : "";
  
  if (errorMsg === "TOKEN_EXPIRED") {
    return (
      <div className="full-viewport bg-[#0B1A2C] flex flex-col items-center justify-center min-h-screen px-6">
        <Clock className="w-16 h-16 text-[#EF9F27] mb-6" />
        <h1 className="font-display text-[1.75rem] font-semibold text-white text-center mb-3">This link has expired</h1>
        <p className="font-body text-[0.875rem] text-white/50 text-center max-w-[300px] leading-relaxed">
          The time window for this pickup request has passed. Contact the school directly for assistance.
        </p>
        <div className="absolute bottom-8">
          <p className="font-body text-[0.65rem] text-white/20 text-center">SafePick · Child Safety Platform</p>
        </div>
      </div>
    );
  }

  if (errorMsg === "TOKEN_ALREADY_USED") {
    return (
      <div className="full-viewport bg-[#0B1A2C] flex flex-col items-center justify-center min-h-screen px-6">
        <CheckCircle className="w-16 h-16 text-[#0FA37F] mb-6" />
        <h1 className="font-display text-[1.75rem] font-semibold text-white text-center mb-3">Already responded</h1>
        <p className="font-body text-[0.875rem] text-white/50 text-center max-w-[300px] leading-relaxed">
          Your response has been recorded. The school and parent have been notified.
        </p>
        <div className="absolute bottom-8">
          <p className="font-body text-[0.65rem] text-white/20 text-center">SafePick · Child Safety Platform</p>
        </div>
      </div>
    );
  }

  if (error || !request || !request.valid) {
    return (
      <div className="full-viewport bg-[#0B1A2C] flex flex-col items-center justify-center min-h-screen px-6">
        <ShieldX className="w-16 h-16 text-[#D85A30] mb-6" />
        <h1 className="font-display text-[1.75rem] font-semibold text-white text-center mb-3">Invalid link</h1>
        <p className="font-body text-[0.875rem] text-white/50 text-center max-w-[300px] leading-relaxed">
          This link is not valid. If you received an SMS from SafePick, please use the original link.
        </p>
        <div className="absolute bottom-8">
          <p className="font-body text-[0.65rem] text-white/20 text-center">SafePick · Child Safety Platform</p>
        </div>
      </div>
    );
  }

  // Handle successful response states
  if (decision === "APPROVE") {
    return (
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="full-viewport bg-[#0B1A2C] flex flex-col items-center justify-center min-h-screen px-8"
      >
        <div className="text-center gap-4 py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <CheckCircle className="w-16 h-16 text-[#0FA37F] mx-auto" />
          </motion.div>
          <h1 className="font-display text-[1.75rem] font-semibold text-white mt-2">Release approved</h1>
          <p className="font-body text-[0.875rem] text-white/50 max-w-[280px] leading-relaxed mx-auto mt-2">
            School has been notified. {request.delegate.fullName} can collect {request.child.fullName}.
          </p>
          <div className="bg-white/5 rounded-2xl p-4 w-full max-w-[320px] mt-6 space-y-2 text-left mx-auto">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/30" />
              <p className="font-body text-[0.875rem] text-white/70">Approved at {format(new Date(), "h:mm a")}</p>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-white/30" />
              <p className="font-body text-[0.875rem] text-white/70">Secondary guardian response</p>
            </div>
          </div>
          <p className="font-body text-[0.75rem] text-white/25 text-center mt-6">
            The parent has been notified of your decision.
          </p>
          <p className="font-body text-[0.72rem] text-white/15 text-center mt-8">
            You may close this page.
          </p>
        </div>
      </motion.div>
    );
  }

  if (decision === "DENY") {
    return (
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="full-viewport bg-[#0B1A2C] flex flex-col items-center justify-center min-h-screen px-8"
      >
        <div className="text-center gap-4 py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <XCircle className="w-16 h-16 text-[#D85A30] mx-auto" />
          </motion.div>
          <h1 className="font-display text-[1.75rem] font-semibold text-white mt-2">Release denied</h1>
          <p className="font-body text-[0.875rem] text-white/50 max-w-[280px] leading-relaxed mx-auto mt-2">
            School has been notified not to release {request.child.fullName}.
          </p>
          <div className="bg-white/5 rounded-2xl p-4 w-full max-w-[320px] mt-6 space-y-2 text-left mx-auto">
            <div className="flex items-center gap-2 text-[#D85A30]">
              <AlertTriangle className="w-4 h-4" />
              <p className="font-body text-[0.875rem]">Incident reported to school</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/30" />
              <p className="font-body text-[0.875rem] text-white/70">Denied at {format(new Date(), "h:mm a")}</p>
            </div>
          </div>
          <p className="font-body text-[0.75rem] text-white/25 text-center mt-6">
            The parent has been notified of your decision.
          </p>
          <p className="font-body text-[0.72rem] text-white/15 text-center mt-8">
            You may close this page.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="full-viewport bg-[#0B1A2C] min-h-screen"
    >
      {/* TOP SECTION */}
      <div className="bg-[#0F2235] px-6 pt-10 pb-6">
        <div className="flex justify-center mb-6">
          <Logo variant="light" size="md" />
        </div>
        
        <p className="font-body text-[0.68rem] uppercase tracking-[0.1em] text-[#0FA37F] text-center mb-4 font-bold">
          PICKUP APPROVAL REQUEST
        </p>

        <div className="flex flex-col items-center mb-2">
          <p className="font-body text-[0.72rem] uppercase tracking-widest text-white/30 mb-1 font-bold">TIME REMAINING</p>
          <motion.p 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`font-display text-[2.5rem] font-semibold text-center ${
              request.secondsRemaining < 15 ? "text-[#D85A30]" : 
              request.secondsRemaining < 60 ? "text-[#EF9F27]" : "text-white"
            }`}
          >
            {Math.floor(request.secondsRemaining / 60)}:{(request.secondsRemaining % 60).toString().padStart(2, "0")}
          </motion.p>
        </div>

        <p className="font-body text-[0.75rem] text-white/30 text-center max-w-[260px] mx-auto">
          The primary parent did not respond. Your decision is needed now.
        </p>
      </div>

      {/* MIDDLE SECTION */}
      <div className="px-6 py-6">
        {/* Delegate Card */}
        <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
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
        <div className="bg-white/5 rounded-2xl p-4 mb-2 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#0FA37F]/20 flex items-center justify-center text-[#0FA37F] font-bold">
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
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 w-fit mx-auto mt-2 border border-white/5">
          {request.verificationMethod === "QR" && <QrCode className="w-4 h-4 text-[#0FA37F]" />}
          {request.verificationMethod === "OTP" && <Smartphone className="w-4 h-4 text-[#0FA37F]" />}
          {request.verificationMethod === "BIOMETRIC" && <Fingerprint className="w-4 h-4 text-[#0FA37F]" />}
          <p className="font-body text-[0.72rem] text-white/50">
            Verified via {request.verificationMethod}
          </p>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="px-6 pb-10 pt-4 flex flex-col gap-3">
        {/* Approve Button */}
        <div className="relative overflow-hidden rounded-full">
          <button
            className={`w-full py-4 rounded-full font-body text-[0.9375rem] font-medium transition-all duration-200 ${
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
                <Loader2 className="w-4 h-4 animate-spin" />
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
            className={`w-full py-4 rounded-full font-body text-[0.9375rem] font-medium border transition-all duration-200 ${
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
                <Loader2 className="w-4 h-4 animate-spin" />
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

        <p className="font-body text-[0.65rem] text-white/25 text-center mt-1">
          Hold either button for 0.5s to confirm your decision.
        </p>

        {respondMutation.isError && (
          <div className="bg-[#D85A30]/10 border border-[#D85A30]/30 rounded-xl p-3 mt-2">
            <p className="font-body text-[0.74rem] text-[#D85A30] text-center">
              Something went wrong. Please try again.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
