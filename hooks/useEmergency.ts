import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emergencyService } from "@/services/emergency.service";
import { useEmergencyStore } from "@/stores/emergency.store";
import { useAuthStore } from "@/stores/auth.store";
import { SendSosPayload } from "@/types/emergency.types";

export const useEmergencyStatus = () => {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["emergency-status"],
    queryFn: () => emergencyService.getStatus(),
    enabled: !!accessToken,
    refetchInterval: 10000, // Poll every 10s for emergency status
    staleTime: 1000 * 30, // 30 seconds - high frequency changes
  });
};

export const useTriggerPanic = () => {
  const queryClient = useQueryClient();
  const setPanicActive = useEmergencyStore((state: any) => state.setPanicActive);

  return useMutation({
    mutationFn: () => emergencyService.triggerPanic(),
    onSuccess: () => {
      setPanicActive(true);
      queryClient.invalidateQueries({ queryKey: ["emergency-status"] });
    },
  });
};

export const useDeactivatePanic = () => {
  const queryClient = useQueryClient();
  const setPanicActive = useEmergencyStore((state: any) => state.setPanicActive);

  return useMutation({
    mutationFn: () => emergencyService.deactivatePanic(),
    onSuccess: () => {
      setPanicActive(false);
      queryClient.invalidateQueries({ queryKey: ["emergency-status"] });
    },
  });
};

export const useSendSos = () => {
  const setActiveSosId = useEmergencyStore((state: any) => state.setActiveSosId);

  return useMutation({
    mutationFn: (payload: SendSosPayload) => emergencyService.sendSos(payload),
    onSuccess: (data) => {
      setActiveSosId(data.sosId);
    },
  });
};

export const useCancelSos = () => {
  const activeSosId = useEmergencyStore((state: any) => state.activeSosId);
  const setActiveSosId = useEmergencyStore((state: any) => state.setActiveSosId);

  return useMutation({
    mutationFn: () => {
      if (!activeSosId) throw new Error("No active SOS to cancel");
      return emergencyService.cancelSos(activeSosId);
    },
    onSuccess: () => {
      setActiveSosId(null);
    },
  });
};

export const useSosAlert = (sosId: string | null) => {
  return useQuery({
    queryKey: ["sos-alert", sosId],
    queryFn: () => (sosId ? emergencyService.getSosAlert(sosId) : null),
    enabled: !!sosId,
    staleTime: 1000 * 30, // 30 seconds - high frequency changes
  });
};
