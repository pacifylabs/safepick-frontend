import { z } from "zod";

export const RelationshipEnum = z.enum([
  "DRIVER",
  "NANNY",
  "RELATIVE",
  "TEACHER",
  "SCHOOL_BUS",
  "OTHER",
]);

export const KYCStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const AuthTypeEnum = z.enum(["ONE_TIME", "RECURRING", "DATE_RANGE"]);

export const AuthorizationStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "REVOKED", "EXPIRED"]);

export const AuthorizationSummarySchema = z.object({
  childId: z.string(),
  childName: z.string(),
  status: AuthorizationStatusEnum,
  allowedDays: z.array(z.string()).optional(),
  allowedTimeStart: z.string().optional(),
  allowedTimeEnd: z.string().optional(),
  authType: AuthTypeEnum,
});

export const DelegateProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  relationship: RelationshipEnum,
  photoUrl: z.string().nullable().optional(),
  kycStatus: KYCStatusEnum,
  kycVerifiedAt: z.string().nullable().optional(),
  failureReason: z.string().nullable().optional(),
  authorizations: z.array(AuthorizationSummarySchema),
});

export const DelegateListResponseSchema = z.object({
  delegates: z.array(DelegateProfileSchema),
});

export const CreateInvitePayloadSchema = z.object({
  childIds: z.array(z.string()).min(1, "Select at least one child"),
  relationship: RelationshipEnum,
  specificRelationship: z.string().optional(), // For "RELATIVE"
  delegateName: z.string().min(2, "Name must be at least 2 characters"),
  delegatePhone: z.string().min(7, "Enter a valid phone number"),
  delegateGender: z.enum(["MALE", "FEMALE", "OTHER"]),
  kycLevel: z.enum(["STANDARD", "ENHANCED"]),
  expiresInHours: z.number(),
});

export const InviteResponseSchema = z.object({
  inviteId: z.string(),
  inviteToken: z.string(),
  inviteUrl: z.string(),
  expiresAt: z.string(),
});

export const PendingInviteSchema = z.object({
  id: z.string(),
  inviteUrl: z.string(),
  relationship: RelationshipEnum,
  childIds: z.array(z.string()),
  expiresAt: z.string(),
  createdAt: z.string(),
  phone: z.string().optional(),
});

export const PendingInvitesResponseSchema = z.object({
  invites: z.array(PendingInviteSchema),
});

export type Relationship = z.infer<typeof RelationshipEnum>;
export type KYCStatus = z.infer<typeof KYCStatusEnum>;
export type AuthType = z.infer<typeof AuthTypeEnum>;
export type AuthorizationStatus = z.infer<typeof AuthorizationStatusEnum>;
export type AuthorizationSummary = z.infer<typeof AuthorizationSummarySchema>;
export type DelegateProfile = z.infer<typeof DelegateProfileSchema>;
export type CreateInvitePayload = z.infer<typeof CreateInvitePayloadSchema>;
export type InviteResponse = z.infer<typeof InviteResponseSchema>;
export type PendingInvite = z.infer<typeof PendingInviteSchema>;
