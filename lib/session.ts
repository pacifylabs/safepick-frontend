/**
 * The session itself lives in httpOnly cookies that scripts cannot read. The
 * CSRF cookie is set alongside it and is deliberately readable, so its
 * presence is the client-side signal that a session probably exists.
 *
 * It is a hint for rendering only - never an authorization decision. The
 * server re-validates every request, and middleware verifies the real token.
 */
export const CSRF_COOKIE = "sp_csrf";
export const CSRF_HEADER = "X-CSRF-Token";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function hasSessionCookie(): boolean {
  return readCookie(CSRF_COOKIE) !== null;
}

/**
 * Double-submit: the server compares this header against the CSRF cookie.
 * Only same-origin script can read the cookie, and a cross-origin caller
 * cannot set a custom header without a CORS preflight we reject.
 */
export function csrfHeaders(method = "GET"): Record<string, string> {
  if (!MUTATING_METHODS.has(method.toUpperCase())) return {};

  const token = readCookie(CSRF_COOKIE);
  return token ? { [CSRF_HEADER]: token } : {};
}
