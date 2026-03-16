"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { VerificationSession } from "@/types/verification.types";

interface SessionStatusBannerProps {
  session: VerificationSession;
}

export function SessionStatusBanner({ session }: SessionStatusBannerProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "QR_VERIFIED":
      case "OTP_VERIFIED":
      case "BIOMETRIC_VERIFIED":
        return { label: "Verified", color: "bg-[#0FA37F]/20 text-[#0FA37F]", pulsing: false };
      case "AWAITING_PARENT":
        return { label: "Awaiting Parent", color: "bg-[#EF9F27]/20 text-[#EF9F27]", pulsing: true };
      case "RULES_VIOLATED":
      case "REJECTED":
        return { label: "Rejected", color: "bg-[#D85A30]/20 text-[#D85A30]", pulsing: false };
      default:
        return { label: "Pending", color: "bg-white/10 text-white/60", pulsing: true };
    }
  };

  const statusConfig = getStatusConfig(session.status);

  return (
    <div className="bg-white/5 border-b border-white/10 px-8 py-4 flex items-center gap-8">
      {/* DELEGATE */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-bold overflow-hidden">
          {session.delegate.photoUrl ? (
            <img src={session.delegate.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            session.delegate.fullName[0]
          )}
        </div>
        <div>
          <p className="text-[0.7rem] uppercase tracking-widest text-white/40 font-medium mb-0.5">Delegate</p>
          <p className="font-display text-[1rem] text-white font-medium">{session.delegate.fullName}</p>
          <p className="text-[0.75rem] text-white/30">{session.delegate.relationship}</p>
        </div>
      </div>

      <ArrowRight className="w-5 h-5 text-white/10" />

      {/* CHILD */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-bold overflow-hidden">
          {session.child.photoUrl ? (
            <img src={session.child.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            session.child.fullName[0]
          )}
        </div>
        <div>
          <p className="text-[0.7rem] uppercase tracking-widest text-white/40 font-medium mb-0.5">Child</p>
          <p className="font-display text-[1rem] text-white font-medium">{session.child.fullName}</p>
        </div>
      </div>

      {/* STATUS */}
      <div className="ml-auto">
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-body text-[0.8rem] font-bold uppercase tracking-wider ${statusConfig.color}`}>
          {statusConfig.pulsing && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-current"
            />
          )}
          {statusConfig.label}
        </div>
      </div>
    </div>
  );
}
