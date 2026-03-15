import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authorizationsService } from "../services/authorizations.service";
import { CreateAuthorizationPayload, UpdateAuthorizationPayload, RejectDelegatePayload } from "../types/authorizations.types";

export function usePendingDelegates() {
  return useQuery({
    queryKey: ["pending-delegates"],
    queryFn: () => authorizationsService.getPendingDelegates(),
  });
}

export function useAuthorizations(childId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["authorizations", childId],
    queryFn: () => authorizationsService.getAuthorizations(childId),
  });

  const createAuthorization = useMutation({
    mutationFn: (data: CreateAuthorizationPayload) => authorizationsService.createAuthorization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizations"] });
      queryClient.invalidateQueries({ queryKey: ["pending-delegates"] });
    },
  });

  const updateAuthorization = useMutation({
    mutationFn: ({ authId, data }: { authId: string; data: UpdateAuthorizationPayload }) =>
      authorizationsService.updateAuthorization(authId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizations"] });
      queryClient.invalidateQueries({ queryKey: ["delegates"] });
    },
  });

  const deleteAuthorization = useMutation({
    mutationFn: (authId: string) => authorizationsService.deleteAuthorization(authId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizations"] });
      queryClient.invalidateQueries({ queryKey: ["delegates"] });
    },
  });

  const revokeAllAccess = useMutation({
    mutationFn: (delegateId: string) => authorizationsService.revokeAllAccess(delegateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authorizations"] });
      queryClient.invalidateQueries({ queryKey: ["delegates"] });
    },
  });

  return {
    ...query,
    authorizations: query.data || [],
    createAuthorization,
    updateAuthorization,
    deleteAuthorization,
    revokeAllAccess,
  };
}

export function useRejectDelegate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RejectDelegatePayload) => authorizationsService.rejectDelegate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-delegates"] });
    },
  });
}
