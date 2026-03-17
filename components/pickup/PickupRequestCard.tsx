"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { usePickupRequest, useRespondToPickup } from "@/hooks/usePickupRequest";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface PickupRequestCardProps {
  pickupRequestId: string;
  onRespond?: () => void;
}

export function PickupRequestCard({
  pickupRequestId,
  onRespond,
}: PickupRequestCardProps) {
  const { user } = useAuthStore();
  const { data: request, isLoading, isError, refetch } = usePickupRequest(pickupRequestId);
  const respondMutation = useRespondToPickup();

  const [holdType, setHoldType] = useState<"APPROVE" | "DENY" | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);

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
        if (onRespond) {
          setTimeout(onRespond, 500);
        }
      } catch (error) {
        console.error("Failed to respond to pickup:", error);
      }
    },
    [pickupRequestId, user?.id, respondMutation, onRespond]
  );

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
      <div className="w-full bg-white rounded-2xl border border-black/[0.06] p-6 animate-pulse">
        <div className="flex justify-between items-start mb-6">
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-8 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="h-px bg-gray-50" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-40 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="w-full bg-white rounded-2xl border border-[#D85A30]/20 p-6 flex flex-col items-center text-center gap-4">
        <AlertCircle className="w-10 h-10 text-[#D85A30]" />
        <div>
          <p className="font-display font-semibold text-navy">Failed to load request</p>
          <p className="font-body text-sm text-navy/40 mt-1">Check your connection and try again</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (request.status === "APPROVED") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-[#E1F5EE] border border-[#0FA37F]/20 rounded-2xl p-6 flex flex-col items-center text-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-[#0FA37F] flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy text-lg">Release Authorized</h3>
          <p className="font-body text-sm text-navy/60 mt-1">
            School has been notified. {request.delegate.fullName} can now collect {request.child.fullName}.
          </p>
        </div>
      </motion.div>
    );
  }

  if (request.status === "DENIED") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-[#FAECE7] border border-[#D85A30]/20 rounded-2xl p-6 flex flex-col items-center text-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-[#D85A30] flex items-center justify-center">
          <XCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy text-lg">Release Denied</h3>
          <p className="font-body text-sm text-navy/60 mt-1">
            School staff have been alerted to hold the child. Incident ref: {request.pickupRequestId.split('_')[1] || '0922'}.
          </p>
        </div>
      </motion.div>
    );
  }

  if (request.status === "TIMED_OUT") {
    return (
      <div className="w-full bg-white rounded-2xl border border-black/[0.06] p-6 flex flex-col items-center text-center gap-4 opacity-60">
        <Clock className="w-10 h-10 text-navy/20" />
        <div>
          <p className="font-display font-semibold text-navy">Request Expired</p>
          <p className="font-body text-sm text-navy/40 mt-1">The authorization window has closed.</p>
        </div>
      </div>
    );
  }

  const timerColor = request.secondsRemaining < 15 ? 'text-[#D85A30]' : request.secondsRemaining < 60 ? 'text-[#EF9F27]' : 'text-navy';

  return (
    <div className="w-full bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="font-body text-[0.65rem] uppercase tracking-widest text-navy/40 font-bold">Time Remaining</p>
            <p className={`font-display text-2xl font-bold ${timerColor}`}>
              {Math.floor(request.secondsRemaining / 60)}:{(request.secondsRemaining % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#185FA5]/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#185FA5]" />
            <span className="font-dm-sans text-[0.65rem] font-bold text-[#185FA5] uppercase tracking-wider">Awaiting You</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Delegate */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
              {request.delegate.photoUrl ? (
                <img src={request.delegate.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-navy/20">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-navy truncate">{request.delegate.fullName}</p>
              <p className="font-body text-xs text-navy/40">{request.delegate.relationship}</p>
            </div>
          </div>

          <div className="h-px bg-black/[0.04]" />

          {/* Child & School */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0FA37F]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#0FA37F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-navy truncate">Collecting {request.child.fullName}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-navy/20" />
                <p className="font-body text-[0.7rem] text-navy/40 truncate">{request.school.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onPointerDown={() => !respondMutation.isPending && setHoldType("APPROVE")}
            onPointerUp={() => setHoldType(null)}
            onPointerLeave={() => setHoldType(null)}
            disabled={respondMutation.isPending}
            className="relative h-14 w-full bg-[#0FA37F] text-white rounded-xl font-body font-bold overflow-hidden transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {holdType === "APPROVE" && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${holdProgress}%` }}
                className="absolute inset-0 bg-white/20"
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {respondMutation.isPending && holdType === "APPROVE" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {holdType === "APPROVE" ? "Hold to Confirm" : "Approve Release"}
            </span>
          </button>

          <button
            onPointerDown={() => !respondMutation.isPending && setHoldType("DENY")}
            onPointerUp={() => setHoldType(null)}
            onPointerLeave={() => setHoldType(null)}
            disabled={respondMutation.isPending}
            className="relative h-14 w-full bg-white border-2 border-[#D85A30]/20 text-[#D85A30] rounded-xl font-body font-bold overflow-hidden transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {holdType === "DENY" && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${holdProgress}%` }}
                className="absolute inset-0 bg-[#D85A30]/10"
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {respondMutation.isPending && holdType === "DENY" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {holdType === "DENY" ? "Hold to Confirm" : "Deny Release"}
            </span>
          </button>
        </div>

        {respondMutation.isError && (
          <div className="mt-4 p-3 rounded-lg bg-[#FAECE7] border border-[#D85A30]/10 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D85A30]" />
            <p className="font-body text-xs text-[#D85A30]">Submission failed. Please try again.</p>
          </div>
        )}

        <p className="font-body text-[0.65rem] text-navy/20 text-center mt-4">
          Security: Decision requires 0.5s sustained hold
        </p>
      </div>
    </div>
  );
}
