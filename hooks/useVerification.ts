import { useQuery, useMutation } from "@tanstack/react-query";
import { verificationService } from "../services/verification.service";
import {
  ScanQrPayload,
  TriggerOtpPayload,
  SubmitOtpPayload,
  SubmitBiometricPayload,
} from "../types/verification.types";

export function useQrToken(authorizationId: string) {
  return useQuery({
    queryKey: ["qr-token", authorizationId],
    queryFn: () => verificationService.getQrToken(authorizationId),
    enabled: !!authorizationId,
    refetchInterval: 14 * 60 * 1000, // Refresh every 14 mins (expires in 15)
  });
}

export function useScanQr() {
  return useMutation({
    mutationFn: (payload: ScanQrPayload) => verificationService.scanQr(payload),
  });
}

export function useTriggerOtp() {
  return useMutation({
    mutationFn: (payload: TriggerOtpPayload) => verificationService.triggerOtp(payload),
  });
}

export function useSubmitOtp() {
  return useMutation({
    mutationFn: (payload: SubmitOtpPayload) => verificationService.submitOtp(payload),
  });
}

export function useSubmitBiometric() {
  return useMutation({
    mutationFn: (payload: SubmitBiometricPayload) => verificationService.submitBiometric(payload),
  });
}

export function useVerificationSession(sessionId?: string) {
  return useQuery({
    queryKey: ["verification-session", sessionId],
    queryFn: () => verificationService.getSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      // Stop polling on terminal statuses
      if (["APPROVED", "REJECTED", "RULES_VIOLATED", "EXPIRED"].includes(data.status)) {
        return false;
      }
      return 2000;
    },
  });
}
