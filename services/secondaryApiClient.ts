import { useSecondaryAuthStore } from "@/stores/secondaryAuth.store";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function secondaryApiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useSecondaryAuthStore.getState().accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch (e) {
    throw new ApiError("Network error", 0, null);
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (res.status === 401) {
    useSecondaryAuthStore.getState().clearSecondaryGuardian();
    if (typeof window !== "undefined") {
      window.location.href = "/secondary/login";
    }
    throw new ApiError("Unauthorized", 401, data);
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in (data as any)
        ? (data as any).message
        : "Request failed";
    throw new ApiError(String(msg), res.status, data);
  }

  return data as T;
}
