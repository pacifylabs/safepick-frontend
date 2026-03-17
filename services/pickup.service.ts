import { apiFetch } from "./apiClient";
import { delegateApiFetch } from "./delegateApiClient";
import {
  PickupRequest,
  PickupRequestSchema,
  PickupResponse,
  PickupResponseSchema,
  PickupRespondPayload,
  QrToken,
  QrTokenSchema,
  RecentPickupItem,
  RecentPickupItemSchema,
} from "@/types/pickup.types";
import { z } from "zod";

export const pickupService = {
  /**
   * Fetches a single pickup request by ID.
   */
  getPickupRequest: async (id: string): Promise<PickupRequest> => {
    const data = await apiFetch<any>(`/pickup/${id}`);
    return PickupRequestSchema.parse(data);
  },

  /**
   * Submits a parent's decision (APPROVE/DENY) for a pickup request.
   */
  respondToPickup: async (
    id: string,
    payload: PickupRespondPayload
  ): Promise<PickupResponse> => {
    const data = await apiFetch<any>(`/pickup/${id}/respond`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return PickupResponseSchema.parse(data);
  },

  /**
   * Fetches recent pickup requests for the activity feed.
   */
  getRecentPickupRequests: async (): Promise<RecentPickupItem[]> => {
    const data = await apiFetch<{ requests: any[] }>("/pickup/recent");
    return z.array(RecentPickupItemSchema).parse(data.requests);
  },

  /**
   * Fetches a QR token for a delegate authorization.
   */
  getQrToken: async (authorizationId: string): Promise<QrToken> => {
    const data = await delegateApiFetch<any>(
      `/verification/qr-token?authorizationId=${authorizationId}`
    );
    return QrTokenSchema.parse(data);
  },
};
