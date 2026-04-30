import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pickupService } from "@/services/pickup.service";
import { PickupRespondPayload, TERMINAL_PICKUP_STATUSES } from "@/types/pickup.types";

/**
 * Hook to fetch and poll a single pickup request.
 */
export const usePickupRequest = (id: string) => {
  return useQuery({
    queryKey: ["pickup", id],
    queryFn: () => pickupService.getPickupRequest(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && !TERMINAL_PICKUP_STATUSES.includes(status as any)) {
        return 2000;
      }
      return false;
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds - high frequency changes
  });
};

/**
 * Mutation hook to respond to a pickup request.
 */
export const useRespondToPickup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PickupRespondPayload }) =>
      pickupService.respondToPickup(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pickup", id] });
      queryClient.invalidateQueries({ queryKey: ["pickup", "recent"] });
    },
  });
};

/**
 * Hook to fetch recent pickup requests.
 */
export const useRecentPickupRequests = () => {
  return useQuery({
    queryKey: ["pickup", "recent"],
    queryFn: () => pickupService.getRecentPickupRequests(),
    refetchInterval: 10000,
    staleTime: 1000 * 30, // 30 seconds - high frequency changes
  });
};

/**
 * Hook to fetch a QR token for a delegate authorization.
 */
export const useQrToken = (authorizationId: string | null) => {
  return useQuery({
    queryKey: ["qr-token", authorizationId],
    queryFn: () => pickupService.getQrToken(authorizationId!),
    refetchInterval: 60000,
    enabled: !!authorizationId,
    staleTime: 1000 * 30, // 30 seconds - token may refresh frequently
  });
};
