import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";
import * as AuthService from "@/services/auth";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Feature 01 — AuthService", () => {
  it("createRegister returns otpToken and expiresIn; handles PHONE_ALREADY_REGISTERED", async () => {
    void AuthService;
    fail("not implemented");
  });

  it("verifyOtp returns accessToken, refreshToken, and user; handles OTP_INVALID_OR_EXPIRED", async () => {
    void AuthService;
    fail("not implemented");
  });

  it("resendOtp refreshes otpToken and enforces 60s cooldown on client", async () => {
    void AuthService;
    fail("not implemented");
  });

  it("refreshTokens replaces tokens; logs out on 401 and redirects to /login", async () => {
    void AuthService;
    fail("not implemented");
  });
});
