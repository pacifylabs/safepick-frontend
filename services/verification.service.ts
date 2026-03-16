import { apiFetch } from "./apiClient";
import {
  QrTokenResponse,
  QrTokenResponseSchema,
  VerificationSession,
  VerificationSessionSchema,
  ScanQrPayload,
  TriggerOtpPayload,
  SubmitOtpPayload,
  SubmitBiometricPayload,
} from "../types/verification.types";

export const verificationService = {
  async getQrToken(authorizationId: string): Promise<QrTokenResponse> {
    const data = await apiFetch<any>(`/verification/qr-token?authorizationId=${authorizationId}`);
    return QrTokenResponseSchema.parse(data);
  },

  async scanQr(payload: ScanQrPayload): Promise<VerificationSession> {
    const data = await apiFetch<any>("/verification/scan-qr", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return VerificationSessionSchema.parse(data);
  },

  async triggerOtp(payload: TriggerOtpPayload): Promise<{ message: string; otpToken: string; expiresIn: number }> {
    return await apiFetch<any>("/verification/trigger-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async submitOtp(payload: SubmitOtpPayload): Promise<VerificationSession> {
    const data = await apiFetch<any>("/verification/submit-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return VerificationSessionSchema.parse(data);
  },

  async submitBiometric(payload: SubmitBiometricPayload): Promise<VerificationSession> {
    const data = await apiFetch<any>("/verification/submit-biometric", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return VerificationSessionSchema.parse(data);
  },

  async getSession(sessionId: string): Promise<VerificationSession> {
    const data = await apiFetch<any>(`/verification/session/${sessionId}`);
    return VerificationSessionSchema.parse(data);
  },
};
