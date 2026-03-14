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
    return LinkChildToSchoolResponseSchema.parse(data);
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
};
