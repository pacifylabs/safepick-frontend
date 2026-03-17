"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  MapPin,
  QrCode,
  Hash,
  Fingerprint,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { usePickupRequest, useRespondToPickup } from "@/hooks/usePickupRequest";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth.store";

interface PickupRequestModalProps {
  pickupRequestId: string;
  onClose: () => void;
}

export function PickupRequestModal({
  pickupRequestId,
  onClose,
}: PickupRequestModalProps) {
  const { user } = useAuthStore();
  const { data: request, isLoading, isError } = usePickupRequest(pickupRequestId);
  const respondMutation = useRespondToPickup();

  const [holdType, setHoldType] = useState<"APPROVE" | "DENY" | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);

  // Auto-close on terminal states after a delay
  useEffect(() => {
    if (request?.status === "APPROVED" || request?.status === "DENIED") {
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [request?.status, onClose]);

  const handleRespond = useCallback(
    async (decision: "APPROVE" | "DENY") => {
      if (!user?.id) return;
      try {
        await respondMutation.mutateAsync({
          id: pickupRequestId,
          payload: {
            decision,
            responderId: user.id,
          },
        });
      } catch (error) {
        console.error("Failed to respond to pickup:", error);
      }
    },
    [pickupRequestId, user?.id, respondMutation]
  );

  // Hold mechanic logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (holdType) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / 500) * 100, 100);
        setHoldProgress(progress);
        if (progress === 100) {
          clearInterval(interval);
          handleRespond(holdType === "APPROVE" ? "APPROVE" : "DENY");
          setHoldType(null);
          setHoldProgress(0);
        }
      }, 10);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [holdType, handleRespond]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0B1A2C]/95 z-[60] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-white animate-spin opacity-20" />
        <p className="font-body text-[0.875rem] text-white/50">Loading pickup details...</p>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="fixed inset-0 bg-[#0B1A2C]/95 z-[60] flex flex-col items-center justify-center px-6 gap-4">
        <AlertCircle className="w-12 h-12 text-[#D85A30]" />
        <p className="font-display text-[1.25rem] text-white text-center">Couldn't load request</p>
        <p className="font-body text-[0.875rem] text-white/50 text-center">
          Check your connection or try again later.
        </p>
        <Button variant="ghost" onClick={onClose} className="text-white/50">Close</Button>
      </div>
    );
  }

  const renderContent = () => {
    switch (request.status) {
      case "AWAITING_PARENT":
      case "AWAITING_SECONDARY":
        return (
          <div className="flex flex-col h-full">
            {/* TOP SECTION */}
            <div className="bg-[#0F2235] px-6 pt-10 pb-6 relative">
              {/* Countdown Timer */}
              <div className="absolute top-8 right-6 flex flex-col items-center">
                <p className="font-body text-[0.65rem] uppercase tracking-widest mb-1 text-white/40">TIME REMAINING</p>
                <motion.p 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`font-display text-[2rem] font-semibold leading-none ${
                    request.secondsRemaining < 15 ? 'text-[#D85A30]' : 
                    request.secondsRemaining < 60 ? 'text-[#EF9F27]' : 'text-white'
                  }`}
                >
                  {Math.floor(request.secondsRemaining / 60)}:{(request.secondsRemaining % 60).toString().padStart(2, '0')}
                </motion.p>
                <p className="font-body text-[0.6rem] text-white/20 mt-1">
                  Expires at {format(new Date(request.timeoutAt), "h:mm a")}
                </p>
              </div>

              <p className="font-body text-[0.68rem] uppercase tracking-[0.1em] text-[#0FA37F] mb-5 font-bold">PICKUP REQUEST</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/10">
                  {request.delegate.photoUrl ? (
                    <img src={request.delegate.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1D9E75] flex items-center justify-center font-display text-[1.5rem] font-semibold text-white">
                      {request.delegate.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[1.25rem] font-semibold text-white leading-tight truncate">{request.delegate.fullName}</p>
                  <div className="inline-block bg-white/10 rounded-full px-3 py-1 mt-1">
                    <p className="font-body text-[0.72rem] text-white/70 uppercase tracking-wider font-medium">{request.delegate.relationship}</p>
                  </div>
                </div>
                <ShieldCheck className="w-6 h-6 text-[#0FA37F] flex-shrink-0" />
              </div>

              <div className="h-px bg-white/10 my-4" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0FA37F]/20 flex items-center justify-center font-display text-[0.875rem] text-[#0FA37F] font-bold overflow-hidden border border-[#0FA37F]/20">
                  {request.child.photoUrl ? (
                    <img src={request.child.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    request.child.fullName[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[0.875rem] font-medium text-white">{request.child.fullName}</p>
                  <p className="font-body text-[0.75rem] text-white/50 mt-0.5 truncate">
                    {request.school.name} &middot; {request.child.grade}
                  </p>
                </div>
                <MapPin className="w-4 h-4 text-white/20" />
              </div>

              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 w-fit mt-5 border border-white/5">
                {request.verificationMethod === "QR" && <QrCode className="w-4 h-4 text-[#0FA37F]" />}
                {request.verificationMethod === "OTP" && <Hash className="w-4 h-4 text-[#EF9F27]" />}
                {request.verificationMethod === "BIOMETRIC" && <Fingerprint className="w-4 h-4 text-[#185FA5]" />}
                <p className="font-body text-[0.72rem] text-white/60">Verified via {request.verificationMethod}</p>
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="px-6 pb-10 pt-8 flex flex-col gap-4">
              <button
                onPointerDown={() => !respondMutation.isPending && setHoldType("APPROVE")}
                onPointerUp={() => setHoldType(null)}
                onPointerLeave={() => setHoldType(null)}
                disabled={respondMutation.isPending}
                className="relative h-16 w-full bg-[#0FA37F] text-white rounded-full font-body text-[1rem] font-semibold overflow-hidden transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {holdType === "APPROVE" && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${holdProgress}%` }}
                    className="absolute inset-0 bg-white/20"
                  />
                )}
                <span className="relative z-10">
                  {respondMutation.isPending && holdType === "APPROVE" ? "Approving..." : 
                   holdType === "APPROVE" ? "Hold to confirm..." : "Approve release"}
                </span>
              </button>

              <button
                onPointerDown={() => !respondMutation.isPending && setHoldType("DENY")}
                onPointerUp={() => setHoldType(null)}
                onPointerLeave={() => setHoldType(null)}
                disabled={respondMutation.isPending}
                className="relative h-16 w-full bg-[#D85A30]/10 border border-[#D85A30]/30 text-[#D85A30] rounded-full font-body text-[1rem] font-semibold overflow-hidden transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {holdType === "DENY" && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${holdProgress}%` }}
                    className="absolute inset-0 bg-[#D85A30]/20"
                  />
                )}
                <span className="relative z-10">
                  {respondMutation.isPending && holdType === "DENY" ? "Denying..." : 
                   holdType === "DENY" ? "Hold to confirm..." : "Deny release"}
                </span>
              </button>

              <p className="font-body text-[0.72rem] text-white/20 text-center mt-2">
                Hold either button for 0.5s to confirm your decision.
              </p>
            </div>
          </div>
        );

      case "APPROVED":
        return (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center h-full px-8 text-center gap-6 py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <CheckCircle className="w-20 h-20 text-[#0FA37F]" />
            </motion.div>
            
            <div>
              <h2 className="font-display text-[2rem] font-semibold text-white mb-2">Release authorized</h2>
              <p className="font-body text-[1rem] text-white/50 leading-relaxed max-w-[280px] mx-auto">
                School has been notified. {request.delegate.fullName} can now collect {request.child.fullName}.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 w-full max-w-[320px] space-y-3 text-left border border-white/5">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-white/30" />
                <p className="font-body text-[0.875rem] text-white/60">
                  Approved at {format(new Date(), "h:mm a")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-white/30" />
                <p className="font-body text-[0.875rem] text-white/60">Primary parent &middot; You</p>
              </div>
            </div>

            <Button variant="ghost" onClick={onClose} className="text-white/40 mt-4">Close</Button>
          </motion.div>
        );

      case "DENIED":
        return (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center h-full px-8 text-center gap-6 py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <XCircle className="w-20 h-20 text-[#D85A30]" />
            </motion.div>

            <div>
              <h2 className="font-display text-[2rem] font-semibold text-white mb-2">Release denied</h2>
              <p className="font-body text-[1rem] text-white/50 leading-relaxed max-w-[280px] mx-auto">
                School has been notified not to release {request.child.fullName}. An incident has been logged.
              </p>
            </div>

            <div className="bg-[#D85A30]/10 border border-[#D85A30]/20 rounded-2xl p-4 w-full max-w-[320px]">
              <p className="font-body text-[0.875rem] text-[#D85A30] font-medium">
                Incident ref: INC-{request.pickupRequestId.split('_')[1] || '0922'}
              </p>
            </div>

            <Button variant="ghost" onClick={onClose} className="text-white/40 mt-4">Close</Button>
          </motion.div>
        );

      case "TIMED_OUT":
        return (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-6 py-16">
            <Clock className="w-20 h-20 text-[#EF9F27] opacity-50" />
            <div>
              <h2 className="font-display text-[2rem] font-semibold text-white mb-2">Request expired</h2>
              <p className="font-body text-[1rem] text-white/50 leading-relaxed max-w-[280px] mx-auto">
                You didn't respond in time. A secondary guardian has been notified as your backup contact.
              </p>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white/40 mt-4">Close</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Background Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full md:h-auto md:max-w-[440px] md:max-h-[90vh] bg-[#0B1A2C] md:rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
