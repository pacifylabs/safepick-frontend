"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenService } from "@/services/children.service";
import { Child, RegisterChildPayload } from "@/types/children.types";
import { useAuthStore } from "@/stores/auth.store";

export function useChildren() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["children"],
    queryFn: () => childrenService.getChildren(),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

export function useChild(childId: string) {
  const { accessToken } = useAuthStore();
  return useQuery<Child, Error>({
    queryKey: ["children", childId],
    queryFn: () => childrenService.getChild(childId),
    enabled: !!childId && !!accessToken,
    staleTime: 1000 * 60 * 30, // 30 minutes - child profiles rarely change
  });
}

export function useRegisterChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterChildPayload) => childrenService.registerChild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (childId: string) => childrenService.deleteChild(childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

export function useGuardianLookup(phone: string) {
  return useQuery({
    queryKey: ["guardian-lookup", phone],
    queryFn: () => childrenService.lookupGuardianByPhone(phone),
    enabled: phone.length >= 7,
    staleTime: 30000,
  });
}
