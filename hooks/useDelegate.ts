import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateService } from "@/services/delegate.service";
import { AlarmPayload, SosPayload } from "@/types/delegate.types";

export const useDelegateProfile = () => {
  return useQuery({
    queryKey: ["delegate", "profile"],
    queryFn: () => delegateService.getProfile(),
  });
};

export const useDelegateAuthorizations = () => {
  return useQuery({
    queryKey: ["delegate", "authorizations"],
    queryFn: () => delegateService.getAuthorizations(),
  });
};

export const useDelegateSchedule = (date: string) => {
  return useQuery({
    queryKey: ["delegate", "schedule", date],
    queryFn: async () => {
      try {
        const result = await delegateService.getSchedule(date);
        return result;
      } catch (error) {
        console.error('SCHEDULE QUERY ERROR:', error);
        throw error;
      }
    },
  });
};

export const useDelegatePickupRequests = () => {
  return useQuery({
    queryKey: ["delegate", "pickup-requests"],
    queryFn: () => delegateService.getPickupRequests(),
    refetchInterval: 5000,
  });
};

export const useDelegateQrToken = (authorizationId: string | null) => {
  return useQuery({
    queryKey: ["delegate", "qr-token", authorizationId],
    queryFn: () => delegateService.getQrToken(authorizationId!),
    enabled: !!authorizationId,
    refetchInterval: 30000, // Token likely expires, refresh every 30s
  });
};

export const useSetAlarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AlarmPayload) => delegateService.setAlarm(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["delegate", "schedule", variables.date],
      });
    },
  });
};

export const useSendSos = () => {
  return useMutation({
    mutationFn: (payload: SosPayload) => delegateService.sendSos(payload),
  });
};

export const useCancelSos = () => {
  return useMutation({
    mutationFn: (sosId: string) => delegateService.cancelSos(sosId),
  });
};
