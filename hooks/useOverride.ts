import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { overrideService } from "@/services/override.service";
import { 
  GenerateOverridePayload, 
  OverrideSubmitPayload 
} from "@/types/override.types";

/**
 * Hook to fetch all active override codes for a specific child.
 */
export const useOverrideCodes = (childId: string) => {
  return useQuery({
    queryKey: ["override-codes", childId],
    queryFn: () => overrideService.getOverrideCodes(childId),
    enabled: !!childId,
  });
};

/**
 * Mutation hook to generate a new override code.
 */
export const useGenerateOverrideCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateOverridePayload) =>
      overrideService.generateOverrideCode(payload),
    onSuccess: (_, { childId }) => {
      queryClient.invalidateQueries({ queryKey: ["override-codes", childId] });
    },
  });
};

/**
 * Mutation hook to revoke an override code.
 */
export const useRevokeOverrideCode = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (codeId: string) => overrideService.revokeOverrideCode(codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["override-codes", childId] });
    },
  });
};

/**
 * Mutation hook for school gate to submit an override code.
 */
export const useSubmitOverrideCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      pickupRequestId, 
      payload 
    }: { 
      pickupRequestId: string; 
      payload: OverrideSubmitPayload 
    }) => overrideService.submitOverrideCode(pickupRequestId, payload),
    onSuccess: (_, { pickupRequestId }) => {
      queryClient.invalidateQueries({ queryKey: ["pickup", pickupRequestId] });
    },
  });
};

/**
 * Mutation hook for school gate to mark a child as held.
 */
export const useHoldChild = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      pickupRequestId, 
      reason 
    }: { 
      pickupRequestId: string; 
      reason: string 
    }) => overrideService.holdChild(pickupRequestId, reason),
    onSuccess: (_, { pickupRequestId }) => {
      queryClient.invalidateQueries({ queryKey: ["pickup", pickupRequestId] });
    },
  });
};

/**
 * Hook to validate a secondary guardian token on mount.
 */
export const useValidateSecondaryToken = (token: string | null) => {
  return useQuery({
    queryKey: ["secondary-token", token],
    queryFn: () => overrideService.validateSecondaryToken(token!),
    enabled: !!token,
    retry: false,
  });
};

/**
 * Mutation hook for secondary guardian to submit their response.
 */
export const useRespondAsSecondary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      token, 
      decision 
    }: { 
      token: string; 
      decision: "APPROVE" | "DENY" 
    }) => overrideService.respondAsSecondaryGuardian(token, decision),
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: ["secondary-token", token] });
    },
  });
};
