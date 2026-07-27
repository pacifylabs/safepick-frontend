import { useAuthStore } from "@/stores/auth.store";
import { getApiErrorMessage } from "@/services/apiError";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/register", "/auth/verify-otp"];

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Single-flight: concurrent 401s share one refresh attempt instead of
// racing and revoking each other's rotated tokens.
let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) return false;

    const data = await res.json();
    if (!data?.accessToken || !data?.refreshToken) return false;

    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  // Cleared once settled so the next expiry starts a fresh attempt. Callers
  // already holding the reference still resolve from it.
  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

async function rawFetch(path: string, options: RequestInit): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    return await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch (e) {
    throw new ApiError("Network error", 0, null);
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? await res.json()
    : await res.text();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res = await rawFetch(path, options);

  if (res.status === 401 && !AUTH_PATHS.includes(path)) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      res = await rawFetch(path, options);
    }
  }

  const data = await parseBody(res);

  if (res.status === 401) {
    useAuthStore.getState().clearSession();
    if (path !== "/auth/login" && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(getApiErrorMessage(data, "Unauthorized"), 401, data);
  }

  if (!res.ok) {
    throw new ApiError(getApiErrorMessage(data), res.status, data);
  }

  return data as T;
}
