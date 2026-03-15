import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegatesService } from "../services/delegates.service";
import { CreateInvitePayload } from "../types/delegates.types";

export function useDelegates(childId?: string) {
  return useQuery({
    queryKey: childId ? ["delegates", "child", childId] : ["delegates"],
    queryFn: () => delegatesService.getDelegates(childId),
  });
}

export function useDelegate(delegateId: string) {
  return useQuery({
    queryKey: ["delegates", delegateId],
    queryFn: () => delegatesService.getDelegate(delegateId),
    enabled: !!delegateId,
  });
}

export function useDelegatesForChild(childId: string) {
  return useQuery({
    queryKey: ["delegates", "child", childId],
    queryFn: () => delegatesService.getDelegatesForChild(childId),
    enabled: !!childId,
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
  return useQuery({
    queryKey: ["invites", "pending"],
    queryFn: () => delegatesService.getPendingInvites(),
    refetchInterval: 30000,
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
