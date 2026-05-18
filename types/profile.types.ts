import { z } from "zod";

export const ProfileSecuritySettingsSchema = z.object({
  id: z.string(),
  parentId: z.string(),
  biometricEnabled: z.boolean(),
  pushNotificationsEnabled: z.boolean(),
  pickupAlertsEnabled: z.boolean(),
  incidentAlertsEnabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ProfileSecuritySettings = z.infer<typeof ProfileSecuritySettingsSchema>;

export const ProfileSecondaryGuardianSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
  relationship: z.string().nullable().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
}).passthrough();
export type ProfileSecondaryGuardian = z.infer<typeof ProfileSecondaryGuardianSchema>;

export const ProfileIncidentReportSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  occurredAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  status: z.string().optional(),
  childName: z.string().nullable().optional(),
  child: z.object({
    fullName: z.string().optional(),
  }).nullable().optional(),
}).passthrough();
export type ProfileIncidentReport = z.infer<typeof ProfileIncidentReportSchema>;

export const ParentProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string().nullable().optional(),
  role: z.string(),
  phoneVerified: z.boolean(),
  fcmToken: z.string().nullable().optional(),
  createdAt: z.string(),
  securitySettings: ProfileSecuritySettingsSchema.nullable().optional(),
  secondaryGuardians: z.array(ProfileSecondaryGuardianSchema).optional(),
}).passthrough();
export type ParentProfile = z.infer<typeof ParentProfileSchema>;

export const ProfileResponseSchema = z.object({
  profile: ParentProfileSchema,
});
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const UpdateProfilePayloadSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  email: z.string().email("Enter a valid email address").optional(),
  fcmToken: z.string().optional(),
});
export type UpdateProfilePayload = z.infer<typeof UpdateProfilePayloadSchema>;

export const UpdateProfileResponseSchema = z.object({
  message: z.string(),
  profile: ParentProfileSchema,
});
export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;

export const UpdateSecuritySettingsPayloadSchema = z.object({
  biometricEnabled: z.boolean().optional(),
  pushNotificationsEnabled: z.boolean().optional(),
  pickupAlertsEnabled: z.boolean().optional(),
  incidentAlertsEnabled: z.boolean().optional(),
});
export type UpdateSecuritySettingsPayload = z.infer<typeof UpdateSecuritySettingsPayloadSchema>;

export const SecuritySettingsResponseSchema = z.object({
  securitySettings: ProfileSecuritySettingsSchema,
});
export type SecuritySettingsResponse = z.infer<typeof SecuritySettingsResponseSchema>;

export const ChangePasswordPayloadSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
export type ChangePasswordPayload = z.infer<typeof ChangePasswordPayloadSchema>;

export const ProfileSecondaryGuardiansResponseSchema = z.object({
  guardians: z.array(ProfileSecondaryGuardianSchema),
});
export type ProfileSecondaryGuardiansResponse = z.infer<typeof ProfileSecondaryGuardiansResponseSchema>;

export const CreateProfileGuardianPayloadSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address").optional(),
  relationship: z.string().optional(),
});
export type CreateProfileGuardianPayload = z.infer<typeof CreateProfileGuardianPayloadSchema>;

export const IncidentReportsResponseSchema = z.object({
  incidentReports: z.array(ProfileIncidentReportSchema),
});
export type IncidentReportsResponse = z.infer<typeof IncidentReportsResponseSchema>;

export const CreateIncidentReportPayloadSchema = z.object({
  childId: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  occurredAt: z.string().optional(),
});
export type CreateIncidentReportPayload = z.infer<typeof CreateIncidentReportPayloadSchema>;
