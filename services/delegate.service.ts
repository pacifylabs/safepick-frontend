import { delegateApiFetch } from "./delegateApiClient";
import {
  DelegateAccountSchema,
  DelegateAuthorizationSchema,
  SchedulePickupSchema,
  PickupRequestSchema,
  AlarmPayloadSchema,
  SosPayloadSchema,
  DelegateAccount,
  DelegateAuthorization,
  SchedulePickup,
  PickupRequest,
  AlarmPayload,
  SosPayload,
} from "@/types/delegate.types";
import { z } from "zod";

const LoginResponseSchema = z.object({
  message: z.string(),
  otpToken: z.string(),
  expiresIn: z.number(),
});

const VerifyOtpResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  delegate: DelegateAccountSchema,
});

export const delegateService = {
  login: async (phone: string) => {
    // Normalize phone: remove spaces and dashes
    const normalizedPhone = phone.replace(/[\s-]/g, "");
    const data = await delegateApiFetch<any>("/auth/delegate/login", {
      method: "POST",
      body: JSON.stringify({ phone: normalizedPhone }),
    });
    return LoginResponseSchema.parse(data);
  },

  verifyOtp: async (otpToken: string, otp: string) => {
    const data = await delegateApiFetch<any>("/auth/delegate/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otpToken, otp }),
    });
    return VerifyOtpResponseSchema.parse(data);
  },

  getProfile: async (): Promise<DelegateAccount> => {
    const data = await delegateApiFetch<any>("/delegate/me");
    return DelegateAccountSchema.parse(data);
  },

  getAuthorizations: async (): Promise<DelegateAuthorization[]> => {
    const data = await delegateApiFetch<any>("/delegate/authorizations");
    return z.array(DelegateAuthorizationSchema).parse(data.authorizations);
  },

  getSchedule: async (date: string): Promise<SchedulePickup[]> => {
    const data = await delegateApiFetch<any>(`/delegate/schedule?date=${date}`);
    return z.array(SchedulePickupSchema).parse(data.pickups);
  },

  getPickupRequests: async (): Promise<PickupRequest[]> => {
    const data = await delegateApiFetch<any>("/delegate/pickup-requests");
    return z.array(PickupRequestSchema).parse(data.requests);
  },

  getQrToken: async (authorizationId: string): Promise<string> => {
    const data = await delegateApiFetch<{ token: string }>(
      `/verification/qr-token?authorizationId=${authorizationId}`
    );
    return data.token;
  },

  setAlarm: async (payload: AlarmPayload) => {
    const data = await delegateApiFetch<any>("/delegate/schedule/alarm", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  },

  sendSos: async (payload: SosPayload) => {
    const data = await delegateApiFetch<any>("/delegate/sos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  },

  cancelSos: async (sosId: string) => {
    const data = await delegateApiFetch<any>(`/delegate/sos/${sosId}/cancel`, {
      method: "POST",
    });
    return data;
  },
};
