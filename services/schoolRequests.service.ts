import { apiFetch } from "./apiClient";
import {
  RequestSchoolRequestSchema,
  RequestSchoolResponseSchema,
  ListRequestsResponseSchema,
  SchoolRequestItemSchema,
  ReviewRequestResponseSchema,
  RequestSchoolPayload,
  RequestSchoolResponse,
  ListRequestsResponse,
  SchoolRequestItem,
  ListRequestsQuery,
  ReviewRequestPayload,
  ReviewRequestResponse,
} from "@/types/school-requests.types";

export const schoolRequestsService = {
  async submit(data: RequestSchoolPayload): Promise<RequestSchoolResponse> {
    const res = await apiFetch<any>("/schools/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return RequestSchoolResponseSchema.parse(res);
  },

  async list(query: ListRequestsQuery): Promise<ListRequestsResponse> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    const res = await apiFetch<any>(`/schools/requests${qs ? `?${qs}` : ""}`);
    return ListRequestsResponseSchema.parse(res);
  },

  async get(id: string): Promise<SchoolRequestItem> {
    const res = await apiFetch<any>(`/schools/requests/${id}`);
    return SchoolRequestItemSchema.parse(res);
  },

  async review(id: string, data: ReviewRequestPayload): Promise<ReviewRequestResponse> {
    const res = await apiFetch<any>(`/schools/requests/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return ReviewRequestResponseSchema.parse(res);
  },

  async cancel(id: string): Promise<void> {
    await apiFetch(`/schools/requests/${id}`, { method: "DELETE" });
  },
};
