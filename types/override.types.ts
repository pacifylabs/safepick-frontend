import { z } from "zod";

export const OverrideCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  school: z.object({
    id: z.string(),
    name: z.string(),
  }),
  expiresAt: z.string(),
  usesRemaining: z.number(),
  status: z.enum(["ACTIVE", "USED", "EXPIRED", "REVOKED"]),
  createdAt: z.string(),
});

export type OverrideCode = z.infer<typeof OverrideCodeSchema>;

export const GenerateOverridePayloadSchema = z.object({
  childId: z.string(),
  schoolId: z.string(),
  validForHours: z.number().default(72),
  maxUses: z.number().default(1),
});

export type GenerateOverridePayload = z.infer<typeof GenerateOverridePayloadSchema>;

export const GenerateOverrideResponseSchema = z.object({
  overrideCode: OverrideCodeSchema,
});

export type GenerateOverrideResponse = z.infer<typeof GenerateOverrideResponseSchema>;

export const OverrideSubmitPayloadSchema = z.object({
  overrideCode: z.string(),
  schoolAdminId: z.string(),
});

export type OverrideSubmitPayload = z.infer<typeof OverrideSubmitPayloadSchema>;

export const OverrideSubmitResponseSchema = z.object({
  status: z.string(),
  overrideCodeId: z.string(),
  auditEntryId: z.string(),
  parentNotifiedAt: z.string(),
});

export type OverrideSubmitResponse = z.infer<typeof OverrideSubmitResponseSchema>;

export const SecondaryGuardianTokenResponseSchema = z.object({
  valid: z.boolean(),
  pickupRequestId: z.string(),
  delegate: z.object({
    fullName: z.string(),
    photoUrl: z.string().nullable(),
    relationship: z.string(),
  }),
  child: z.object({
    fullName: z.string(),
    grade: z.string(),
    photoUrl: z.string().nullable(),
  }),
  school: z.object({
    name: z.string(),
    address: z.string(),
  }),
  verificationMethod: z.enum(["QR", "OTP", "BIOMETRIC"]),
  secondsRemaining: z.number(),
  timeoutAt: z.string(),
});

export type SecondaryGuardianTokenResponse = z.infer<typeof SecondaryGuardianTokenResponseSchema>;

export const SecondaryGuardianRespondPayloadSchema = z.object({
  decision: z.enum(["APPROVE", "DENY"]),
});

export type SecondaryGuardianRespondPayload = z.infer<typeof SecondaryGuardianRespondPayloadSchema>;

export const SecondaryGuardianRespondResponseSchema = z.object({
  pickupRequestId: z.string(),
  status: z.enum(["APPROVED", "DENIED"]),
  respondedBy: z.string(),
  respondedAt: z.string(),
  incidentId: z.string().optional(),
  schoolNotified: z.boolean(),
  primaryParentNotified: z.boolean(),
});

export type SecondaryGuardianRespondResponse = z.infer<typeof SecondaryGuardianRespondResponseSchema>;
