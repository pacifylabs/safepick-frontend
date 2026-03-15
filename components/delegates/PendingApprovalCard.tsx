"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";

interface PendingApprovalCardProps {
  delegate: {
    id: string;
    fullName: string;
    phone: string;
    relationship: string;
    photoUrl?: string;
    kycStatus: "APPROVED";
  };
  childName: string;
  childId: string;
  onReview: () => void;
}

export function PendingApprovalCard({
  delegate,
  childName,
  onReview,
}: PendingApprovalCardProps) {
  const initials = delegate.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-2xl p-4 flex items-center gap-4"
    >
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-2.5 h-2.5 rounded-full bg-[#EF9F27]"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-8 h-8 rounded-full bg-[#1D9E75] flex items-center justify-center overflow-hidden">
            {delegate.photoUrl ? (
              <img
                src={delegate.photoUrl}
                alt={delegate.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-[0.7rem] font-medium font-body">
                {initials}
              </span>
            )}
          </div>
          <p className="font-body text-[0.875rem] font-medium text-[#0B1A2C]">
            {delegate.fullName}
          </p>
          <span className="bg-[#EF9F27]/20 text-[#BA7517] rounded-full px-2 py-0.5 text-[0.7rem] font-medium font-body">
            {delegate.relationship}
          </span>
        </div>
        <p className="font-body text-[0.78rem] text-[#6B7280]">
          Verified and waiting for your approval to pick up{" "}
          <span className="font-medium text-[#0B1A2C]">{childName}</span>
        </p>
      </div>

      <Button variant="primary" size="sm" onClick={onReview}>
        Review
      </Button>
    </motion.div>
  );
}
