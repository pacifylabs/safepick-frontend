import { z } from "zod";

export const IdTypeEnum = z.enum(["NIN", "VOTER_CARD", "PASSPORT", "DRIVERS_LICENSE"]);

export const InviteStatusEnum = z.enum(["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"]);

export const KycRecordStatusEnum = z.enum(["PENDING", "SUBMITTED", "APPROVED", "REJECTED"]);

export const SubmitKycRequestSchema = z.object({
  inviteToken: z.string().uuid("Invalid invite token"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email").optional(),
  relationship: z.string().optional(),
  idType: IdTypeEnum,
  idNumber: z.string().min(4, "ID number must be at least 4 characters"),
  idDocumentUrl: z.string().url("Enter a valid document URL"),
  selfieUrl: z.string().url("Enter a valid selfie URL"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  consentAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the privacy policy" }),
  }),
});

export const SubmitKycResponseSchema = z.object({
  delegateProfile: z.object({
    id: z.string(),
    fullName: z.string(),
    phone: z.string(),
    status: z.literal("SUBMITTED"),
    createdAt: z.string(),
  }),
  kycRecord: z.object({
    id: z.string(),
    idType: z.string(),
    status: z.literal("SUBMITTED"),
    submittedAt: z.string(),
  }),
  invite: z.object({
    id: z.string(),
    status: z.literal("ACCEPTED"),
  }),
});

export const KycStatusRequestSchema = z.object({
  inviteToken: z.string().uuid("Invalid invite token"),
});

export const KycStatusResponseSchema = z.object({
  inviteStatus: InviteStatusEnum,
  kycStatus: KycRecordStatusEnum.nullable(),
  delegateName: z.string().nullable(),
  rejectionReason: z.string().nullable().optional(),
});

export const CreateDelegateInviteRequestSchema = z.object({
  childId: z.string().uuid(),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(7, "Enter a valid phone number"),
  relationship: z.string().optional(),
});

export const CreateDelegateInviteResponseSchema = z.object({
  invite: z.object({
    id: z.string(),
    childId: z.string(),
    delegateFullName: z.string(),
    delegatePhone: z.string(),
    status: z.literal("PENDING"),
    expiresAt: z.string(),
    createdAt: z.string(),
  }),
  inviteToken: z.string(),
});

export type IdType = z.infer<typeof IdTypeEnum>;
export type InviteStatus = z.infer<typeof InviteStatusEnum>;
export type KycRecordStatus = z.infer<typeof KycRecordStatusEnum>;
export type SubmitKycRequest = z.infer<typeof SubmitKycRequestSchema>;
export type SubmitKycResponse = z.infer<typeof SubmitKycResponseSchema>;
export type KycStatusRequest = z.infer<typeof KycStatusRequestSchema>;
export type KycStatusResponse = z.infer<typeof KycStatusResponseSchema>;
export type CreateDelegateInviteRequest = z.infer<typeof CreateDelegateInviteRequestSchema>;
export type CreateDelegateInviteResponse = z.infer<typeof CreateDelegateInviteResponseSchema>;
