"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { childrenService } from "@/services/children.service";
import { RegisterChildPayload } from "@/types/children.types";

export function useChildren() {
  return useQuery({
    queryKey: ["children"],
    queryFn: () => childrenService.getChildren(),
  });
}

export function useChild(childId: string) {
  return useQuery({
    queryKey: ["children", childId],
    queryFn: () => childrenService.getChild(childId),
    enabled: !!childId,
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
