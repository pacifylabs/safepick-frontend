"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenService } from '@/services/children.service';
import { UpdateChildPayload } from '@/types/children.types';
import { queryKeys } from '@/lib/queryKeys';

export function useUpdateChild(childId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateChildPayload) =>
      childrenService.updateChild(childId, payload),

    onMutate: async (payload) => {
      // Cancel outgoing refetches for this child
      await queryClient.cancelQueries({
        queryKey: queryKeys.child(childId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.children,
      });

      // Snapshot current values for rollback
      const previousChild = queryClient.getQueryData(
        queryKeys.child(childId),
      );
      const previousChildren = queryClient.getQueryData(
        queryKeys.children,
      );

      // Optimistically update single child cache
      queryClient.setQueryData(
        queryKeys.child(childId),
        (old: any) => old ? { ...old, ...payload } : old,
      );

      // Optimistically update children list cache
      queryClient.setQueryData(
        queryKeys.children,
        (old: any[]) =>
          Array.isArray(old)
            ? old.map((c) =>
                c.id === childId ? { ...c, ...payload } : c,
              )
            : old,
      );

      return { previousChild, previousChildren };
    },

    onError: (_err, _payload, context) => {
      // Roll back on error
      if (context?.previousChild) {
        queryClient.setQueryData(
          queryKeys.child(childId),
          context.previousChild,
        );
      }
      if (context?.previousChildren) {
        queryClient.setQueryData(
          queryKeys.children,
          context.previousChildren,
        );
      }
    },

    onSettled: () => {
      // Sync with server after success or error
      queryClient.invalidateQueries({
        queryKey: queryKeys.child(childId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.children,
      });
    },
  });
}
