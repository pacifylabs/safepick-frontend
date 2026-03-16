"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  Smartphone, 
  Fingerprint, 
  ArrowRight,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { VerificationSession } from "@/types/verification.types";
import { SessionStatusBanner } from "./SessionStatusBanner";
import { FallbackBanner } from "./FallbackBanner";
import { Button } from "@/components/ui/Button";
import { useSubmitOtp, useSubmitBiometric } from "@/hooks/useVerification";
import { useVerificationStore } from "@/stores/verification.store";

interface GateSessionViewProps {
  session: VerificationSession;
  onSessionEnd: () => void;
}

export function GateSessionView({ session, onSessionEnd }: GateSessionViewProps) {
  const { 
    currentStep, 
    setCurrentStep, 
    verificationMethod, 
    setVerificationMethod,
    fallbackReason,
    setFallbackReason,
    otpAttemptsRemaining,
    decrementOtpAttempts
  } = useVerificationStore();

  const [otpValue, setOtpValue] = useState("");
  const [biometricStatus, setBiometricStatus] = useState<"WAITING" | "SCANNING" | "SUCCESS" | "FAILED">("WAITING");
  
  const submitOtp = useSubmitOtp();
  const submitBiometric = useSubmitBiometric();

  const handleOtpSubmit = async () => {
    if (otpValue.length !== 6) return;
    try {
      await submitOtp.mutateAsync({ sessionId: session.id, otp: otpValue });
      setCurrentStep("AWAITING_PARENT");
    } catch (err: any) {
      decrementOtpAttempts();
      setOtpValue("");
      if (otpAttemptsRemaining <= 1) {
        setFallbackReason("OTP_FAILED");
        setVerificationMethod("BIOMETRIC");
        setCurrentStep("BIOMETRIC_PROMPT");
      }
    }
  };

  const handleBiometricSubmit = async (status: "SUCCESS" | "FAILED") => {
    setBiometricStatus("SCANNING");
    setTimeout(async () => {
      if (status === "SUCCESS") {
        try {
          await submitBiometric.mutateAsync({ sessionId: session.id });
          setBiometricStatus("SUCCESS");
          setTimeout(() => setCurrentStep("AWAITING_PARENT"), 1000);
        } catch (err) {
          setBiometricStatus("FAILED");
        }
      } else {
        setBiometricStatus("FAILED");
        setFallbackReason("BIOMETRIC_FAILED");
        setVerificationMethod("OTP");
        setCurrentStep("OTP_ENTRY");
      }
    }, 1500);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "IDENTITY_CONFIRMED":
        return (
          <motion.div 
            key="id-confirmed"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="grid grid-cols-2 gap-16 items-center flex-1 px-16"
          >
            <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {session.delegate.photoUrl ? (
                    <img src={session.delegate.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    session.delegate.fullName[0]
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#0FA37F] text-white p-2 rounded-full border-4 border-[#0B1A2C]">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <h3 className="font-display text-2xl font-semibold text-white mb-1">{session.delegate.fullName}</h3>
              <p className="text-white/40 uppercase tracking-widest text-sm font-medium">{session.delegate.relationship}</p>
              <div className="mt-6 bg-[#0FA37F]/10 text-[#0FA37F] py-2 px-4 rounded-full inline-block font-bold text-sm uppercase">
                QR Verified
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="font-display text-4xl font-semibold text-white mb-4">Identity confirmed</h2>
                <p className="text-white/60 text-xl leading-relaxed">
                  The delegate has been verified. We are now ready to notify the parent for final authorization.
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-[#0FA37F]">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2.5 h-2.5 rounded-full bg-current"
                    />
                  ))}
                </div>
                <span className="font-semibold uppercase tracking-wider text-sm">Ready for parent authorization</span>
              </div>

              <Button 
                variant="primary" 
                className="w-full h-20 text-xl rounded-2xl flex items-center justify-center gap-4"
                onClick={() => setCurrentStep("AWAITING_PARENT")}
              >
                Proceed to authorization
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        );

      case "OTP_ENTRY":
        return (
          <motion.div 
            key="otp-entry"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="grid grid-cols-2 gap-16 items-center flex-1 px-16"
          >
            <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10 opacity-50">
              <div className="w-32 h-32 rounded-full bg-[#EF9F27]/20 flex items-center justify-center text-[#EF9F27] mx-auto mb-6">
                <Smartphone className="w-16 h-16" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-white mb-1">{session.delegate.fullName}</h3>
              <div className="mt-6 bg-[#EF9F27]/10 text-[#EF9F27] py-2 px-4 rounded-full inline-block font-bold text-sm uppercase">
                OTP Verification
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="font-display text-4xl font-semibold text-white mb-2">Enter the code</h2>
                <p className="text-white/60 text-xl">
                  A 6-digit code was sent to <span className="text-white font-mono">••••4433</span>
                </p>
              </div>

              <div className="flex gap-3">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otpValue[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val) {
                        setOtpValue(prev => (prev + val).slice(0, 6));
                        if (i < 5) (e.target.nextSibling as HTMLInputElement)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpValue[i] && i > 0) {
                        setOtpValue(prev => prev.slice(0, -1));
                        ((e.target as HTMLInputElement).previousSibling as HTMLInputElement)?.focus();
                      }
                    }}
                    className="w-16 h-20 bg-white/5 border-2 border-white/10 rounded-2xl text-center text-3xl font-display font-bold text-white focus:border-[#0FA37F] focus:bg-white/10 outline-none transition-all"
                  />
                ))}
              </div>

              {submitOtp.isError && (
                <motion.p 
                  initial={{ x: -10 }} 
                  animate={{ x: [0, -10, 10, -10, 10, 0] }}
                  className="text-[#D85A30] font-semibold"
                >
                  Incorrect code. {otpAttemptsRemaining} attempts remaining.
                </motion.p>
              )}

              <div className="flex flex-col gap-4">
                <Button 
                  variant="primary" 
                  className="w-full h-20 text-xl rounded-2xl"
                  onClick={handleOtpSubmit}
                  loading={submitOtp.isPending}
                  disabled={otpValue.length !== 6}
                >
                  Verify Code
                </Button>
                <Button variant="ghost" className="text-white/40 hover:text-white">
                  Resend code (available in 45s)
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case "BIOMETRIC_PROMPT":
        return (
          <motion.div 
            key="biometric"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="grid grid-cols-2 gap-16 items-center flex-1 px-16"
          >
            <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10 opacity-50">
              <div className="w-32 h-32 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-6">
                <Fingerprint className="w-16 h-16" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-white mb-1">{session.delegate.fullName}</h3>
              <div className="mt-6 bg-blue-500/10 text-blue-400 py-2 px-4 rounded-full inline-block font-bold text-sm uppercase">
                Biometric
              </div>
            </div>

            <div className="space-y-8 text-center md:text-left">
              <div>
                <h2 className="font-display text-4xl font-semibold text-white mb-4">Place finger on reader</h2>
                <p className="text-white/60 text-xl">
                  Waiting for biometric input from the scanner device.
                </p>
              </div>

              <div className="flex justify-center md:justify-start">
                <motion.div
                  animate={{ scale: biometricStatus === "SCANNING" ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-48 h-48 rounded-3xl border-4 flex items-center justify-center transition-colors cursor-pointer ${
                    biometricStatus === "SCANNING" ? "border-blue-400 bg-blue-400/10" :
                    biometricStatus === "SUCCESS" ? "border-[#0FA37F] bg-[#0FA37F]/10" :
                    biometricStatus === "FAILED" ? "border-[#D85A30] bg-[#D85A30]/10" :
                    "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() => handleBiometricSubmit("SUCCESS")}
                >
                  {biometricStatus === "SCANNING" ? (
                    <Loader2 className="w-20 h-20 text-blue-400 animate-spin" />
                  ) : biometricStatus === "SUCCESS" ? (
                    <CheckCircle className="w-20 h-20 text-[#0FA37F]" />
                  ) : (
                    <Fingerprint className={`w-20 h-20 ${biometricStatus === "FAILED" ? "text-[#D85A30]" : "text-white/20"}`} />
                  )}
                </motion.div>
              </div>

              <div className="flex flex-col gap-4">
                <p className={`text-xl font-semibold ${
                  biometricStatus === "FAILED" ? "text-[#D85A30]" : "text-white/40"
                }`}>
                  {biometricStatus === "WAITING" ? "READY TO SCAN" :
                   biometricStatus === "SCANNING" ? "SCANNING..." :
                   biometricStatus === "SUCCESS" ? "VERIFIED" : "SCAN FAILED"}
                </p>
                <Button 
                  variant="ghost" 
                  className="text-white/40 hover:text-white w-fit px-0"
                  onClick={() => {
                    setVerificationMethod("OTP");
                    setCurrentStep("OTP_ENTRY");
                  }}
                >
                  Fall back to OTP
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case "AWAITING_PARENT":
        return (
          <motion.div 
            key="awaiting-parent"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-16"
          >
            <div className="relative mb-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 rounded-full border-4 border-white/5 border-t-[#0FA37F]"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Smartphone className="w-16 h-16 text-[#0FA37F]" />
              </motion.div>
            </div>

            <h2 className="font-display text-5xl font-semibold text-white mb-4">Waiting for parent</h2>
            <p className="text-white/60 text-2xl max-w-2xl leading-relaxed mb-12">
              Authorization request sent to <span className="text-white font-medium">{session.parentName || "the parent"}</span>. 
              Please ask the delegate to wait.
            </p>

            <div className="flex flex-col items-center gap-4">
              <span className="text-white/20 uppercase tracking-[0.2em] font-bold">Session Expires In</span>
              <div className="font-display text-7xl font-bold text-white tracking-tight">
                02:45
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B1A2C]">
      <SessionStatusBanner session={session} />
      
      <AnimatePresence>
        {fallbackReason && (
          <FallbackBanner 
            reason={fallbackReason as any} 
            onDismiss={() => setFallbackReason(null)} 
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}
