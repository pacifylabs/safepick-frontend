import { create } from "zustand";
import { VerificationSession, VerificationMethod } from "../types/verification.types";

interface VerificationState {
  activeSession: VerificationSession | null;
  currentStep: "IDENTITY_CONFIRMED" | "OTP_ENTRY" | "BIOMETRIC_PROMPT" | "AWAITING_PARENT" | "IDLE" | "SCANNING";
  verificationMethod: VerificationMethod;
  fallbackReason: string | null;
  otpAttemptsRemaining: number;
  
  setSession: (session: VerificationSession | null) => void;
  setCurrentStep: (step: VerificationState["currentStep"]) => void;
  setVerificationMethod: (method: VerificationMethod) => void;
  setFallbackReason: (reason: string | null) => void;
  decrementOtpAttempts: () => void;
  resetSession: () => void;
}

export const useVerificationStore = create((set: any) => ({
  activeSession: null,
  currentStep: "IDLE",
  verificationMethod: "QR",
  fallbackReason: null,
  otpAttemptsRemaining: 3,

  setSession: (session: any) => set({ activeSession: session }),
  setCurrentStep: (step: any) => set({ currentStep: step }),
  setVerificationMethod: (method: any) => set({ verificationMethod: method }),
  setFallbackReason: (reason: any) => set({ fallbackReason: reason }),
  decrementOtpAttempts: () => set((state: any) => ({ otpAttemptsRemaining: state.otpAttemptsRemaining - 1 })),
  resetSession: () => set({
    activeSession: null,
    currentStep: "IDLE",
    verificationMethod: "QR",
    fallbackReason: null,
    otpAttemptsRemaining: 3,
  }),
}));
