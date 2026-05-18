import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/stores/auth.store";
import {
  ChangePasswordPayload,
  CreateIncidentReportPayload,
  CreateProfileGuardianPayload,
  UpdateProfilePayload,
  UpdateSecuritySettingsPayload,
} from "@/types/profile.types";

export const profileKeys = {
  profile: ["profile"] as const,
  security: ["profile", "security-settings"] as const,
  guardians: ["profile", "secondary-guardians"] as const,
  incidents: ["profile", "incident-reports"] as const,
};

export function useProfile() {
  const accessToken = useAuthStore((state: any) => state.accessToken);

  return useQuery({
    queryKey: profileKeys.profile,
    queryFn: () => profileService.getProfile(),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 3,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.profile, profile);
    },
  });
}

export function useProfileSecuritySettings() {
  const accessToken = useAuthStore((state: any) => state.accessToken);

  return useQuery({
    queryKey: profileKeys.security,
    queryFn: () => profileService.getSecuritySettings(),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 3,
  });
}

export function useUpdateProfileSecuritySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSecuritySettingsPayload) =>
      profileService.updateSecuritySettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(profileKeys.security, settings);
      queryClient.invalidateQueries({ queryKey: profileKeys.profile });
    },
  });
}

export function useChangeProfilePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileService.changePassword(payload),
  });
}

export function useProfileSecondaryGuardians() {
  const accessToken = useAuthStore((state: any) => state.accessToken);

  return useQuery({
    queryKey: profileKeys.guardians,
    queryFn: () => profileService.getSecondaryGuardians(),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateProfileSecondaryGuardian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProfileGuardianPayload) =>
      profileService.createSecondaryGuardian(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.guardians });
      queryClient.invalidateQueries({ queryKey: profileKeys.profile });
    },
  });
}

export function useRevokeProfileSecondaryGuardian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.revokeSecondaryGuardian(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.guardians });
      queryClient.invalidateQueries({ queryKey: profileKeys.profile });
    },
  });
}

export function useProfileIncidentReports() {
  const accessToken = useAuthStore((state: any) => state.accessToken);

  return useQuery({
    queryKey: profileKeys.incidents,
    queryFn: () => profileService.getIncidentReports(),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateProfileIncidentReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateIncidentReportPayload) =>
      profileService.createIncidentReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.incidents });
    },
  });
}
