import { apiFetch } from "./apiClient";
import { 
  GenerateOverridePayload, 
  GenerateOverrideResponse, 
  GenerateOverrideResponseSchema, 
  OverrideCode, 
  OverrideCodeSchema, 
  OverrideSubmitPayload, 
  OverrideSubmitResponse, 
  OverrideSubmitResponseSchema, 
  SecondaryGuardianRespondPayload, 
  SecondaryGuardianRespondResponse, 
  SecondaryGuardianRespondResponseSchema, 
  SecondaryGuardianTokenResponse, 
  SecondaryGuardianTokenResponseSchema 
} from "@/types/override.types";
import { z } from "zod";

export const overrideService = {
  /**
   * Generates a new override code for a child at a specific school.
   */
  generateOverrideCode: async (payload: GenerateOverridePayload): Promise<GenerateOverrideResponse> => {
    const data = await apiFetch<any>("/override-codes/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return GenerateOverrideResponseSchema.parse(data);
  },

  /**
   * Fetches all override codes for a specific child.
   */
  getOverrideCodes: async (childId: string): Promise<OverrideCode[]> => {
    const data = await apiFetch<{ overrideCodes: any[] }>(`/override-codes?childId=${childId}`);
    return z.array(OverrideCodeSchema).parse(data.overrideCodes);
  },

  /**
   * Revokes an existing override code.
   */
  revokeOverrideCode: async (codeId: string): Promise<{ message: string; revokedAt: string }> => {
    const data = await apiFetch<any>(`/override-codes/${codeId}`, {
      method: "DELETE",
    });
    return data;
  },

  /**
   * Submits an override code at the school gate.
   */
  submitOverrideCode: async (pickupRequestId: string, payload: OverrideSubmitPayload): Promise<OverrideSubmitResponse> => {
    const data = await apiFetch<any>(`/pickup/${pickupRequestId}/override`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return OverrideSubmitResponseSchema.parse(data);
  },

  /**
   * Marks a child as held when no authorization can be obtained.
   */
  holdChild: async (pickupRequestId: string, reason: string): Promise<{ status: string; incidentId: string; message: string }> => {
    const data = await apiFetch<any>(`/pickup/${pickupRequestId}/hold`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return data;
  },

  /**
   * Validates a secondary guardian token (public route).
   */
  validateSecondaryToken: async (token: string): Promise<SecondaryGuardianTokenResponse> => {
    // Note: apiFetch handles public routes by not including Auth header if token is missing.
    // However, it redirects to /login on 401. For the /respond page, we want to handle
    // errors ourselves.
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const res = await fetch(`${baseUrl}/respond/${token}/validate`);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || "Failed to validate token");
    }
    
    return SecondaryGuardianTokenResponseSchema.parse(data);
  },

  /**
   * Responds to a pickup request as a secondary guardian (public route).
   */
  respondAsSecondaryGuardian: async (token: string, decision: "APPROVE" | "DENY"): Promise<SecondaryGuardianRespondResponse> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const res = await fetch(`${baseUrl}/respond/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || "Failed to submit response");
    }
    
    return SecondaryGuardianRespondResponseSchema.parse(data);
  }
};
