import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegatesService } from "../services/delegates.service";
import { CreateInvitePayload } from "../types/delegates.types";
import { useAuthStore } from "@/stores/auth.store";

export function useDelegates(childId?: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: childId ? ["delegates", "child", childId] : ["delegates"],
    queryFn: () => delegatesService.getDelegates(childId),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

export function useDelegate(delegateId: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["delegates", delegateId],
    queryFn: () => delegatesService.getDelegate(delegateId),
    enabled: !!delegateId && !!accessToken,
    staleTime: 1000 * 60 * 30, // 30 minutes - delegate profiles rarely change
  });
}

export function useDelegatesForChild(childId: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["delegates", "child", childId],
    queryFn: () => delegatesService.getDelegatesForChild(childId),
    enabled: !!childId && !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes - occasionally changes
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvitePayload) => delegatesService.createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", "pending"] });
    },
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => delegatesService.revokeInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["delegates"] });
    },
  });
}

export function usePendingInvites() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["invites", "pending"],
    queryFn: () => delegatesService.getPendingInvites(),
    enabled: !!accessToken,
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSendReminder() {
  return useMutation({
    mutationFn: (delegateId: string) => delegatesService.sendReminder(delegateId),
  });
}

export function useRequestKYCAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (delegateId: string) => delegatesService.requestKYCAccess(delegateId),
    onSuccess: (_, delegateId) => {
      queryClient.invalidateQueries({ queryKey: ["delegates", delegateId] });
    },
  });
}

export function useRemoveDelegate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (delegateId: string) => delegatesService.removeDelegate(delegateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegates"] });
    },
  });
}

export function useRevokeAuthorization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ delegateId, childId }: { delegateId: string; childId: string }) =>
      delegatesService.revokeAuthorization(delegateId, childId),
    onSuccess: (_, { delegateId }) => {
      queryClient.invalidateQueries({ queryKey: ["delegates"] });
      queryClient.invalidateQueries({ queryKey: ["delegates", delegateId] });
    },
  });
}

export function useUpdateAuthorizationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      delegateId,
      childId,
      status,
    }: {
      delegateId: string;
      childId: string;
      status: "ACTIVE" | "SUSPENDED";
    }) => delegatesService.updateAuthorizationStatus(delegateId, childId, status),
    onSuccess: (_, { delegateId }) => {
      queryClient.invalidateQueries({ queryKey: ["delegates"] });
      queryClient.invalidateQueries({ queryKey: ["delegates", delegateId] });
    },
  });
}
