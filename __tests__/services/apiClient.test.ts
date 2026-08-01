import { apiFetch, ApiError } from "@/services/apiClient";
import { useAuthStore } from "@/stores/auth.store";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/session";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

const CSRF_VALUE = "csrf-token-value";

describe("apiFetch", () => {
  let fetchMock: jest.SpyInstance;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    // The session itself is httpOnly and invisible here; only the CSRF cookie
    // is readable, which is exactly what the client relies on.
    document.cookie = `${CSRF_COOKIE}=${CSRF_VALUE}`;

    // The 401 path assigns window.location.href; jsdom cannot navigate and
    // logs a "not implemented" error. Silence it so real failures stand out.
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
    // Fail loudly if a test under-specifies its mocks, instead of falling
    // through to the real (XHR-backed) fetch polyfill.
    fetchMock = jest
      .spyOn(global, "fetch")
      .mockImplementation(async (url) => {
        throw new Error(`Unexpected unmocked fetch call: ${String(url)}`);
      });
    useAuthStore.setState({ user: null, isAuthenticated: true });
  });

  afterEach(() => {
    fetchMock.mockRestore();
    consoleErrorMock.mockRestore();
    document.cookie = `${CSRF_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });

  it("sends the session cookie rather than an Authorization header", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await apiFetch<{ ok: boolean }>("/children");

    expect(result).toEqual({ ok: true });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("include");
    expect((init.headers as Record<string, string>)["Authorization"]).toBeUndefined();
  });

  it("echoes the CSRF token on mutating requests", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch("/children", { method: "POST", body: "{}" });

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>)[CSRF_HEADER]).toBe(CSRF_VALUE);
  });

  it("omits the CSRF header on safe requests", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch("/children");

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>)[CSRF_HEADER]).toBeUndefined();
  });

  it("throws ApiError with status for non-401 failures", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "Not found" }, 404)
    );

    await expect(apiFetch("/children/nope")).rejects.toMatchObject({
      status: 404
    });
  });

  it("silently refreshes on 401 and retries the original request", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: "expired" }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: "rotated" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await apiFetch<{ ok: boolean }>("/children");

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const refreshCall = fetchMock.mock.calls[1];
    expect(refreshCall[0]).toContain("/auth/refresh");
    // No token in the body: the refresh token rides in an httpOnly cookie.
    expect(refreshCall[1].credentials).toBe("include");
    expect(JSON.parse(refreshCall[1].body)).toEqual({});
    expect(refreshCall[1].headers[CSRF_HEADER]).toBe(CSRF_VALUE);
  });

  it("clears the session when refresh fails", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: "expired" }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: "revoked" }, 401));

    await expect(apiFetch("/children")).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("does not try to refresh a failed login (401 from /auth/login)", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "Invalid credentials" }, 401)
    );

    await expect(apiFetch("/auth/login", { method: "POST" })).rejects.toMatchObject(
      { status: 401 }
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shares one refresh across concurrent 401s (single-flight)", async () => {
    let refreshCalls = 0;
    let refreshed = false;

    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes("/auth/refresh")) {
        refreshCalls += 1;
        refreshed = true;
        return jsonResponse({ message: "rotated" });
      }
      return refreshed
        ? jsonResponse({ ok: true })
        : jsonResponse({ message: "expired" }, 401);
    });

    const [a, b, c] = await Promise.all([
      apiFetch("/children"),
      apiFetch("/delegates"),
      apiFetch("/schools")
    ]);

    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    expect(c).toEqual({ ok: true });
    expect(refreshCalls).toBe(1);
  });

  it("wraps network failures in ApiError with status 0", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(apiFetch("/children")).rejects.toMatchObject({ status: 0 });
  });
});
