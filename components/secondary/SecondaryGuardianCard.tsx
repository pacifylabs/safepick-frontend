"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  Phone, 
  CheckCircle, 
  Trash2, 
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react";
import { SecondaryGuardianAccount } from "@/types/secondaryGuardian.types";
import { Button } from "@/components/ui/Button";
import { useResendInvite, useRemoveSecondaryGuardian, useUpdateSecondaryGuardian } from "@/hooks/useSecondaryGuardian";
import { useToastStore } from "@/stores/toast.store";
import { formatRelative } from "date-fns";

interface SecondaryGuardianCardProps {
  guardian: SecondaryGuardianAccount;
}

export function SecondaryGuardianCard({ guardian }: SecondaryGuardianCardProps) {
  const { addToast } = useToastStore();
  const resendMutation = useResendInvite();
  const removeMutation = useRemoveSecondaryGuardian();
  const updateMutation = useUpdateSecondaryGuardian();

  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const [isChangingChannel, setIsConfirmingChannel] = useState(false);

  const handleResend = async () => {
    try {
      await resendMutation.mutateAsync(guardian.id);
      addToast({ message: "Invite resent", variant: "success" });
    } catch (err: any) {
      addToast({ message: err.message || "Failed to resend invite", variant: "danger" });
    }
  };

  const handleRemove = async () => {
    try {
      await removeMutation.mutateAsync(guardian.id);
      addToast({ message: "Guardian removed", variant: "success" });
      setIsConfirmingRemove(false);
    } catch (err: any) {
      addToast({ message: err.message || "Failed to remove guardian", variant: "danger" });
    }
  };

  const handleChangeChannel = async (channel: "SMS" | "WHATSAPP") => {
    try {
      await updateMutation.mutateAsync({ id: guardian.id, payload: { notifyChannel: channel } });
      addToast({ message: `Alerts switched to ${channel}`, variant: "success" });
      setIsConfirmingChannel(false);
    } catch (err: any) {
      addToast({ message: err.message || "Failed to update channel", variant: "danger" });
    }
  };

  const initials = guardian.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const statusBadge = {
    PENDING_INVITE: (
      <span className="bg-[#FAEEDA]/20 text-[#EF9F27] rounded-full px-3 py-1 text-[0.72rem] font-medium font-body uppercase tracking-wider">
        Pending
      </span>
    ),
    ACTIVE: (
      <span className="bg-[#0FA37F]/20 text-[#E1F5EE] rounded-full px-3 py-1 text-[0.72rem] font-medium font-body uppercase tracking-wider">
        Active
      </span>
    ),
    SUSPENDED: (
      <span className="bg-[#D85A30]/20 text-[#F0997B] rounded-full px-3 py-1 text-[0.72rem] font-medium font-body uppercase tracking-wider">
        Suspended
      </span>
    ),
    REMOVED: (
      <span className="bg-white/10 text-white/40 rounded-full px-3 py-1 text-[0.72rem] font-medium font-body uppercase tracking-wider">
        Removed
      </span>
    ),
  }[guardian.status];

  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm">
      {/* TOP SECTION */}
      <div className="bg-[#0B1A2C] px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-display font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-[0.875rem] font-medium text-white truncate">
            {guardian.fullName}
          </p>
          <p className="font-body text-[0.75rem] text-white/50 mt-0.5 truncate">
            {guardian.phone}
          </p>
        </div>
        {statusBadge}
      </div>

      {/* BOTTOM SECTION */}
      <div className="px-5 py-4 space-y-3">
        {/* Channel Selection */}
        <div className="flex items-center gap-2">
          {guardian.notifyChannel === "SMS" ? (
            <MessageSquare className="w-4 h-4 text-[#0FA37F]" />
          ) : (
            <Phone className="w-4 h-4 text-[#0FA37F]" />
          )}
          {!isChangingChannel ? (
            <>
              <p className="font-body text-[0.82rem] text-[#0B1A2C]">
                Alerts via {guardian.notifyChannel}
              </p>
              <button 
                onClick={() => setIsConfirmingChannel(true)}
                className="ml-auto text-[0.75rem] font-medium text-[#0FA37F] hover:underline"
              >
                Change
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <button 
                onClick={() => handleChangeChannel(guardian.notifyChannel === "SMS" ? "WHATSAPP" : "SMS")}
                className="text-[0.75rem] font-medium text-[#0FA37F] hover:underline"
              >
                Switch to {guardian.notifyChannel === "SMS" ? "WhatsApp" : "SMS"}
              </button>
              <button 
                onClick={() => setIsConfirmingChannel(false)}
                className="text-[0.75rem] font-medium text-[#6B7280] hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Status Rows */}
        {guardian.status === "ACTIVE" && guardian.acceptedAt && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#0FA37F]" />
            <p className="font-body text-[0.75rem] text-[#6B7280]">
              Accepted {formatRelative(new Date(guardian.acceptedAt), new Date())}
            </p>
          </div>
        )}

        {guardian.status === "PENDING_INVITE" && (
          <div className="bg-[#FAEEDA] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8A5A00]" />
              <p className="font-body text-[0.78rem] text-[#8A5A00]">
                Invite not yet accepted
              </p>
            </div>
            <button
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="text-[0.75rem] font-bold text-[#0FA37F] hover:underline flex items-center gap-1"
            >
              {resendMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Resend"}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-1 flex gap-2 border-t border-black/[0.04]">
          {isConfirmingRemove ? (
            <div className="flex items-center gap-3 w-full">
              <p className="font-body text-[0.78rem] text-[#D85A30] font-medium">Are you sure?</p>
              <button 
                onClick={handleRemove}
                disabled={removeMutation.isPending}
                className="ml-auto text-[0.78rem] font-bold text-[#D85A30] hover:underline"
              >
                {removeMutation.isPending ? "Removing..." : "Yes, remove"}
              </button>
              <button 
                onClick={() => setIsConfirmingRemove(false)}
                className="text-[0.78rem] font-medium text-[#6B7280] hover:underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {guardian.status === "ACTIVE" && (
                <button className="text-[0.78rem] font-medium text-[#EF9F27] hover:underline">
                  Suspend
                </button>
              )}
              <button 
                onClick={() => setIsConfirmingRemove(true)}
                className="text-[0.78rem] font-medium text-[#D85A30] hover:underline"
              >
                {guardian.status === "PENDING_INVITE" ? "Cancel invite" : "Remove"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
