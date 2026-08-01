import {
  CSRF_COOKIE,
  CSRF_HEADER,
  csrfHeaders,
  hasSessionCookie,
  readCookie
} from "@/lib/session";

function clearCookies() {
  document.cookie
    .split("; ")
    .filter(Boolean)
    .forEach((entry) => {
      const name = entry.split("=")[0];
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
}

describe("session helpers", () => {
  beforeEach(clearCookies);
  afterEach(clearCookies);

  describe("readCookie", () => {
    it("returns the value of a present cookie", () => {
      document.cookie = `${CSRF_COOKIE}=abc123`;
      expect(readCookie(CSRF_COOKIE)).toBe("abc123");
    });

    it("returns null when the cookie is absent", () => {
      expect(readCookie(CSRF_COOKIE)).toBeNull();
    });

    it("does not match a cookie whose name merely shares a prefix", () => {
      document.cookie = `${CSRF_COOKIE}_other=abc123`;
      expect(readCookie(CSRF_COOKIE)).toBeNull();
    });

    it("decodes percent-encoded values", () => {
      document.cookie = `${CSRF_COOKIE}=${encodeURIComponent("a b/c")}`;
      expect(readCookie(CSRF_COOKIE)).toBe("a b/c");
    });
  });

  describe("hasSessionCookie", () => {
    it("is true once the CSRF cookie exists", () => {
      document.cookie = `${CSRF_COOKIE}=abc123`;
      expect(hasSessionCookie()).toBe(true);
    });

    it("is false when no session has been established", () => {
      expect(hasSessionCookie()).toBe(false);
    });
  });

  describe("csrfHeaders", () => {
    beforeEach(() => {
      document.cookie = `${CSRF_COOKIE}=abc123`;
    });

    it.each(["POST", "PUT", "PATCH", "DELETE", "post"])(
      "includes the token for mutating method %s",
      (method) => {
        expect(csrfHeaders(method)).toEqual({ [CSRF_HEADER]: "abc123" });
      }
    );

    it.each(["GET", "HEAD", "OPTIONS"])(
      "omits the token for safe method %s",
      (method) => {
        expect(csrfHeaders(method)).toEqual({});
      }
    );

    it("defaults to treating an unspecified method as safe", () => {
      expect(csrfHeaders()).toEqual({});
    });

    it("omits the header when no CSRF cookie is present", () => {
      clearCookies();
      expect(csrfHeaders("POST")).toEqual({});
    });
  });
});
