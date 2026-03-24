"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  Smartphone, 
  Fingerprint, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { VerificationSession } from "@/types/verification.types";
import { SessionStatusBanner } from "./SessionStatusBanner";
import { FallbackBanner } from "./FallbackBanner";
import { Button } from "@/components/ui/Button";
import { useSubmitOtp, useSubmitBiometric } from "@/hooks/useVerification";
import { useVerificationStore } from "@/stores/verification.store";
import { usePickupRequest } from "@/hooks/usePickupRequest";
import { useSubmitOverrideCode, useHoldChild } from "@/hooks/useOverride";
import { useClockOut } from "@/hooks/useAttendance";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useRef } from "react";

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
  const [isLockedDown, setIsLockedDown] = useState(false);
  
  const submitOtp = useSubmitOtp();
  const submitBiometric = useSubmitBiometric();

  // Listen for emergency panic
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "emergency.panic") {
        const { panicActive, childId } = event.data.data;
        if (panicActive) {
          // If childId is specified, only lockdown if it matches our session child
          if (!childId || childId === session.child.id) {
            setIsLockedDown(true);
          }
        } else {
          setIsLockedDown(false);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [session.child.id]);

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
          <GateAuthorizationView
            sessionId={session.id}
            delegate={session.delegate}
            child={session.child}
            onSessionEnd={onSessionEnd}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0B1A2C]">
      <AnimatePresence>
        {isLockedDown && (
          <motion.div
            key="lockdown"
            initial={{ opacity: 0, x: [0, -20, 20, -20, 20, 0] }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#1A0707] flex flex-col items-center justify-center p-20 text-center"
          >
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-[#D85A30]/20 flex items-center justify-center mb-10"
            >
              <ShieldAlert className="w-16 h-16 text-[#D85A30]" />
            </motion.div>
            <h1 className="font-display text-7xl font-bold text-white mb-6 uppercase tracking-tighter">EMERGENCY LOCKDOWN</h1>
            <p className="text-[#D85A30] text-2xl font-bold mb-10 uppercase tracking-[0.2em]">All release authorizations suspended</p>
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-10 max-w-[600px] w-full">
              <p className="text-white/60 text-xl leading-relaxed">
                A high-priority security alert has been triggered. Please keep the child in the school facility. 
                All gate operations are halted until the alert is cleared by the parent or school administration.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

function GateAuthorizationView({ 
  sessionId, 
  delegate, 
  child, 
  onSessionEnd 
}: { 
  sessionId: string; 
  delegate: any; 
  child: any; 
  onSessionEnd: () => void;
}) {
  const router = useRouter();
  // Using the sessionId as pickupRequestId for the demo/sprint
  const { data: request, isLoading, isError } = usePickupRequest(sessionId);
  const submitOverride = useSubmitOverrideCode();
  const holdChild = useHoldChild();
  const clockOut = useClockOut();

  const [overrideCode, setOverrideCode] = useState("");
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(30);

  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (request?.status === "RELEASED") {
      const timer = setInterval(() => {
        setResetCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/school/gate");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [request?.status, router]);

  const handleStartHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    holdInterval.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdInterval.current!);
          handleHoldChild();
          return 100;
        }
        return prev + 2.5; // 100% in 1000ms (40 steps of 25ms)
      });
    }, 25);
  };

  const handleStopHold = () => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleHoldChild = async () => {
    try {
      await holdChild.mutateAsync({
        pickupRequestId: sessionId,
        reason: "No override code available. Both guardians unreachable.",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitOverride = async () => {
    if (overrideCode.length < 14) return;
    try {
      await submitOverride.mutateAsync({
        pickupRequestId: sessionId,
        payload: {
          overrideCode,
          schoolAdminId: "staff_01", // In real app, get from auth
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReleased = async () => {
    try {
      await clockOut.mutateAsync({
        pickupRequestId: sessionId,
        gateKeeperId: "staff_01", // In real app, get from auth
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatOverrideCode = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    let formatted = cleaned;
    if (cleaned.startsWith("SAFE")) {
      if (cleaned.length > 4) {
        formatted = cleaned.slice(0, 4) + "-" + cleaned.slice(4);
      }
      if (cleaned.length > 8) {
        formatted = formatted.slice(0, 9) + "-" + formatted.slice(9, 13);
      }
    }
    return formatted.slice(0, 14);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-16 h-16 text-[#0FA37F] animate-spin" />
        <p className="font-display text-2xl text-white/40">Initializing authorization...</p>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <AlertCircle className="w-20 h-20 text-[#D85A30]" />
        <h2 className="font-display text-4xl font-semibold text-white">Authorization Error</h2>
        <p className="text-white/60 text-xl">Could not establish real-time link with parent.</p>
        <Button variant="primary" onClick={() => window.location.reload()} className="mt-4 h-16 px-10 text-lg">
          Retry Connection
        </Button>
      </div>
    );
  }

  // Handle different pickup request states
  if (request.status === "APPROVED" || request.status === "APPROVED_VIA_OVERRIDE") {
    return (
      <motion.div 
        initial={{ backgroundColor: "#0B1A2C" }}
        animate={{ backgroundColor: "#071A0E" }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <CheckCircle className="w-32 h-32 text-[#0FA37F]" />
        </motion.div>

        <div className="text-center space-y-4">
          <h2 className="font-display text-6xl font-semibold text-white">Release authorized</h2>
          <p className="text-white/60 text-2xl">
            {request.status === "APPROVED_VIA_OVERRIDE" ? "Approved via Emergency Override" : "Approved by Parent"}
          </p>
        </div>

        <div className="bg-white/5 rounded-[32px] p-8 mt-4 w-full max-w-[500px] border border-white/5">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {child.photoUrl ? <img src={child.photoUrl} alt="" className="w-full h-full object-cover" /> : child.fullName[0]}
            </div>
            <div className="flex-1">
              <p className="text-2xl text-white font-medium">{child.fullName}</p>
              <p className="text-white/40 text-lg mt-1">May leave with {delegate.fullName}</p>
            </div>
          </div>
          <div className="h-px bg-white/10 my-6" />
          <div className="flex items-center gap-3 text-white/30">
            <Clock className="w-5 h-5" />
            <p className="text-lg">Approved at {format(new Date(), "h:mm a")}</p>
          </div>
        </div>

        <Button 
          variant="primary" 
          className="h-20 px-12 text-xl rounded-2xl flex items-center gap-4 mt-4"
          onClick={handleConfirmReleased}
          loading={clockOut.isPending}
        >
          Confirm child released
          <ArrowRight className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  if (request.status === "RELEASED") {
    return (
      <motion.div 
        initial={{ backgroundColor: "#0B1A2C" }}
        animate={{ backgroundColor: "#071A0E" }}
        transition={{ duration: 1.0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-40 h-40 rounded-full bg-[#0FA37F]/10 flex items-center justify-center border-4 border-[#0FA37F]/30"
        >
          <CheckCircle className="w-20 h-20 text-[#0FA37F]" />
        </motion.div>

        <div className="text-center space-y-4">
          <h2 className="font-display text-7xl font-bold text-white tracking-tight">Released</h2>
          <p className="text-[#0FA37F] text-2xl font-medium">Attendance marked successfully</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-10 mt-4 w-full max-w-[560px] border border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-full border-4 border-[#0FA37F] p-1">
              <div className="w-full h-full rounded-full overflow-hidden">
                {child.photoUrl ? <img src={child.photoUrl} alt="" className="w-full h-full object-cover" /> : child.fullName[0]}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-3xl text-white font-bold">{child.fullName}</p>
              <p className="text-white/40 text-xl mt-1">Clocked out at {format(new Date(), "h:mm a")}</p>
            </div>
          </div>
          
          <div className="mt-10 flex justify-between items-center text-white/30 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <p className="text-lg">Parent notified</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#0FA37F]" />
              </div>
              <p className="text-lg">SafePick Confirmed</p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 h-3 bg-white/5">
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 30, ease: "linear" }}
            className="h-full bg-[#0FA37F]"
          />
        </div>
        
        <p className="text-white/20 text-lg font-medium mt-4">
          Resetting to home in {resetCountdown}s...
        </p>
      </motion.div>
    );
  }

  if (request.status === "DENIED") {
    return (
      <motion.div 
        initial={{ backgroundColor: "#0B1A2C" }}
        animate={{ backgroundColor: "#1A0707" }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <XCircle className="w-32 h-32 text-[#D85A30]" />
        </motion.div>

        <h2 className="font-display text-6xl font-semibold text-white">Release denied</h2>

        <div className="bg-[#D85A30]/10 border border-[#D85A30]/30 rounded-[32px] p-8 max-w-[540px] w-full text-center space-y-4">
          <p className="font-body text-2xl font-semibold text-[#D85A30]">Do NOT release this child.</p>
          <p className="text-white/60 text-xl leading-relaxed">
            The request has been denied. An incident has been filed automatically. 
            Keep {child.fullName} in school supervision.
          </p>
        </div>

        <Button 
          variant="ghost" 
          className="text-white/40 hover:text-white text-xl"
          onClick={() => router.push("/gate")}
        >
          Start new verification
        </Button>
      </motion.div>
    );
  }

  if (request.status === "AWAITING_SECONDARY") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-16">
        <div className="absolute top-8 right-8">
          <div className="flex items-center gap-2 bg-[#FAEEDA] px-4 py-2 rounded-full border border-[#EF9F27]/30">
            <div className="w-2 h-2 rounded-full bg-[#EF9F27] animate-pulse" />
            <span className="font-body text-sm font-bold text-[#BA7517] uppercase tracking-wider">Awaiting secondary guardian</span>
          </div>
        </div>

        <div className="bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-2xl p-6 mb-8 max-w-[480px] w-full flex items-center gap-4">
          <Clock className="w-6 h-6 text-[#EF9F27] flex-shrink-0" />
          <p className="font-body text-left text-[#8A5A00] leading-relaxed">
            Primary parent did not respond. Secondary guardian has been notified via SMS and WhatsApp.
          </p>
        </div>

        <div className="bg-white/5 rounded-[40px] p-10 max-w-[480px] w-full border border-white/10 mb-12">
          <div className="w-24 h-24 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6">
            {delegate.photoUrl ? <img src={delegate.photoUrl} alt="" className="w-full h-full object-cover" /> : delegate.fullName[0]}
          </div>
          <h3 className="font-display text-3xl font-semibold text-white mb-2">{delegate.fullName}</h3>
          <p className="text-white/40 uppercase tracking-widest text-lg font-medium mb-6">{delegate.relationship}</p>
          <div className="h-px bg-white/10 mb-6" />
          <p className="text-white/50 text-lg mb-2">Collecting</p>
          <p className="font-display text-3xl font-semibold text-white mb-1">{child.fullName}</p>
          <p className="text-white/30 text-lg">{request.school.name}</p>
        </div>

        <div className="w-full max-w-[480px] space-y-4">
          <div className="flex justify-between items-end px-1">
            <p className="text-white/30 text-lg uppercase tracking-widest font-bold">Secondary response expires in</p>
            <p className="font-display text-2xl font-bold text-[#EF9F27]">
              {Math.floor(request.secondsRemaining / 60)}:{(request.secondsRemaining % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden w-full">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: `${(request.secondsRemaining / 180) * 100}%` }}
              className="h-full rounded-full bg-[#EF9F27]"
            />
          </div>
          <div className="flex items-center gap-3 justify-center pt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-2.5 h-2.5 rounded-full bg-[#EF9F27]"
              />
            ))}
            <span className="text-[#EF9F27] text-lg font-medium">Waiting for secondary guardian</span>
          </div>
        </div>
      </div>
    );
  }

  if (request.status === "TIMED_OUT") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-16">
        <div className="absolute top-8 right-8">
          <div className="flex items-center gap-2 bg-[#FAECE7] px-4 py-2 rounded-full border border-[#D85A30]/30">
            <div className="w-2 h-2 rounded-full bg-[#D85A30] animate-pulse" />
            <span className="font-body text-sm font-bold text-[#D85A30] uppercase tracking-wider">Both guardians unreachable</span>
          </div>
        </div>

        <div className="bg-[#D85A30]/10 border border-[#D85A30]/30 rounded-2xl p-6 mb-8 max-w-[480px] w-full flex items-center gap-4 text-left">
          <AlertTriangle className="w-6 h-6 text-[#D85A30] flex-shrink-0" />
          <div>
            <p className="font-body text-[0.875rem] font-bold text-[#D85A30]">Neither guardian responded</p>
            <p className="font-body text-[0.78rem] text-[#D85A30]/70 mt-0.5">Enter the emergency override code or hold the child.</p>
          </div>
        </div>

        <div className="w-full max-w-[480px] space-y-8">
          <div>
            <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-white/30 mb-3 text-left">
              EMERGENCY OVERRIDE CODE
            </p>
            <input
              type="text"
              placeholder="SAFE-0000-XXXX"
              value={overrideCode}
              onChange={(e) => setOverrideCode(formatOverrideCode(e.target.value))}
              className={`bg-white/[0.07] border rounded-[14px] px-5 py-6 w-full text-center font-display text-[2rem] font-semibold text-white tracking-[0.2em] uppercase placeholder:text-white/10 focus:outline-none transition-all ${
                submitOverride.isError ? "border-[#D85A30] ring-4 ring-[#D85A30]/10" : "border-white/10 focus:border-[#0FA37F] focus:ring-4 focus:ring-[#0FA37F]/10"
              }`}
            />
            {submitOverride.isError && (
              <p className="font-body text-[0.875rem] text-[#D85A30] mt-3">Invalid, expired, or already used code.</p>
            )}
            <Button 
              variant="primary" 
              fullWidth 
              className="h-20 text-xl rounded-2xl mt-4"
              onClick={handleSubmitOverride}
              loading={submitOverride.isPending}
              disabled={overrideCode.length < 14}
            >
              Submit override code
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="font-body text-sm text-white/20 uppercase font-bold tracking-widest">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="space-y-4">
            <p className="font-body text-[0.82rem] text-white/40">No override code available?</p>
            <div className="relative overflow-hidden rounded-2xl">
              <button
                className={`w-full h-20 rounded-2xl font-body text-xl font-bold flex items-center justify-center gap-3 transition-all ${
                  holdChild.isPending ? "bg-[#D85A30]/50 cursor-not-allowed" : "bg-[#D85A30]/10 border border-[#D85A30]/30 text-[#D85A30] hover:bg-[#D85A30]/20"
                }`}
                onMouseDown={handleStartHold}
                onMouseUp={handleStopHold}
                onMouseLeave={handleStopHold}
                onTouchStart={handleStartHold}
                onTouchEnd={handleStopHold}
              >
                {holdChild.isPending ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Filing incident...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-6 h-6" />
                    <span>Hold child — file incident</span>
                  </>
                )}
              </button>
              {isHolding && (
                <div 
                  className="absolute bottom-0 left-0 h-2 bg-[#D85A30] transition-all duration-25" 
                  style={{ width: `${holdProgress}%` }}
                />
              )}
            </div>
            <p className="font-body text-[0.75rem] text-white/20">Hold button for 1s to confirm child hold.</p>
          </div>
        </div>
      </div>
    );
  }

  if (request.status === "CHILD_HELD") {
    return (
      <motion.div 
        initial={{ backgroundColor: "#0B1A2C" }}
        animate={{ backgroundColor: "#1A0707" }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <ShieldAlert className="w-32 h-32 text-[#D85A30]" />
        </motion.div>

        <h2 className="font-display text-6xl font-semibold text-white">Child is being held</h2>

        <div className="bg-[#D85A30]/10 border border-[#D85A30]/30 rounded-[32px] p-10 max-w-[540px] w-full text-center space-y-4">
          <p className="font-body text-2xl font-bold text-[#D85A30]">Keep {child.fullName} under supervision.</p>
          <p className="text-white/60 text-xl leading-relaxed">
            An incident has been automatically filed. The parent has been notified. 
            Do not release the child until further notice.
          </p>
          {request.incidentId && (
            <div className="bg-white/5 rounded-xl px-4 py-2 w-fit mx-auto mt-4">
              <p className="font-body text-sm text-white/40">Incident ref: {request.incidentId}</p>
            </div>
          )}
        </div>

        <Button 
          variant="ghost" 
          className="text-white/40 hover:text-white text-xl"
          onClick={() => router.push("/school/gate")}
        >
          Return to gate home
        </Button>
      </motion.div>
    );
  }

  // Default AWAITING_PARENT state
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-16">
      <div className="bg-white/5 rounded-[40px] p-10 max-w-[520px] w-full border border-white/10 mb-12">
        <div className="w-24 h-24 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6">
          {delegate.photoUrl ? <img src={delegate.photoUrl} alt="" className="w-full h-full object-cover" /> : delegate.fullName[0]}
        </div>
        <h3 className="font-display text-3xl font-semibold text-white mb-2">{delegate.fullName}</h3>
        <p className="text-white/40 uppercase tracking-widest text-lg font-medium mb-6">{delegate.relationship}</p>
        
        <div className="h-px bg-white/10 mb-6" />
        
        <p className="text-white/50 text-lg mb-2">Collecting</p>
        <p className="font-display text-3xl font-semibold text-white mb-1">{child.fullName}</p>
        <p className="text-white/30 text-lg">{request.school.name}</p>
      </div>

      <div className="space-y-8 w-full max-w-[520px]">
        <div className="flex items-center gap-4 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              className="w-3 h-3 rounded-full bg-[#0FA37F]"
            />
          ))}
          <span className="text-white/60 text-xl font-medium ml-2">Waiting for parent approval</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <p className="text-white/30 text-lg uppercase tracking-widest font-bold">Request expires in</p>
            <p className={`font-display text-2xl font-bold ${
              request.secondsRemaining < 30 ? 'text-[#D85A30]' : 'text-white/60'
            }`}>
              {Math.floor(request.secondsRemaining / 60)}:{(request.secondsRemaining % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden w-full">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ 
                width: `${(request.secondsRemaining / 180) * 100}%`,
                backgroundColor: request.secondsRemaining < 30 ? "#D85A30" : request.secondsRemaining < 60 ? "#EF9F27" : "#0FA37F"
              }}
              className="h-full rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

