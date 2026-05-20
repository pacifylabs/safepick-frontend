"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useKycStatus } from "@/hooks/useDelegateKyc";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ShieldX,
  ArrowLeft,
  FileText,
} from "lucide-react";

const statusConfig = {
  PENDING: { icon: Clock, label: "Pending", color: "text-amber", bg: "bg-amber/10" },
  SUBMITTED: { icon: FileText, label: "Under Review", color: "text-blue-400", bg: "bg-blue-400/10" },
  APPROVED: { icon: CheckCircle, label: "Approved", color: "text-teal", bg: "bg-teal/10" },
  REJECTED: { icon: XCircle, label: "Rejected", color: "text-coral", bg: "bg-coral/10" },
};

const inviteStatusConfig: Record<string, { icon: any; label: string; color: string }> = {
  PENDING: { icon: Clock, label: "Pending", color: "text-amber" },
  ACCEPTED: { icon: CheckCircle, label: "Accepted", color: "text-teal" },
  EXPIRED: { icon: AlertTriangle, label: "Expired", color: "text-coral" },
  REVOKED: { icon: ShieldX, label: "Revoked", color: "text-coral" },
};

export default function DelegateKycStatusPage() {
  const router = useRouter();
  const [inviteToken, setInviteToken] = useState("");
  const [submittedToken, setSubmittedToken] = useState("");

  const { data: status, isLoading, error, refetch } = useKycStatus(submittedToken);

  const handleCheck = () => {
    if (!inviteToken.trim()) return;
    setSubmittedToken(inviteToken.trim());
  };

  const kycStatus = status?.kycStatus;
  const kycConfig = kycStatus ? statusConfig[kycStatus] : null;
  const inviteConfig = status?.inviteStatus ? inviteStatusConfig[status.inviteStatus] : null;
  const InviteIcon = inviteConfig?.icon;

  return (
    <main className="min-h-screen bg-[#0B1A2C] flex flex-col overflow-x-hidden relative">
      <nav className="absolute top-0 left-0 right-0 z-50 w-full px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <Logo variant="light" size="sm" />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-[480px] mx-auto">
          <AuthCard className="w-full">
            {!submittedToken ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal">
                  KYC STATUS
                </span>
                <h1 className="mt-2 font-display text-2xl font-semibold text-white">
                  Check your <i className="text-teal not-italic">status</i>
                </h1>
                <p className="mt-2 mb-6 font-body text-[0.85rem] font-light leading-relaxed text-white/50">
                  Enter the invite token you received to check your KYC verification status.
                </p>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-body text-[0.75rem] font-medium text-white/85">Invite Token</label>
                    <input
                      type="text"
                      placeholder="Paste your invite token"
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all font-mono"
                    />
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCheck}
                    disabled={!inviteToken.trim()}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Check Status
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <button
                  onClick={() => { setSubmittedToken(""); setInviteToken(""); }}
                  className="mb-6 text-xs text-white/50 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Check another token
                </button>

                {isLoading ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-teal animate-spin" />
                    <p className="text-[0.875rem] text-white/50">Checking your status...</p>
                  </div>
                ) : error ? (
                  <div className="py-8">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/20 text-coral">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white mb-2">Unable to check status</h3>
                    <p className="text-[0.85rem] text-white/50 mb-6">
                      {error.message || "Invalid or expired token. Please check and try again."}
                    </p>
                    <Button variant="primary" onClick={() => refetch()}>
                      Try Again
                    </Button>
                  </div>
                ) : status ? (
                  <div className="space-y-6">
                    {status.delegateName && (
                      <div>
                        <p className="font-body text-[0.7rem] uppercase tracking-widest text-white/30 mb-1">DELEGATE</p>
                        <p className="font-display text-xl font-semibold text-white">{status.delegateName}</p>
                      </div>
                    )}

                    <div className="bg-white/5 rounded-xl p-5 space-y-4">
                      {InviteIcon && (
                        <div className="flex items-center justify-between">
                          <span className="text-[0.8rem] text-white/50">Invite Status</span>
                          <span className={`flex items-center gap-1.5 text-[0.8rem] font-medium ${inviteConfig?.color}`}>
                            <InviteIcon className="w-4 h-4" />
                            {inviteConfig?.label}
                          </span>
                        </div>
                      )}

                      {kycConfig && (
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <span className="text-[0.8rem] text-white/50">KYC Status</span>
                          <span className={`flex items-center gap-1.5 text-[0.8rem] font-medium ${kycConfig.color}`}>
                            <kycConfig.icon className="w-4 h-4" />
                            {kycConfig.label}
                          </span>
                        </div>
                      )}

                      {status.rejectionReason && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-[0.75rem] text-white/30 mb-1">Reason for rejection:</p>
                          <p className="text-[0.8rem] text-coral">{status.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {kycStatus === "APPROVED" && (
                      <div className="flex items-center gap-3 rounded-xl bg-teal/10 p-4 text-left">
                        <ShieldCheck className="w-5 h-5 text-teal flex-shrink-0" />
                        <p className="font-body text-[0.8rem] text-white/70">
                          Your identity has been verified. The parent has been notified.
                        </p>
                      </div>
                    )}

                    {kycStatus === "REJECTED" && (
                      <div className="flex items-center gap-3 rounded-xl bg-coral/10 p-4 text-left">
                        <ShieldX className="w-5 h-5 text-coral flex-shrink-0" />
                        <p className="font-body text-[0.8rem] text-white/70">
                          Your KYC was not approved. Contact the parent who invited you for assistance.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            )}
          </AuthCard>
        </div>
      </div>
    </main>
  );
}
