"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle, 
  Smartphone, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { secondaryGuardianService } from "@/services/secondaryGuardian.service";
import { useSecondaryAuthStore } from "@/stores/secondaryAuth.store";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { Logo } from "@/components/ui/Logo";
import { useToastStore } from "@/stores/toast.store";

export default function SecondaryVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToastStore();
  const { setSecondaryGuardian } = useSecondaryAuthStore();

  const token = searchParams.get("token");
  const otpToken = searchParams.get("otpToken");
  const phone = searchParams.get("phone");

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If missing params, redirect back
  useEffect(() => {
    if (!otpToken || !phone) {
      router.replace("/secondary/login");
    }
  }, [otpToken, phone, router]);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setIsVerifying(true);
    setError(null);
    try {
      if (token) {
        // ACCEPT INVITE FLOW
        const res = await secondaryGuardianService.acceptInvite(token, { otp, otpToken: otpToken! });
        setSecondaryGuardian(res.secondaryGuardian, { 
          accessToken: res.accessToken, 
          refreshToken: res.refreshToken 
        }, res.pendingPickupRequestId);
        router.push("/secondary/welcome");
      } else {
        // NORMAL LOGIN FLOW
        const res = await secondaryGuardianService.secondaryVerifyOtp(otpToken!, otp);
        setSecondaryGuardian(res.secondaryGuardian, { 
          accessToken: res.accessToken, 
          refreshToken: res.refreshToken 
        }, res.pendingPickupRequestId);
        
        if (res.pendingPickupRequestId) {
          router.push(`/secondary/pickup/${res.pendingPickupRequestId}`);
        } else {
          router.push("/secondary/history");
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      await secondaryGuardianService.secondaryLogin(phone!);
      addToast({ message: "New code sent", variant: "success" });
    } catch (err: any) {
      addToast({ message: err.message || "Failed to resend code", variant: "danger" });
    }
  };

  return (
    <main className="bg-[var(--auth-bg)] min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] mx-auto flex flex-col items-center"
      >
        <Logo variant="light" size="sm" className="mb-8" />
        
        <span className="font-body text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#0FA37F] mb-3">
          VERIFICATION
        </span>
        
        <h1 className="font-display text-[2rem] font-semibold text-white text-center leading-[1.08] tracking-[-0.03em] mb-2">
          Enter the code
        </h1>
        
        <p className="font-body text-[0.875rem] text-[var(--auth-text-muted)] text-center leading-relaxed mb-8">
          We sent a 6-digit code to <span className="text-white font-medium">{phone}</span>
        </p>

        <div className="w-full flex flex-col items-center">
          <OtpInput 
            length={6} 
            onComplete={(val) => {
              setOtp(val);
            }} 
          />
          
          {error && (
            <div className="mt-6 w-full bg-[#D85A30]/10 border border-[#D85A30]/30 rounded-xl p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#D85A30] flex-shrink-0" />
              <p className="font-body text-[0.78rem] text-[#D85A30]">{error}</p>
            </div>
          )}
        </div>

        <div className="w-full mt-10">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleVerify}
            loading={isVerifying}
            disabled={otp.length < 6}
            className="h-14 text-[1rem]"
          >
            {isVerifying ? "Verifying..." : "Verify & Continue"}
          </Button>
          
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="font-body text-[0.82rem] text-[var(--auth-text-muted)]">Didn't receive a code?</p>
            <button 
              onClick={handleResend}
              className="font-body text-[0.82rem] font-bold text-[#0FA37F] hover:underline"
            >
              Resend code
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
