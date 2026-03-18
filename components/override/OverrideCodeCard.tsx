"use client";

import { useState } from "react";
import { 
  Key, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  Trash2,
  X,
  Loader2
} from "lucide-react";
import { 
  useOverrideCodes, 
  useGenerateOverrideCode, 
  useRevokeOverrideCode 
} from "@/hooks/useOverride";
import { Button } from "@/components/ui/Button";
import { formatRelative } from "date-fns";
import { useToastStore } from "@/stores/toast.store";

interface OverrideCodeCardProps {
  childId: string;
  schoolId: string;
  schoolName: string;
}

export function OverrideCodeCard({ childId, schoolId, schoolName }: OverrideCodeCardProps) {
  const { data: codes = [], isLoading } = useOverrideCodes(childId);
  const generateMutation = useGenerateOverrideCode();
  const revokeMutation = useRevokeOverrideCode(childId);
  const { addToast } = useToastStore();
  
  const [copied, setCopied] = useState(false);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);

  const activeCode = codes.find(c => c.school.id === schoolId && c.status === "ACTIVE");

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({
        childId,
        schoolId,
        validForHours: 72,
        maxUses: 1,
      });
      addToast({ message: "Override code generated", variant: "success" });
    } catch (err: any) {
      addToast({ message: err.message || "Failed to generate code", variant: "danger" });
    }
  };

  const handleRevoke = async () => {
    if (!activeCode) return;
    try {
      await revokeMutation.mutateAsync(activeCode.id);
      addToast({ message: "Override code revoked", variant: "success" });
      setShowConfirmRevoke(false);
    } catch (err: any) {
      addToast({ message: err.message || "Failed to revoke code", variant: "danger" });
    }
  };

  const handleCopy = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-black/[0.06] rounded-2xl h-[240px] animate-pulse" />
    );
  }

  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="bg-[#0B1A2C] px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <Key className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-body text-[0.68rem] font-bold uppercase tracking-widest text-white/50">
            EMERGENCY OVERRIDE
          </p>
          <p className="font-body text-[0.875rem] font-medium text-white mt-0.5">
            {schoolName}
          </p>
        </div>
      </div>

      {!activeCode ? (
        /* NO ACTIVE CODE */
        <div className="px-5 py-5">
          <p className="font-body text-[0.82rem] text-[#6B7280] leading-relaxed mb-4">
            Generate a one-time override code for this school. Share it with school staff for emergencies when neither guardian can be reached.
          </p>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleGenerate}
            loading={generateMutation.isPending}
            className="gap-2"
          >
            <Key className="w-4 h-4" />
            Generate override code
          </Button>
        </div>
      ) : (
        /* ACTIVE CODE */
        <div className="px-5 py-5">
          <div>
            <p className="font-body text-[0.68rem] font-bold uppercase tracking-widest text-[#6B7280] mb-2">
              YOUR CODE
            </p>
            <div className="bg-[#F2F0EB] rounded-2xl px-5 py-4 flex items-center justify-between">
              <p className="font-display text-[1.5rem] font-semibold text-[#0B1A2C] tracking-widest">
                {activeCode.code}
              </p>
              <button 
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center hover:bg-white/80 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-[#0FA37F]" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Clock className="w-4 h-4 text-[#6B7280]/50" />
            <p className="font-body text-[0.78rem] text-[#6B7280]">
              Expires {formatRelative(new Date(activeCode.expiresAt), new Date())}
            </p>
            <div className="ml-auto bg-[#E1F5EE] rounded-full px-2.5 py-1">
              <p className="font-body text-[0.68rem] font-bold text-[#0F6E56]">
                {activeCode.usesRemaining} {activeCode.usesRemaining === 1 ? "use" : "uses"} remaining
              </p>
            </div>
          </div>

          <div className="bg-[#FAEEDA] rounded-xl p-3 mt-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF9F27] flex-shrink-0 mt-0.5" />
            <p className="font-body text-[0.75rem] text-[#8A5A00] leading-relaxed">
              Share this code only with trusted school staff. It can only be used once.
            </p>
          </div>

          {!showConfirmRevoke ? (
            <Button 
              variant="ghost" 
              fullWidth 
              className="mt-4 text-[#D85A30] gap-2"
              onClick={() => setShowConfirmRevoke(true)}
            >
              <Trash2 className="w-4 h-4" />
              Revoke this code
            </Button>
          ) : (
            <div className="mt-4 p-3 bg-[#FAECE7] rounded-xl border border-[#D85A30]/20">
              <p className="font-body text-[0.78rem] text-[#D85A30] font-medium mb-3">
                Are you sure? The school will no longer be able to use this code.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="danger" 
                  size="sm" 
                  fullWidth 
                  onClick={handleRevoke}
                  loading={revokeMutation.isPending}
                >
                  Confirm
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  fullWidth 
                  onClick={() => setShowConfirmRevoke(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
