"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/ui/AuthCard";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { delegateService } from "@/services/delegate.service";
import { useDelegateAuthStore } from "@/stores/delegateAuth.store";
import { useToastStore } from "@/stores/toast.store";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";

export default function DelegateVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const initialToken = searchParams.get("token") || "";

  const [otpToken, setOtpToken] = useState(initialToken);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(5);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isNotVerified, setIsNotVerified] = useState(false);

  const { setDelegate, setTokens } = useDelegateAuthStore();
  const addToast = useToastStore((state: any) => state.addToast);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleOtpComplete = async (otp: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const response = await delegateService.verifyOtp(otpToken, otp);
      
      // Set session in store
      setTokens(response.accessToken, response.refreshToken);
      setDelegate(response.delegate);
      
      // Set cookie for middleware and layout
      Cookies.set("delegate-access-token", response.accessToken, { expires: 7 });
      
      addToast({
        message: "Signed in successfully",
        variant: "success",
      });

      router.push("/delegate/dashboard");
    } catch (err: any) {
      if (err.data?.error === "DELEGATE_NOT_VERIFIED") {
        setIsNotVerified(true);
      } else {
        setAttempts((prev) => Math.max(0, prev - 1));
        const errMsg = err.message || "Incorrect code. Please try again.";
        setError(errMsg);
        addToast({
          message: errMsg,
          variant: "danger",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    try {
      const response = await delegateService.login(phone);
      setOtpToken(response.otpToken);
      setResendTimer(60);
      addToast({
        message: "Code resent successfully",
        variant: "success",
      });
    } catch (err: any) {
      const errMsg = err.message || "Failed to resend code.";
      setError(errMsg);
      addToast({
        message: errMsg,
        variant: "danger",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isNotVerified) {
    return (
      <main className="min-h-screen bg-[#0B1A2C] flex flex-col items-center justify-center p-6">
        <AuthCard>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#EF9F27]/10 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="text-[#EF9F27] w-10 h-10" />
            </div>
            
            <h1 className="text-2xl font-semibold text-white mb-4 font-display">
              Verification pending
            </h1>
            
            <p className="text-white/50 mb-8 leading-relaxed max-w-[280px]">
              Your identity is still being reviewed. You'll receive an SMS once approved.
            </p>

            <Button
              variant="ghost"
              className="text-white/70 hover:text-white"
              onClick={() => router.push("/delegate/login")}
            >
              Back to login
            </Button>
          </div>
        </AuthCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1A2C] flex flex-col items-center justify-center p-6">
      <AuthCard>
        <button
          onClick={() => router.back()}
          className="text-white/40 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <SectionLabel className="text-[#0FA37F]">VERIFY YOUR PHONE</SectionLabel>
        
        <h1 className="text-3xl font-semibold text-white mt-4 mb-2 font-display">
          Check your <i className="text-[#0FA37F] not-italic">phone</i>
        </h1>
        
        <p className="text-white/50 mb-8 text-sm">
          We sent a code to <span className="text-white font-medium">{phone}</span>
        </p>

        <div className="space-y-8">
          <OtpInput
            length={6}
            onComplete={handleOtpComplete}
            disabled={isVerifying || attempts === 0}
            error={!!error}
          />

          {error && (
            <p className="text-coral text-sm text-center animate-shake">
              {error} {attempts > 0 && `(${attempts} attempts remaining)`}
            </p>
          )}

          <div className="pt-4 flex flex-col items-center gap-4">
            <button
              onClick={handleResend}
              disabled={isResending || resendTimer > 0}
              className="text-[#0FA37F] text-sm font-medium hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resendTimer > 0
                ? `Resend code in ${resendTimer}s`
                : "Didn't receive a code? Resend"}
            </button>
          </div>
        </div>
      </AuthCard>
    </main>
  );
}
