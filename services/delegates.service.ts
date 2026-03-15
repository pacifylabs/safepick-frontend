import { apiFetch } from "./apiClient";
import {
  DelegateListResponseSchema,
  DelegateProfileSchema,
  CreateInvitePayload,
  InviteResponseSchema,
  PendingInvitesResponseSchema,
  DelegateProfile,
  InviteResponse,
  PendingInvite,
} from "../types/delegates.types";

export const delegatesService = {
  async getDelegates(childId?: string): Promise<DelegateProfile[]> {
    const url = childId ? `/delegates?childId=${childId}` : "/delegates";
    const data = await apiFetch<any>(url);
    const parsed = DelegateListResponseSchema.parse(data);
    return parsed.delegates;
  },

  async getDelegate(delegateId: string): Promise<DelegateProfile> {
    const data = await apiFetch<any>(`/delegates/${delegateId}`);
    return DelegateProfileSchema.parse(data);
  },

  async getDelegatesForChild(childId: string): Promise<DelegateProfile[]> {
    return this.getDelegates(childId);
  },

  async createInvite(data: CreateInvitePayload): Promise<InviteResponse> {
    const responseData = await apiFetch<any>("/delegates/invite", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return InviteResponseSchema.parse(responseData);
  },

  async revokeInvite(inviteId: string): Promise<void> {
    await apiFetch(`/delegates/invite/${inviteId}`, {
      method: "DELETE",
    });
  },

  async getPendingInvites(): Promise<PendingInvite[]> {
    const data = await apiFetch<any>("/delegates/invites/pending");
    const parsed = PendingInvitesResponseSchema.parse(data);
    return parsed.invites;
  },

  async sendReminder(delegateId: string): Promise<void> {
    await apiFetch(`/delegates/${delegateId}/remind`, {
      method: "POST",
    });
  },

  async requestKYCAccess(delegateId: string): Promise<void> {
    await apiFetch(`/delegates/${delegateId}/kyc-access`, {
      method: "POST",
    });
  },

  async revokeAllAccess(delegateId: string): Promise<void> {
    await apiFetch(`/delegates/${delegateId}/authorizations`, {
      method: "DELETE",
    });
  },

  async removeDelegate(delegateId: string): Promise<void> {
    await apiFetch(`/delegates/${delegateId}`, {
      method: "DELETE",
    });
  },
  async revokeAuthorization(delegateId: string, childId: string): Promise<void> {
    await apiFetch(`/delegates/${delegateId}/authorizations/${childId}`, {
      method: "DELETE",
    });
  },

  async updateAuthorizationStatus(delegateId: string, childId: string, status: "ACTIVE" | "SUSPENDED"): Promise<void> {
    await apiFetch(`/delegates/${delegateId}/authorizations/${childId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
