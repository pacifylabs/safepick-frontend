"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/ui/AuthCard";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";
import { verifyOtp, resendOtp as resendOtpService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export default function VerifyPage() {
  const router = useRouter();
  const setSession = useAuthStore((state: any) => state.setSession);
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const initialOtpToken = searchParams.get("otpToken") || "";

  const [otpToken, setOtpToken] = useState(initialOtpToken);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOtpComplete = async (otp: string) => {
    if (attemptsRemaining === 0) return;
    
    setIsVerifying(true);
    setHasError(false);
    try {
      const response = await verifyOtp({ otpToken, otp });
      setSession(response.user as any, response.accessToken);
      router.push("/signup/success");
    } catch (err) {
      setHasError(true);
      setAttemptsRemaining((prev) => Math.max(0, prev - 1));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    try {
      const response = await resendOtpService({ otpToken });
      setOtpToken(response.otpToken);
      setCooldown(60);
      setHasError(false);
      setAttemptsRemaining(3);
    } catch (err) {
      // Handle error
    }
  };

  return (
    <AuthCard>
      <button
        onClick={() => router.back()}
        className="mb-4 sm:mb-6 flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      <div className="mb-6 sm:mb-8">
        <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
          VERIFICATION
        </span>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
          Check your <i className="text-teal-mid not-italic">phone</i>
        </h1>
        <p className="mt-2 sm:mt-3 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-white/50">
          We sent a 6-digit code to <span className="font-medium text-white">{phone}</span>
        </p>
      </div>

      <div className="flex flex-col items-center">
        <OtpInput
          length={6}
          onComplete={handleOtpComplete}
          error={hasError}
          disabled={isVerifying || attemptsRemaining === 0}
        />

        {hasError && attemptsRemaining > 0 && (
          <p className="mt-2 sm:mt-3 text-center text-[0.74rem] sm:text-[0.78rem] text-coral-light">
            Incorrect code. {attemptsRemaining} attempts remaining.
          </p>
        )}

        {attemptsRemaining === 0 && (
          <p className="mt-2 sm:mt-3 text-center text-[0.74rem] sm:text-[0.78rem] text-coral-light">
            No attempts remaining. Please resend the code.
          </p>
        )}

        <Button
          variant="primary"
          fullWidth
          loading={isVerifying}
          disabled={attemptsRemaining === 0}
          className="mt-4 sm:mt-6"
          onClick={() => {
            // Trigger manual check if needed, but handleOtpComplete handles it on fill
          }}
        >
          Verify
        </Button>

        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-xs sm:text-sm">
          <span className="text-[var(--auth-text-muted)]">Didn't receive it?</span>
          {cooldown > 0 ? (
            <span className="text-[var(--auth-text-muted)]/60">Resend in 0:{cooldown.toString().padStart(2, "0")}</span>
          ) : (
            <button
              onClick={handleResend}
              className="font-medium text-teal hover:underline"
            >
              Resend code
            </button>
          )}
        </div>
      </div>
    </AuthCard>
  );
}
