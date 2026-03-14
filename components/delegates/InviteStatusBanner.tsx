"use client";

import React from "react";
import { CheckCircle, XCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InviteStatusBannerProps {
  type: "KYC_APPROVED" | "KYC_REJECTED" | "KYC_PENDING";
  delegateName: string;
  childName?: string;
  onAction: () => void;
  onDismiss: () => void;
}

export const InviteStatusBanner: React.FC<InviteStatusBannerProps> = ({
  type,
  delegateName,
  childName,
  onAction,
  onDismiss,
}) => {
  if (type === "KYC_APPROVED") {
    return (
      <div className="bg-[#E1F5EE] border border-[#0FA37F]/30 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0FA37F]/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="text-[#0FA37F] w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="font-body font-medium text-[#0B1A2C]">
            {delegateName}'s identity has been verified
          </p>
          <p className="text-[0.78rem] text-[#6B7280] mt-0.5">
            Review and approve their access{childName ? ` for ${childName}` : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            Review now
          </Button>
          <button onClick={onDismiss} className="p-1 hover:bg-[#0FA37F]/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
      </div>
    );
  }

  if (type === "KYC_REJECTED") {
    return (
      <div className="bg-[#FAECE7] border border-[#D85A30]/30 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#D85A30]/20 flex items-center justify-center flex-shrink-0">
          <XCircle className="text-[#D85A30] w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="font-body font-medium text-[#0B1A2C]">
            {delegateName}'s verification failed
          </p>
          <p className="text-[0.78rem] text-[#6B7280] mt-0.5">
            You can re-invite them to try again.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={onAction}>
            Re-invite
          </Button>
          <button onClick={onDismiss} className="p-1 hover:bg-[#D85A30]/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#EF9F27]/20 flex items-center justify-center flex-shrink-0">
        <Clock className="text-[#EF9F27] w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="font-body font-medium text-[#0B1A2C]">
          Waiting for {delegateName} to complete verification
        </p>
        <p className="text-[0.78rem] text-[#6B7280] mt-0.5">
          Invite sent — they haven't opened the link yet.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="bg-white/50" onClick={onAction}>
          Resend link
        </Button>
        <button onClick={onDismiss} className="p-1 hover:bg-[#EF9F27]/10 rounded-lg transition-colors">
          <X className="w-4 h-4 text-[#6B7280]" />
        </button>
      </div>
    </div>
  );
};
