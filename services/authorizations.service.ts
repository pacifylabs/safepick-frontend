import { apiFetch } from "./apiClient";
import { z } from "zod";
import {
  Authorization,
  AuthorizationSchema,
  CreateAuthorizationPayload,
  UpdateAuthorizationPayload,
  RejectDelegatePayload,
  MessageResponse,
  MessageResponseSchema,
} from "../types/authorizations.types";
import { DelegateProfile, DelegateProfileSchema } from "../types/delegates.types";

export const authorizationsService = {
  async getPendingDelegates(): Promise<DelegateProfile[]> {
    const data = await apiFetch<any>("/delegates?status=PENDING_PARENT_APPROVAL");
    return z.array(DelegateProfileSchema).parse(data);
  },

  async getAuthorizations(childId?: string): Promise<Authorization[]> {
    const url = childId ? `/authorizations?childId=${childId}` : "/authorizations";
    const data = await apiFetch<any>(url);
    // Based on the contract, it returns { authorizations: [] }
    const responseSchema = z.object({
      authorizations: z.array(AuthorizationSchema),
    });
    const parsed = responseSchema.parse(data);
    return parsed.authorizations;
  },

  async createAuthorization(data: CreateAuthorizationPayload): Promise<Authorization> {
    const responseData = await apiFetch<any>("/authorizations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Based on contract, it returns { authorization: {} }
    const responseSchema = z.object({
      authorization: AuthorizationSchema,
    });
    const parsed = responseSchema.parse(responseData);
    return parsed.authorization;
  },

  async updateAuthorization(authId: string, data: UpdateAuthorizationPayload): Promise<Authorization> {
    const responseData = await apiFetch<any>(`/authorizations/${authId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return AuthorizationSchema.parse(responseData);
  },

  async deleteAuthorization(authId: string): Promise<void> {
    await apiFetch(`/authorizations/${authId}`, {
      method: "DELETE",
    });
  },

  async revokeAllAccess(delegateId: string): Promise<void> {
    await apiFetch(`/authorizations?delegateId=${delegateId}`, {
      method: "DELETE",
    });
  },

  async rejectDelegate(data: RejectDelegatePayload): Promise<MessageResponse> {
    const responseData = await apiFetch<any>("/authorizations/reject", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return MessageResponseSchema.parse(responseData);
  },
};
