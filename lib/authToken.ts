// Subpath imports, not the "jose" barrel: the barrel drags JWE/compression
// code into the Edge middleware bundle and trips "Node.js API not supported
// in Edge Runtime" build warnings.
import { jwtVerify } from "jose/jwt/verify";
import { decodeJwt } from "jose/jwt/decode";

export type TokenRole = "parent" | "delegate" | "secondary";

const encoder = new TextEncoder();

function secretFor(role: TokenRole): Uint8Array | null {
  // Server-only vars (no NEXT_PUBLIC_ prefix) - never exposed to the client.
  const raw =
    role === "delegate"
      ? process.env.JWT_DELEGATE_VERIFICATION_SECRET
      : process.env.JWT_VERIFICATION_SECRET;
  return raw ? encoder.encode(raw) : null;
}

/**
 * Middleware-side token check. With a verification secret configured this
 * verifies signature + expiry; without one it falls back to decoding and
 * checking expiry only. Either way an unparseable, expired, or (when
 * verifiable) tampered token is treated as unauthenticated. The API is the
 * authoritative enforcement point - this exists so protected pages don't
 * render for stale or forged cookies.
 */
export async function isValidToken(
  token: string | undefined,
  role: TokenRole,
): Promise<boolean> {
  if (!token) return false;

  const secret = secretFor(role);
  if (secret) {
    try {
      await jwtVerify(token, secret);
      return true;
    } catch {
      return false;
    }
  }

  try {
    const payload = decodeJwt(token);
    if (!payload.exp) return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
