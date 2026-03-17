import { z } from "zod";

export const PickupStatusEnum = z.enum([
  "AWAITING_PARENT",
  "AWAITING_SECONDARY",
  "APPROVED",
  "DENIED",
  "TIMED_OUT",
  "CHILD_HELD",
]);

export type PickupStatus = z.infer<typeof PickupStatusEnum>;

export const TERMINAL_PICKUP_STATUSES = [
  "APPROVED",
  "DENIED",
  "TIMED_OUT",
  "CHILD_HELD",
] as const;

export const VerificationMethodEnum = z.enum(["QR", "OTP", "BIOMETRIC"]);

export const PickupRequestSchema = z.object({
  pickupRequestId: z.string(),
  status: PickupStatusEnum,
  delegate: z.object({
    id: z.string(),
    fullName: z.string(),
    photoUrl: z.string().nullable(),
    relationship: z.string(),
  }),
  child: z.object({
    id: z.string(),
    fullName: z.string(),
    photoUrl: z.string().nullable(),
    grade: z.string(),
    safepickId: z.string(),
  }),
  school: z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
  }),
  verificationMethod: VerificationMethodEnum,
  timeoutAt: z.string(),
  secondsRemaining: z.number(),
  createdAt: z.string(),
});

export const PickupRespondPayloadSchema = z.object({
  decision: z.enum(["APPROVE", "DENY"]),
  responderId: z.string(),
});

export const PickupResponseSchema = z.object({
  pickupRequestId: z.string(),
  status: z.enum(["APPROVED", "DENIED"]),
  respondedBy: z.string(),
  respondedAt: z.string(),
  incidentId: z.string().optional(),
  schoolNotified: z.boolean(),
  delegateNotified: z.boolean(),
});

export const RecentPickupItemSchema = z.object({
  id: z.string(),
  status: PickupStatusEnum,
  childName: z.string(),
  delegateName: z.string(),
  schoolName: z.string(),
  timestamp: z.string(),
  incidentId: z.string().optional(),
});

export const QrTokenSchema = z.object({
  qrToken: z.string(),
  qrPayload: z.string(),
  expiresAt: z.string(),
  delegateName: z.string(),
  childName: z.string(),
});

export type VerificationMethod = z.infer<typeof VerificationMethodEnum>;
export type PickupRequest = z.infer<typeof PickupRequestSchema>;
export type PickupRespondPayload = z.infer<typeof PickupRespondPayloadSchema>;
export type PickupResponse = z.infer<typeof PickupResponseSchema>;
export type RecentPickupItem = z.infer<typeof RecentPickupItemSchema>;
export type QrToken = z.infer<typeof QrTokenSchema>;
