import { z } from "zod";

export const SchoolStatusSchema = z.enum(["ACTIVE", "PENDING_ONBOARDING", "NOT_REGISTERED"]);

export const SchoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  status: SchoolStatusSchema,
  studentCount: z.number().optional(),
  pendingRequests: z.number().nullable().optional(),
});

export const SchoolSearchResponseSchema = z.object({
  schools: z.array(SchoolSchema),
});

export const LinkChildToSchoolPayloadSchema = z.object({
  schoolId: z.string(),
});

export const EnrollmentStatusEnumSchema = z.enum([
  "PENDING_SCHOOL",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "SCHOOL_NOT_ON_SAFEPICK",
]);

export const LinkChildToSchoolResponseSchema = z.object({
  enrollmentStatus: EnrollmentStatusEnumSchema,
  message: z.string(),
  adoptionRequestId: z.string().optional(),
  requestCount: z.number().optional(),
  threshold: z.number().optional(),
});

export const RequestSchoolPayloadSchema = z.object({
  childId: z.string(),
  schoolName: z.string().optional(),
  schoolId: z.string().optional(),
  schoolAddress: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const RequestSchoolResponseSchema = z.object({
  adoptionRequestId: z.string(),
  message: z.string(),
  requestCount: z.number(),
  threshold: z.number(),
});

export const EnrollmentStatusSchema = z.object({
  childId: z.string(),
  schoolId: z.string().optional(),
  status: EnrollmentStatusEnumSchema,
  school: SchoolSchema.optional(),
});

export const SchoolOnboardPayloadSchema = z.object({
  inviteToken: z.string(),
  adminName: z.string().min(2, "Enter your full name"),
  adminEmail: z.string().email("Enter a valid email"),
  adminPhone: z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(8, "Min. 8 characters"),
  kyc: z.object({
    documentType: z.enum(["GOVERNMENT_ID", "SCHOOL_REGISTRATION", "LICENSE"]),
    documentNumber: z.string().min(5, "Enter document number"),
    documentUrl: z.string().url("Enter valid document URL"),
  }).optional(),
});

export const VerifyOnboardOTPSchema = z.object({
  token: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export type SchoolStatus = z.infer<typeof SchoolStatusSchema>;
export type School = z.infer<typeof SchoolSchema>;
export type SchoolSearchResponse = z.infer<typeof SchoolSearchResponseSchema>;
export type LinkChildToSchoolPayload = z.infer<typeof LinkChildToSchoolPayloadSchema>;
export type EnrollmentStatusEnum = z.infer<typeof EnrollmentStatusEnumSchema>;
export type LinkChildToSchoolResponse = z.infer<typeof LinkChildToSchoolResponseSchema>;
export type RequestSchoolPayload = z.infer<typeof RequestSchoolPayloadSchema>;
export type RequestSchoolResponse = z.infer<typeof RequestSchoolResponseSchema>;
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>;
export type SchoolOnboardPayload = z.infer<typeof SchoolOnboardPayloadSchema>;
export type VerifyOnboardOTP = z.infer<typeof VerifyOnboardOTPSchema>;
