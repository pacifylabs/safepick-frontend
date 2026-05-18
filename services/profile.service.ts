import { apiFetch } from "@/services/apiClient";
import {
  ChangePasswordPayload,
  ChangePasswordPayloadSchema,
  CreateIncidentReportPayload,
  CreateIncidentReportPayloadSchema,
  CreateProfileGuardianPayload,
  CreateProfileGuardianPayloadSchema,
  IncidentReportsResponseSchema,
  ParentProfile,
  ProfileIncidentReport,
  ProfileResponseSchema,
  ProfileSecondaryGuardian,
  ProfileSecondaryGuardiansResponseSchema,
  ProfileSecuritySettings,
  SecuritySettingsResponseSchema,
  UpdateProfilePayload,
  UpdateProfilePayloadSchema,
  UpdateProfileResponseSchema,
  UpdateSecuritySettingsPayload,
  UpdateSecuritySettingsPayloadSchema,
} from "@/types/profile.types";

function stripEmptyOptionalStrings(payload: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "")
  );
}

export const profileService = {
  getProfile: async (): Promise<ParentProfile> => {
    const data = await apiFetch<unknown>("/profile");
    return ProfileResponseSchema.parse(data).profile;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ParentProfile> => {
    const body = UpdateProfilePayloadSchema.parse(stripEmptyOptionalStrings(payload));
    const data = await apiFetch<unknown>("/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return UpdateProfileResponseSchema.parse(data).profile;
  },

  getSecuritySettings: async (): Promise<ProfileSecuritySettings> => {
    const data = await apiFetch<unknown>("/profile/security-settings");
    return SecuritySettingsResponseSchema.parse(data).securitySettings;
  },

  updateSecuritySettings: async (
    payload: UpdateSecuritySettingsPayload
  ): Promise<ProfileSecuritySettings> => {
    const body = UpdateSecuritySettingsPayloadSchema.parse(payload);
    const data = await apiFetch<unknown>("/profile/security-settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return SecuritySettingsResponseSchema.parse(data).securitySettings;
  },

  changePassword: async (
    payload: ChangePasswordPayload
  ): Promise<{ message: string }> => {
    const body = ChangePasswordPayloadSchema.parse(payload);
    return apiFetch<{ message: string }>("/profile/password", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  getSecondaryGuardians: async (): Promise<ProfileSecondaryGuardian[]> => {
    const data = await apiFetch<unknown>("/profile/secondary-guardians");
    return ProfileSecondaryGuardiansResponseSchema.parse(data).guardians;
  },

  createSecondaryGuardian: async (
    payload: CreateProfileGuardianPayload
  ): Promise<ProfileSecondaryGuardian> => {
    const body = CreateProfileGuardianPayloadSchema.parse(stripEmptyOptionalStrings(payload));
    const data = await apiFetch<any>("/profile/secondary-guardians", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return data.guardian ?? data.secondaryGuardian ?? data;
  },

  revokeSecondaryGuardian: async (id: string): Promise<{ message?: string }> => {
    return apiFetch<{ message?: string }>(`/profile/secondary-guardians/${id}/revoke`, {
      method: "PATCH",
    });
  },

  getIncidentReports: async (): Promise<ProfileIncidentReport[]> => {
    const data = await apiFetch<unknown>("/profile/incident-reports");
    return IncidentReportsResponseSchema.parse(data).incidentReports;
  },

  createIncidentReport: async (
    payload: CreateIncidentReportPayload
  ): Promise<ProfileIncidentReport> => {
    const body = CreateIncidentReportPayloadSchema.parse(stripEmptyOptionalStrings(payload));
    const data = await apiFetch<any>("/profile/incident-reports", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return data.incidentReport ?? data.report ?? data;
  },
};
