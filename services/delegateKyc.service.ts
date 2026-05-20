import {
  SubmitKycRequest,
  SubmitKycResponse,
  KycStatusRequest,
  KycStatusResponse,
  SubmitKycRequestSchema,
  KycStatusRequestSchema,
  SubmitKycResponseSchema,
  KycStatusResponseSchema,
} from "@/types/delegateKyc.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

class KycApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getUserFriendlyMessage(status: number): string {
  switch (status) {
    case 0: return "Connection lost. Check your internet.";
    case 401: return "Invalid invite token. Please check and try again.";
    case 404: return "Resource not found.";
    case 409: return "This invite has already been used or has expired.";
    case 422: return "Please check your information and try again.";
    case 500: return "Something went wrong. Please try again.";
    default: return "Something went wrong. Please try again.";
  }
}

async function noAuthFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new KycApiError("Connection lost. Check your internet.", 0);
  }
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();
  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && typeof (data as Record<string, unknown>).message === "string"
        ? (data as Record<string, string>).message
        : getUserFriendlyMessage(res.status);
    throw new KycApiError(message, res.status);
  }
  return data as T;
}

export const delegateKycService = {
  async submitKyc(data: SubmitKycRequest): Promise<SubmitKycResponse> {
    const parsed = SubmitKycRequestSchema.parse(data);
    const res = await noAuthFetch<SubmitKycResponse>("/delegates/kyc/submit", {
      method: "POST",
      body: JSON.stringify(parsed),
    });
    return SubmitKycResponseSchema.parse(res);
  },

  async checkKycStatus(data: KycStatusRequest): Promise<KycStatusResponse> {
    const parsed = KycStatusRequestSchema.parse(data);
    const res = await noAuthFetch<KycStatusResponse>("/delegates/kyc/status", {
      method: "POST",
      body: JSON.stringify(parsed),
    });
    return KycStatusResponseSchema.parse(res);
  },
};
