/** @jest-environment node */
import { SignJWT } from "jose";
import { isValidToken } from "@/lib/authToken";

const SECRET = "test-verification-secret";
const encoder = new TextEncoder();

async function makeToken(opts: {
  secret?: string;
  expiresIn?: number; // seconds from now, negative = already expired
  omitExp?: boolean;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  let jwt = new SignJWT({ sub: "usr_01", role: "PARENT" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now);
  if (!opts.omitExp) {
    jwt = jwt.setExpirationTime(now + (opts.expiresIn ?? 900));
  }
  return jwt.sign(encoder.encode(opts.secret ?? SECRET));
}

describe("isValidToken", () => {
  const OLD_ENV = process.env;

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe("without a verification secret (decode + expiry mode)", () => {
    beforeEach(() => {
      process.env = { ...OLD_ENV };
      delete process.env.JWT_VERIFICATION_SECRET;
      delete process.env.JWT_DELEGATE_VERIFICATION_SECRET;
    });

    it("rejects a missing token", async () => {
      expect(await isValidToken(undefined, "parent")).toBe(false);
    });

    it("rejects garbage that is not a JWT", async () => {
      expect(await isValidToken("just-some-string", "parent")).toBe(false);
      expect(await isValidToken("a.b.c", "parent")).toBe(false);
    });

    it("rejects an expired token", async () => {
      const token = await makeToken({ expiresIn: -60 });
      expect(await isValidToken(token, "parent")).toBe(false);
    });

    it("rejects a token without an exp claim", async () => {
      const token = await makeToken({ omitExp: true });
      expect(await isValidToken(token, "parent")).toBe(false);
    });

    it("accepts a structurally valid, unexpired token", async () => {
      const token = await makeToken({ expiresIn: 900 });
      expect(await isValidToken(token, "parent")).toBe(true);
    });
  });

  describe("with a verification secret (full signature mode)", () => {
    beforeEach(() => {
      process.env = {
        ...OLD_ENV,
        JWT_VERIFICATION_SECRET: SECRET,
        JWT_DELEGATE_VERIFICATION_SECRET: "delegate-secret"
      };
    });

    it("accepts a token signed with the right secret", async () => {
      const token = await makeToken({ secret: SECRET });
      expect(await isValidToken(token, "parent")).toBe(true);
    });

    it("rejects a token signed with the wrong secret (forged cookie)", async () => {
      const token = await makeToken({ secret: "attacker-secret" });
      expect(await isValidToken(token, "parent")).toBe(false);
    });

    it("rejects an expired token even when correctly signed", async () => {
      const token = await makeToken({ secret: SECRET, expiresIn: -60 });
      expect(await isValidToken(token, "parent")).toBe(false);
    });

    it("uses the delegate secret for delegate tokens", async () => {
      const delegateToken = await makeToken({ secret: "delegate-secret" });
      expect(await isValidToken(delegateToken, "delegate")).toBe(true);

      const parentSignedToken = await makeToken({ secret: SECRET });
      expect(await isValidToken(parentSignedToken, "delegate")).toBe(false);
    });
  });
});
