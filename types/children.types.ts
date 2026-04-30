import { z } from "zod";

export const SecondaryGuardianSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
});

export const SchoolSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const EnrollmentStatusSchema = z.enum([
  "PENDING_SCHOOL",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "SCHOOL_NOT_ON_SAFEPICK",
]);

export const ParentSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
});

export const ChildSchema = z.object({
  id: z.string(),
  safepickId: z.string(),
  fullName: z.string(),
  dateOfBirth: z.string(),
  grade: z.string(),
  photoUrl: z.string().nullable(),
  parentId: z.string().optional(),
  parent: ParentSchema.optional(),
  secondaryGuardianId: z.string().optional(),
  secondaryGuardian: SecondaryGuardianSchema.nullable().optional(),
  secondaryGuardianStatus: z.enum(["NONE", "PENDING_INVITE", "ACTIVE"]).optional(),
  mode: z.enum(["LIMITED", "FULL"]).optional(),
  school: SchoolSummarySchema.nullable().optional(),
  enrollmentStatus: EnrollmentStatusSchema.optional().default("PENDING_VERIFICATION"),
  createdAt: z.string(),
});

export const RegisterChildPayloadSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string(),
  grade: z.string().min(1, "Please select a grade"),
  photo: z.string().optional(),
  secondaryGuardian: z.object({
    phone: z.string().min(7, "Enter a valid phone number"),
  }).optional(),
});

export const ChildListResponseSchema = z.object({
  children: z.array(ChildSchema),
});

export const RegisterChildResponseSchema = z.object({
  child: ChildSchema,
});

export const GetChildResponseSchema = z.object({
  child: ChildSchema,
});

export const GuardianLookupResponseSchema = z.object({
  found: z.boolean(),
  user: SecondaryGuardianSchema.nullable(),
});

export type Parent = z.infer<typeof ParentSchema>;
export type Child = z.infer<typeof ChildSchema>;
export type RegisterChildPayload = z.infer<typeof RegisterChildPayloadSchema>;
export type GuardianLookupResponse = z.infer<typeof GuardianLookupResponseSchema>;
export type GetChildResponse = z.infer<typeof GetChildResponseSchema>;
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>;
