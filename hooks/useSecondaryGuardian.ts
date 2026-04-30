import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { secondaryGuardianService } from "@/services/secondaryGuardian.service";
import { InvitePayload } from "@/types/secondaryGuardian.types";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Parent scoped hooks (useSecondaryGuardian implementation)
 */
export function useSecondaryGuardians() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["secondary-guardians"],
    queryFn: () => secondaryGuardianService.getSecondaryGuardians(),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes - occasionally changes
  });
}

export function useInviteSecondaryGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvitePayload) =>
      secondaryGuardianService.inviteSecondaryGuardian(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secondary-guardians"] });
    },
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => secondaryGuardianService.resendInvite(id),
  });
}

export function useUpdateSecondaryGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<InvitePayload> }) =>
      secondaryGuardianService.updateSecondaryGuardian(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secondary-guardians"] });
    },
  });
}

export function useRemoveSecondaryGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => secondaryGuardianService.removeSecondaryGuardian(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secondary-guardians"] });
    },
  });
}

/**
 * Public hooks
 */
export function useValidateInviteToken(token: string | null) {
  return useQuery({
    queryKey: ["validate-invite", token],
    queryFn: () => secondaryGuardianService.validateInviteToken(token!),
    enabled: !!token,
    retry: false,
  });
}

/**
 * Secondary guardian scoped hooks
 */
export function useSecondaryPickupRequest(id: string | null) {
  return useQuery({
    queryKey: ["secondary-pickup", id],
    queryFn: () => secondaryGuardianService.getSecondaryPickupRequest(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.status === "AWAITING_SECONDARY") {
        return 2000;
      }
      return false;
    },
    staleTime: 1000 * 30, // 30 seconds - high frequency changes
  });
}

export function useRespondAsSecondary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "APPROVE" | "DENY" }) =>
      secondaryGuardianService.respondAsSecondary(id, decision),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["secondary-pickup", id] });
      queryClient.invalidateQueries({ queryKey: ["secondary-history"] });
    },
  });
}

export function useSecondaryHistory() {
  return useQuery({
    queryKey: ["secondary-history"],
    queryFn: () => secondaryGuardianService.getSecondaryHistory(),
    staleTime: 1000 * 60 * 5, // 5 minutes - occasionally changes
  });
}
