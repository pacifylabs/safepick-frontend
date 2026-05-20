import { z } from "zod";
import { apiFetch } from "./apiClient";
import {
  SchoolSchema,
  SchoolSearchResponseSchema,
  LinkChildToSchoolResponseSchema,
  RequestSchoolResponseSchema,
  EnrollmentStatusSchema,
  School,
  LinkChildToSchoolResponse,
  RequestSchoolPayload,
  RequestSchoolResponse,
  EnrollmentStatus,
  SchoolOnboardPayload,
  SchoolResponseSchema,
  CreateSchoolRequestSchema,
  UpdateSchoolRequestSchema,
  LinkChildResponseSchema,
  SchoolResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  LinkChildResponse,
} from "../types/schools.types";

export const schoolsService = {
  async searchSchools(query: string): Promise<School[]> {
    const data = await apiFetch<any>(`/schools/search?q=${encodeURIComponent(query)}`);
    const parsed = SchoolSearchResponseSchema.parse(data);
    return parsed.schools;
  },

  async linkChildToSchool(
    childId: string,
    schoolId: string
  ): Promise<LinkChildToSchoolResponse> {
    const data = await apiFetch<any>(`/children/${childId}/school`, {
      method: "POST",
      body: JSON.stringify({ schoolId }),
    });
    const enrollmentStatus = data.child?.enrollmentStatus || data.enrollmentStatus;
    return LinkChildToSchoolResponseSchema.parse({
      enrollmentStatus,
      message: data.message,
      adoptionRequestId: data.adoptionRequestId,
      requestCount: data.requestCount,
      threshold: data.threshold,
    });
  },

  async requestSchool(
    data: RequestSchoolPayload
  ): Promise<RequestSchoolResponse> {
    const responseData = await apiFetch<any>("/schools/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return RequestSchoolResponseSchema.parse(responseData);
  },

  async getEnrollmentStatus(
    childId: string
  ): Promise<EnrollmentStatus> {
    const data = await apiFetch<any>(`/children/${childId}/enrollment`);
    return EnrollmentStatusSchema.parse(data);
  },

  async validateOnboardToken(
    token: string
  ): Promise<{ valid: boolean; school?: School }> {
    return apiFetch<{ valid: boolean; school?: School }>(`/schools/onboard/validate?token=${token}`);
  },

  async submitSchoolOnboard(
    data: SchoolOnboardPayload
  ): Promise<{ school: School; admin: any; otpToken: string }> {
    return apiFetch<{ school: School; admin: any; otpToken: string }>("/schools/onboard", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async verifyOnboardOTP(
    data: { token: string; otp: string }
  ): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/schools/onboard/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async submitSchoolKYC(
    data: { token: string; documentType: string; documentNumber: string; documentUrl: string }
  ): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/schools/onboard/kyc", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async createSchool(data: CreateSchoolRequest): Promise<SchoolResponse> {
    const res = await apiFetch<any>("/schools", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return SchoolResponseSchema.parse(res);
  },

  async listSchools(): Promise<SchoolResponse[]> {
    const res = await apiFetch<any>("/schools");
    return z.array(SchoolResponseSchema).parse(res);
  },

  async searchSchoolsV2(query: string): Promise<SchoolResponse[]> {
    const res = await apiFetch<any>(`/schools/search?q=${encodeURIComponent(query)}`);
    const data = Array.isArray(res) ? res : (res?.schools ?? []);
    return z.array(SchoolResponseSchema).parse(data);
  },

  async getSchool(id: string): Promise<SchoolResponse & { children: any[] }> {
    return apiFetch<any>(`/schools/${id}`);
  },

  async updateSchool(id: string, data: UpdateSchoolRequest): Promise<SchoolResponse> {
    const res = await apiFetch<any>(`/schools/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return SchoolResponseSchema.parse(res);
  },

  async deleteSchool(id: string): Promise<void> {
    await apiFetch(`/schools/${id}`, { method: "DELETE" });
  },

  async linkChild(schoolId: string, childId: string): Promise<LinkChildResponse> {
    const res = await apiFetch<any>(`/schools/${schoolId}/children/${childId}`, {
      method: "POST",
    });
    return LinkChildResponseSchema.parse(res);
  },

  async unlinkChild(childId: string): Promise<void> {
    await apiFetch(`/schools/${childId}/unlink`, { method: "DELETE" });
  },
};
