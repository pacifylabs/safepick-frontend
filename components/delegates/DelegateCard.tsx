"use client";

import React from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { DelegateProfile } from "@/types/delegates.types";

interface DelegateCardProps {
  delegate: DelegateProfile;
  onRevoke?: (delegateId: string) => void;
  onClick?: () => void;
}

export const DelegateCard: React.FC<DelegateCardProps> = ({
  delegate,
  onClick,
}) => {
  const getKYCBadge = () => {
    switch (delegate.kycStatus) {
      case "APPROVED":
        return (
          <span className="bg-teal-light text-teal-mid rounded-full px-3 py-1 font-body text-[0.75rem] font-medium uppercase tracking-wider">
            Verified
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-amber-light text-amber rounded-full px-3 py-1 font-body text-[0.75rem] font-medium uppercase tracking-wider">
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-coral/10 text-coral rounded-full px-3 py-1 font-body text-[0.75rem] font-medium uppercase tracking-wider">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const getAvatarColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["bg-teal", "bg-navy", "bg-amber", "bg-coral"];
    return colors[Math.abs(hash) % 4];
  };

  const initials = delegate.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border border-black/10 cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-body font-medium overflow-hidden ${getAvatarColor(delegate.id)}`}>
          {delegate.photoUrl ? (
            <img src={delegate.photoUrl} alt={delegate.fullName} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-navy font-body font-medium text-[1rem]">
              {delegate.fullName}
            </h3>
            <span className="bg-surface text-navy/60 rounded-full px-2 py-0.5 font-body text-[0.65rem] font-medium uppercase tracking-widest">
              {delegate.relationship}
            </span>
          </div>
          {getKYCBadge()}
        </div>
      </div>

      <div className="text-navy/20">
        <MoreHorizontal size={20} />
      </div>
    </motion.div>
  );
};
