import { apiFetch } from "./apiClient";
import { 
  EmergencyStatus, 
  EmergencyStatusSchema, 
  TriggerPanicResponse, 
  SendSosPayload, 
  SendSosResponse,
  SosAlert,
  SosAlertSchema
} from "@/types/emergency.types";

export const emergencyService = {
  getStatus: async (): Promise<EmergencyStatus> => {
    const data = await apiFetch<any>(`/emergency/status`);
    return EmergencyStatusSchema.parse(data);
  },

  triggerPanic: async (): Promise<TriggerPanicResponse> => {
    const data = await apiFetch<any>(`/emergency/panic/trigger`, {
      method: 'POST',
    });
    return data as TriggerPanicResponse;
  },

  deactivatePanic: async (): Promise<{ success: boolean }> => {
    const data = await apiFetch<any>(`/emergency/panic/deactivate`, {
      method: 'POST',
    });
    return data as { success: boolean };
  },

  sendSos: async (payload: SendSosPayload): Promise<SendSosResponse> => {
    const data = await apiFetch<any>(`/emergency/sos/send`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data as SendSosResponse;
  },

  cancelSos: async (sosId: string): Promise<{ success: boolean }> => {
    const data = await apiFetch<any>(`/emergency/sos/${sosId}/cancel`, {
      method: 'POST',
    });
    return data as { success: boolean };
  },

  getSosAlert: async (sosId: string): Promise<SosAlert> => {
    const data = await apiFetch<any>(`/emergency/sos/${sosId}`);
    return SosAlertSchema.parse(data);
  },
};
