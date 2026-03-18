"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  ShieldX, 
  User, 
  Phone, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { useValidateInviteToken } from "@/hooks/useSecondaryGuardian";
import { secondaryGuardianService } from "@/services/secondaryGuardian.service";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useState } from "react";

export default function SecondaryJoinPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { data: inviteData, isLoading, error } = useValidateInviteToken(token);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleSendCode = async () => {
    if (!inviteData) return;
    setIsSendingCode(true);
    try {
      const { otpToken } = await secondaryGuardianService.secondaryLogin(inviteData.phone);
      router.push(`/secondary/verify?token=${token}&otpToken=${encodeURIComponent(otpToken)}&phone=${encodeURIComponent(inviteData.phone)}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--auth-bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Handle error states
  const errorMsg = error instanceof Error ? error.message : "";
  if (error || !inviteData || !inviteData.valid) {
    let icon = <ShieldX className="w-16 h-16 text-[#D85A30]" />;
    let title = "Invalid invite link";
    let subtext = "This link is not valid. Check your SMS or WhatsApp for the correct link.";
    let showLogin = false;

    if (errorMsg.includes("EXPIRED")) {
      icon = <Clock className="w-16 h-16 text-[#EF9F27]" />;
      title = "This invite has expired";
      subtext = `Ask ${inviteData?.inviterName || "the parent"} to send you a new invite.`;
    } else if (errorMsg.includes("USED")) {
      icon = <CheckCircle className="w-16 h-16 text-[#0FA37F]" />;
      title = "Already accepted";
      subtext = "You have already accepted this invitation. Log in to respond to pickup requests.";
      showLogin = true;
    }

    return (
      <div className="min-h-screen bg-[var(--auth-bg)] flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">{icon}</div>
        <h1 className="font-display text-[1.75rem] text-white mb-3">{title}</h1>
        <p className="font-body text-[0.875rem] text-[var(--auth-text-muted)] max-w-[300px] leading-relaxed mb-8">
          {subtext}
        </p>
        {showLogin && (
          <Button variant="primary" onClick={() => router.push("/secondary/login")}>
            Log in
          </Button>
        )}
      </div>
    );
  }

  return (
    <main className="bg-[var(--auth-bg)] min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] mx-auto flex flex-col items-center"
      >
        <Logo variant="light" size="sm" className="mb-8" />
        
        <span className="font-body text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#0FA37F] mb-3">
          JOIN AS GUARDIAN
        </span>
        
        <h1 className="font-display text-[2rem] font-semibold text-white text-center leading-[1.08] tracking-[-0.03em] mb-2">
          You've been invited
        </h1>
        
        <p className="font-body text-[0.875rem] text-[var(--auth-text-muted)] text-center leading-relaxed mb-8">
          {inviteData.inviterName} has added you as their secondary guardian on SafePick.
        </p>

        {/* Info Cards */}
        <div className="w-full space-y-4 mb-10">
          <div className="bg-[var(--auth-surface)] border border-[var(--auth-border)] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#0FA37F]" />
              <p className="font-body text-[0.82rem] text-white/70">
                Added by <span className="text-white font-medium">{inviteData.inviterName}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#0FA37F]" />
              <p className="font-body text-[0.82rem] text-white/70">
                Your number <span className="text-white font-medium">{inviteData.phone.replace(/.(?=.{4})/g, "•")}</span>
              </p>
            </div>
          </div>

          <div className="bg-[#FAEEDA]/10 border border-[#EF9F27]/20 rounded-2xl p-5">
            <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#EF9F27] mb-3">
              WHAT THIS MEANS
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[#EF9F27] rounded-full mt-1.5 flex-shrink-0" />
                <p className="font-body text-[0.82rem] text-white/60">
                  You'll be notified if {inviteData.inviterName} can't respond to a pickup request
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[#EF9F27] rounded-full mt-1.5 flex-shrink-0" />
                <p className="font-body text-[0.82rem] text-white/60">
                  You can approve or deny child pickups
                </p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[#EF9F27] rounded-full mt-1.5 flex-shrink-0" />
                <p className="font-body text-[0.82rem] text-white/60">
                  You don't need a full SafePick account
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Action */}
        <div className="w-full">
          <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest [var(--auth-text-muted)]/60 mb-3 text-center">
            STEP 1 OF 2 — VERIFY YOUR PHONE
          </p>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleSendCode}
            loading={isSendingCode}
            className="h-14 text-[1rem]"
          >
            Send verification code
          </Button>
          <p className="font-body text-[0.82rem] [var(--auth-text-muted)]/60 text-center mt-4">
            A 6-digit code will be sent to your phone.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
