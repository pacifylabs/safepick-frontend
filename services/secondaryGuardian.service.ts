import { apiFetch } from "./apiClient";
import { secondaryApiFetch } from "./secondaryApiClient";
import { 
  InvitePayload, 
  InviteResponse, 
  InviteResponseSchema, 
  InviteValidateResponse, 
  InviteValidateResponseSchema, 
  SecondaryAuthResponse, 
  SecondaryAuthResponseSchema, 
  SecondaryGuardianAccount, 
  SecondaryGuardianAccountSchema,
  SecondaryPickupResponse,
  SecondaryPickupResponseSchema
} from "@/types/secondaryGuardian.types";
import { PickupRequest, PickupRequestSchema } from "@/types/pickup.types";
import { z } from "zod";

export const secondaryGuardianService = {
  // Parent-scoped (apiClient)
  inviteSecondaryGuardian: async (payload: InvitePayload): Promise<InviteResponse> => {
    const data = await apiFetch<any>("/secondary-guardians/invite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return InviteResponseSchema.parse(data);
  },

  getSecondaryGuardians: async (): Promise<SecondaryGuardianAccount[]> => {
    const data = await apiFetch<{ secondaryGuardians: any[] }>("/secondary-guardians");
    return z.array(SecondaryGuardianAccountSchema).parse(data.secondaryGuardians);
  },

  resendInvite: async (id: string): Promise<{ message: string; inviteExpiresAt: string }> => {
    return apiFetch<any>(`/secondary-guardians/${id}/resend-invite`, {
      method: "POST",
    });
  },

  updateSecondaryGuardian: async (id: string, payload: Partial<InvitePayload>): Promise<SecondaryGuardianAccount> => {
    const data = await apiFetch<any>(`/secondary-guardians/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return SecondaryGuardianAccountSchema.parse(data);
  },

  removeSecondaryGuardian: async (id: string): Promise<{ message: string; removedAt: string }> => {
    return apiFetch<any>(`/secondary-guardians/${id}`, {
      method: "DELETE",
    });
  },

  // Public (no auth)
  validateInviteToken: async (token: string): Promise<InviteValidateResponse> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const res = await fetch(`${baseUrl}/secondary-guardians/invite/${token}/validate`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to validate invite");
    return InviteValidateResponseSchema.parse(data);
  },

  acceptInvite: async (token: string, otpPayload: { otp: string; otpToken: string }): Promise<any> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const res = await fetch(`${baseUrl}/secondary-guardians/invite/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(otpPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to accept invite");
    return data; // Returns tokens and secondaryGuardianId
  },

  secondaryLogin: async (phone: string): Promise<{ otpToken: string; expiresIn: number }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const res = await fetch(`${baseUrl}/auth/secondary/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
  },

  secondaryVerifyOtp: async (otpToken: string, otp: string): Promise<SecondaryAuthResponse> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const res = await fetch(`${baseUrl}/auth/secondary/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpToken, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Verification failed");
    return SecondaryAuthResponseSchema.parse(data);
  },

  // Secondary-scoped (secondaryApiClient)
  getSecondaryPickupRequest: async (id: string): Promise<PickupRequest & { assignedAsSecondaryFor: string; escalatedAt: string }> => {
    const data = await secondaryApiFetch<any>(`/secondary/pickup/${id}`);
    // PickupRequestSchema handles common fields, we manually parse the extra fields
    const pickup = PickupRequestSchema.parse(data);
    return {
      ...pickup,
      assignedAsSecondaryFor: data.assignedAsSecondaryFor,
      escalatedAt: data.escalatedAt,
    };
  },

  respondAsSecondary: async (id: string, decision: "APPROVE" | "DENY"): Promise<SecondaryPickupResponse> => {
    const data = await secondaryApiFetch<any>(`/secondary/pickup/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    });
    return SecondaryPickupResponseSchema.parse(data);
  },

  getSecondaryHistory: async (): Promise<any[]> => {
    const data = await secondaryApiFetch<{ history: any[] }>("/secondary/history");
    return data.history;
  }
};
