import { z } from "zod";

export const NotifyChannelEnum = z.enum(["SMS", "WHATSAPP"]);
export type NotifyChannel = z.infer<typeof NotifyChannelEnum>;

export const SecondaryGuardianStatusEnum = z.enum([
  "PENDING_INVITE",
  "ACTIVE",
  "SUSPENDED",
  "REMOVED",
]);
export type SecondaryGuardianStatus = z.infer<typeof SecondaryGuardianStatusEnum>;

export const SecondaryGuardianAccountSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  notifyChannel: NotifyChannelEnum,
  status: SecondaryGuardianStatusEnum,
  acceptedAt: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type SecondaryGuardianAccount = z.infer<typeof SecondaryGuardianAccountSchema>;

export const InvitePayloadSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
  notifyChannel: NotifyChannelEnum,
});
export type InvitePayload = z.infer<typeof InvitePayloadSchema>;

export const InviteResponseSchema = z.object({
  secondaryGuardian: SecondaryGuardianAccountSchema,
  inviteSent: z.boolean(),
  channel: NotifyChannelEnum,
});
export type InviteResponse = z.infer<typeof InviteResponseSchema>;

export const InviteValidateResponseSchema = z.object({
  valid: z.boolean(),
  inviterName: z.string(),
  guardianName: z.string(),
  phone: z.string(),
  expiresAt: z.string(),
});
export type InviteValidateResponse = z.infer<typeof InviteValidateResponseSchema>;

export const SecondaryAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  secondaryGuardian: SecondaryGuardianAccountSchema,
  pendingPickupRequestId: z.string().nullable().optional(),
});
export type SecondaryAuthResponse = z.infer<typeof SecondaryAuthResponseSchema>;

export const SecondaryPickupResponseSchema = z.object({
  id: z.string(),
  pickupRequestId: z.string(),
  secondaryGuardianAccountId: z.string(),
  decision: z.enum(["APPROVE", "DENY"]),
  respondedAt: z.string(),
});
export type SecondaryPickupResponse = z.infer<typeof SecondaryPickupResponseSchema>;
