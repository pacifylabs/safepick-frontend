import { apiFetch, ApiError } from "@/services/apiClient";
import { useAuthStore } from "@/stores/auth.store";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

describe("apiFetch", () => {
  let fetchMock: jest.SpyInstance;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
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
    useAuthStore.setState({
      user: null,
      accessToken: "access-1",
      refreshToken: "refresh-1",
      isAuthenticated: true
    });
  });

  afterEach(() => {
    fetchMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  it("attaches the bearer token and returns parsed JSON", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await apiFetch<{ ok: boolean }>("/children");

    expect(result).toEqual({ ok: true });
    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer access-1"
    );
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
      // original request -> 401
      .mockResolvedValueOnce(jsonResponse({ message: "expired" }, 401))
      // refresh -> new tokens
      .mockResolvedValueOnce(
        jsonResponse({ accessToken: "access-2", refreshToken: "refresh-2" })
      )
      // retried request -> success
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await apiFetch<{ ok: boolean }>("/children");

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const refreshCall = fetchMock.mock.calls[1];
    expect(refreshCall[0]).toContain("/auth/refresh");
    expect(JSON.parse(refreshCall[1].body)).toEqual({
      refreshToken: "refresh-1"
    });

    // retried with the rotated access token
    const retryCall = fetchMock.mock.calls[2];
    expect(
      (retryCall[1].headers as Record<string, string>)["Authorization"]
    ).toBe("Bearer access-2");

    expect(useAuthStore.getState().accessToken).toBe("access-2");
    expect(useAuthStore.getState().refreshToken).toBe("refresh-2");
  });

  it("clears the session when refresh fails", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: "expired" }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: "revoked" }, 401));

    await expect(apiFetch("/children")).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("does not attempt refresh when there is no refresh token", async () => {
    useAuthStore.setState({ refreshToken: null });
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "expired" }, 401));

    await expect(apiFetch("/children")).rejects.toMatchObject({ status: 401 });
    // only the original request - no refresh call
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (String(url).includes("/auth/refresh")) {
        refreshCalls += 1;
        return jsonResponse({ accessToken: "access-2", refreshToken: "refresh-2" });
      }
      const auth = (init?.headers as Record<string, string>)?.["Authorization"];
      if (auth === "Bearer access-2") return jsonResponse({ ok: true });
      return jsonResponse({ message: "expired" }, 401);
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
