import { z } from "zod";

export const VerificationStatusEnum = z.enum([
  "IDLE",
  "SCANNING",
  "QR_VERIFIED",
  "OTP_PENDING",
  "OTP_VERIFIED",
  "BIOMETRIC_PENDING",
  "BIOMETRIC_VERIFIED",
  "AWAITING_PARENT",
  "APPROVED",
  "REJECTED",
  "RULES_VIOLATED",
  "EXPIRED"
]);

export type VerificationStatus = z.infer<typeof VerificationStatusEnum>;

export const VerificationMethodEnum = z.enum(["QR", "OTP", "BIOMETRIC"]);
export type VerificationMethod = z.infer<typeof VerificationMethodEnum>;

export const VerificationSessionSchema = z.object({
  id: z.string(),
  status: VerificationStatusEnum,
  verificationMethod: VerificationMethodEnum.optional(),
  expiresAt: z.string().optional(),
  delegate: z.object({
    id: z.string(),
    fullName: z.string(),
    relationship: z.string(),
    photoUrl: z.string().nullable().optional(),
    phone: z.string().optional(),
  }),
  child: z.object({
    id: z.string(),
    fullName: z.string(),
    photoUrl: z.string().nullable().optional(),
  }),
  parentName: z.string().optional(),
});

export type VerificationSession = z.infer<typeof VerificationSessionSchema>;

export const QrTokenResponseSchema = z.object({
  qrToken: z.string(),
  qrPayload: z.string(),
  expiresAt: z.string(),
  delegateName: z.string(),
  childName: z.string(),
});

export type QrTokenResponse = z.infer<typeof QrTokenResponseSchema>;

export interface ScanQrPayload {
  qrPayload: string;
}

export interface TriggerOtpPayload {
  sessionId: string;
}

export interface SubmitOtpPayload {
  sessionId: string;
  otp: string;
}

export interface SubmitBiometricPayload {
  sessionId: string;
  template?: string;
}
