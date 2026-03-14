"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Pencil, Pause, Trash2, Calendar, Copy, MoreHorizontal, CheckCircle, Clock, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { DelegateProfile } from "@/types/delegates.types";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

interface DelegateCardProps {
  delegate: DelegateProfile;
  onRevoke?: (delegateId: string) => void;
  onClick?: () => void;
}

export const DelegateCard: React.FC<DelegateCardProps> = ({
  delegate,
  onRevoke,
  onClick,
}) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const getKYCBadge = () => {
    switch (delegate.kycStatus) {
      case "APPROVED":
        return (
          <span className="bg-[#E1F5EE] text-[#0F6E56] rounded-full px-2.5 py-1 font-body text-[0.7rem] font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-[#FAEEDA] text-[#BA7517] rounded-full px-2.5 py-1 font-body text-[0.7rem] font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-[#FAECE7] text-[#993C1D] rounded-full px-2.5 py-1 font-body text-[0.7rem] font-medium flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
    }
  };

  const getChildColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["bg-[#1D9E75]", "bg-[#185FA5]", "bg-[#BA7517]", "bg-[#993556]"];
    return colors[Math.abs(hash) % 4];
  };

  const handleCopyInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, we'd get the actual invite URL for this delegate
    navigator.clipboard.writeText("https://safepick.io/delegate/join?token=mock");
    alert("Invite link copied to clipboard!");
  };

  const menuItems: DropdownItem[] = [
    {
      label: "View profile",
      icon: Eye,
      onClick: () => router.push(`/dashboard/delegates/${delegate.id}`),
    },
    {
      label: "Edit rules",
      icon: Pencil,
      onClick: () => router.push(`/dashboard/delegates/${delegate.id}?edit=rules`),
    },
    {
      label: "Suspend",
      icon: Pause,
      onClick: () => alert("Delegate suspended"),
    },
    {
      label: "Remove",
      icon: Trash2,
      variant: "danger",
      onClick: () => onRevoke?.(delegate.id),
    },
  ];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-black/[0.06] cursor-pointer hover:shadow-md transition-shadow relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${getChildColor(delegate.id)}`}>
            {delegate.photoUrl ? (
              <img src={delegate.photoUrl} alt={delegate.fullName} className="w-full h-full object-cover rounded-full" />
            ) : (
              delegate.fullName[0]
            )}
          </div>
          <div>
            <p className="font-body text-[0.9rem] font-semibold text-[#0B1A2C]">
              {delegate.fullName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-[#F2F0EB] text-[#6B7280] rounded-full px-2 py-0.5 text-[0.7rem] font-medium capitalize">
                {delegate.relationship.toLowerCase().replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getKYCBadge()}
          <Dropdown
            align="right"
            trigger={
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg bg-[#F2F0EB] flex items-center justify-center text-[#6B7280] hover:text-[#0B1A2C] hover:bg-[#ECEAE5] transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={menuItems}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {delegate.authorizations.length > 0 ? (
          delegate.authorizations.map((auth) => (
            <div key={auth.childId} className="flex items-center gap-1.5 bg-[#F9F9F8] border border-black/[0.06] rounded-full px-2.5 py-1">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.5rem] text-white ${getChildColor(auth.childId)}`}>
                {auth.childName[0]}
              </div>
              <p className="font-body text-[0.72rem] text-[#0B1A2C]">{auth.childName}</p>
              <div className={`w-1.5 h-1.5 rounded-full ml-1 ${
                auth.status === "ACTIVE" ? "bg-[#0FA37F]" : 
                auth.status === "SUSPENDED" ? "bg-[#EF9F27]" : "bg-[#D85A30]"
              }`} />
            </div>
          ))
        ) : (
          <p className="text-[0.78rem] text-[#6B7280]">No children authorized yet</p>
        )}
      </div>

      {delegate.kycStatus === "APPROVED" && delegate.authorizations.length > 0 ? (
        <div className="flex items-center gap-2 pt-3 border-t border-[#F2F0EB]">
          <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
          <p className="font-body text-[0.75rem] text-[#6B7280]">
            {delegate.authorizations[0].authType === "RECURRING" ? "Mon–Fri · 2:00pm–5:00pm" : "Recurring"}
          </p>
        </div>
      ) : delegate.kycStatus === "PENDING" ? (
        <div className="flex items-center justify-between pt-3 border-t border-[#F2F0EB]">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#EF9F27]" />
            <p className="text-[0.75rem] text-[#6B7280]">Awaiting identity verification</p>
          </div>
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 text-[0.75rem] text-[#4F46E5] hover:underline font-medium"
          >
            <Copy className="w-3 h-3" />
            Resend link
          </button>
        </div>
      ) : delegate.kycStatus === "REJECTED" ? (
        <div className="flex items-center justify-between pt-3 border-t border-[#FAECE7]">
          <div className="flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 text-[#D85A30]" />
            <p className="text-[0.75rem] text-[#D85A30]">Verification failed</p>
          </div>
          <button className="text-[0.75rem] text-[#D85A30] font-semibold hover:underline">
            Re-invite
          </button>
        </div>
      ) : null}
    </motion.div>
  );
};
