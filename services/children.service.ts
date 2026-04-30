import { apiFetch } from "./apiClient";
import {
  Child,
  ChildListResponseSchema,
  ChildSchema,
  GetChildResponseSchema,
  GuardianLookupResponse,
  GuardianLookupResponseSchema,
  RegisterChildPayload,
  RegisterChildResponseSchema,
} from "../types/children.types";

export const childrenService = {
  async getChildren(): Promise<Child[]> {
    const response = await apiFetch<any>("/children");
    const parsed = ChildListResponseSchema.parse(response);
    return parsed.children;
  },

  async getChild(childId: string): Promise<Child> {
    const response = await apiFetch<unknown>(`/children/${childId}`);

    // API returns { child: {...} } nested structure
    const parsed = GetChildResponseSchema.parse(response);
    return parsed.child;
  },

  async registerChild(data: RegisterChildPayload): Promise<Child> {
    const response = await apiFetch<any>("/children", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const parsed = RegisterChildResponseSchema.parse(response);
    return parsed.child;
  },

  async updateChild(childId: string, data: Partial<RegisterChildPayload>): Promise<Child> {
    const response = await apiFetch<any>(`/children/${childId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return ChildSchema.parse(response);
  },

  async deleteChild(childId: string): Promise<void> {
    await apiFetch<any>(`/children/${childId}`, {
      method: "DELETE",
    });
  },

  async lookupGuardianByPhone(phone: string): Promise<GuardianLookupResponse> {
    const response = await apiFetch<any>(`/users/lookup?phone=${encodeURIComponent(phone)}`);
    return GuardianLookupResponseSchema.parse(response);
  },
};
