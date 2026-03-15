import { z } from "zod";
import { DelegateProfileSchema } from "./delegates.types";

export const AuthTypeEnum = z.enum(["ONE_TIME", "RECURRING", "DATE_RANGE"]);
export type AuthType = z.infer<typeof AuthTypeEnum>;

export const AuthorizationStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "REVOKED", "EXPIRED"]);
export type AuthorizationStatus = z.infer<typeof AuthorizationStatusEnum>;

export const AuthorizationSchema = z.object({
  id: z.string(),
  delegate: z.object({
    id: z.string(),
    fullName: z.string(),
    photoUrl: z.string().nullable().optional(),
    relationship: z.string(),
  }),
  delegateProfileId: z.string().optional(),
  delegateName: z.string().optional(),
  childId: z.string(),
  childName: z.string(),
  authType: AuthTypeEnum,
  allowedDays: z.array(z.string()),
  allowedTimeStart: z.string(),
  allowedTimeEnd: z.string(),
  validFrom: z.string(),
  validUntil: z.string().nullable(),
  status: AuthorizationStatusEnum,
  createdAt: z.string(),
});

export type Authorization = z.infer<typeof AuthorizationSchema>;

export const CreateAuthorizationPayloadSchema = z.object({
  delegateProfileId: z.string(),
  childId: z.string(),
  authType: AuthTypeEnum,
  allowedDays: z.array(z.string()),
  allowedTimeStart: z.string(),
  allowedTimeEnd: z.string(),
  validFrom: z.string(),
  validUntil: z.string().nullable(),
});

export type CreateAuthorizationPayload = z.infer<typeof CreateAuthorizationPayloadSchema>;

export const UpdateAuthorizationPayloadSchema = z.object({
  authType: AuthTypeEnum.optional(),
  allowedDays: z.array(z.string()).optional(),
  allowedTimeStart: z.string().optional(),
  allowedTimeEnd: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().nullable().optional(),
  status: AuthorizationStatusEnum.optional(),
});

export type UpdateAuthorizationPayload = z.infer<typeof UpdateAuthorizationPayloadSchema>;

export const RejectDelegatePayloadSchema = z.object({
  delegateProfileId: z.string(),
  childId: z.string(),
  reason: z.string().optional(),
});

export type RejectDelegatePayload = z.infer<typeof RejectDelegatePayloadSchema>;

export const MessageResponseSchema = z.object({
  message: z.string(),
  revokedAt: z.string().optional(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
