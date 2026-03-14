import { http, HttpResponse } from "msw";

type RegisterRequest = {
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  role?: string;
};

type VerifyOtpRequest = {
  otpToken: string;
  otp: string;
};

type ResendOtpRequest = {
  otpToken: string;
};

type LoginRequest = {
  phone: string;
  password?: string;
};

type ForgotPasswordRequest = {
  phone: string;
};

type VerifyResetOtpRequest = {
  otpToken: string;
  otp: string;
};

type ResetPasswordRequest = {
  resetToken: string;
  password?: string;
};

const existingPhones = new Set<string>(["+2348011122233"]);
const validOtpCode = "847291";
let currentOtpToken = "otp.mock.token.1";
let currentResetToken = "reset.mock.token.1";

const user = {
  id: "usr_01H8M3Q9V",
  fullName: "Amara Osei",
  phone: "+2348012345678",
  email: "amara@example.com",
  role: "PARENT",
  createdAt: "2025-01-01T00:00:00Z"
};

export const authHandlers = [
  http.post("/auth/register", async ({ request }: { request: any }) => {
    const body = (await request.json()) as RegisterRequest;

    if (existingPhones.has(body.phone)) {
      return HttpResponse.json(
        {
          error: "PHONE_ALREADY_REGISTERED",
          message: "An account with this phone number already exists."
        },
        { status: 409 }
      );
    }

    currentOtpToken = "otp.mock.token." + Date.now().toString(36);

    return HttpResponse.json({
      message: `OTP sent to ${body.phone}`,
      otpToken: currentOtpToken,
      expiresIn: 300
    });
  }),

  http.post("/auth/verify-otp", async ({ request }: { request: any }) => {
    const body = (await request.json()) as VerifyOtpRequest;

    if (body.otp !== validOtpCode) {
      return HttpResponse.json(
        {
          error: "OTP_INVALID_OR_EXPIRED",
          message: "The code entered is incorrect or has expired."
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      accessToken: "access.mock.token." + Date.now().toString(36),
      refreshToken: "refresh.mock.token." + Date.now().toString(36),
      user
    });
  }),

  http.post("/auth/resend-otp", async ({ request }: { request: any }) => {
    currentOtpToken = "otp.mock.token." + Date.now().toString(36);

    return HttpResponse.json({
      message: "New OTP sent.",
      otpToken: currentOtpToken,
      expiresIn: 300
    });
  }),

  http.post("/auth/login", async ({ request }: { request: any }) => {
    const body = (await request.json()) as LoginRequest;

    return HttpResponse.json({
      accessToken: "access.mock.token." + Date.now().toString(36),
      refreshToken: "refresh.mock.token." + Date.now().toString(36),
      user: { ...user, phone: body.phone }
    });
  }),

  http.post("/auth/forgot-password", async ({ request }: { request: any }) => {
    const body = (await request.json()) as ForgotPasswordRequest;

    if (body.phone === "+2340000000000") {
      return HttpResponse.json(
        {
          error: "USER_NOT_FOUND",
          message: "No account found with this phone number."
        },
        { status: 404 }
      );
    }

    currentOtpToken = "otp.mock.token." + Date.now().toString(36);

    return HttpResponse.json({
      message: "Reset code sent.",
      otpToken: currentOtpToken,
      expiresIn: 300
    });
  }),

  http.post("/auth/verify-reset-otp", async ({ request }: { request: any }) => {
    const body = (await request.json()) as VerifyResetOtpRequest;

    if (body.otp !== validOtpCode) {
      return HttpResponse.json(
        {
          error: "OTP_INVALID_OR_EXPIRED",
          message: "The code entered is incorrect or has expired."
        },
        { status: 400 }
      );
    }

    currentResetToken = "reset.mock.token." + Date.now().toString(36);

    return HttpResponse.json({
      resetToken: currentResetToken,
      expiresIn: 600
    });
  }),

  http.post("/auth/reset-password", async ({ request }: { request: any }) => {
    return HttpResponse.json({
      message: "Password updated successfully."
    });
  }),

  http.get("/delegates/invite/:token/validate", async ({ params }: { params: any }) => {
    const { token } = params;
    
    if (token === "invalid") {
      return HttpResponse.json({ valid: false }, { status: 404 });
    }

    return HttpResponse.json({
      valid: true,
      data: {
        inviterName: "Amara Osei",
        children: ["Kofi Osei", "Abena Osei"],
        relationship: "Family Friend",
        expiryDate: new Date(Date.now() + 86400000).toISOString()
      }
    });
  }),

  http.post("/delegates/kyc/start", async () => {
    return HttpResponse.json({ message: "OTP sent." });
  }),

  http.post("/delegates/kyc/submit", async () => {
    return HttpResponse.json({ message: "KYC submitted." });
  }),

  http.get("/auth/me", async ({ request }: { request: any }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    return HttpResponse.json({ user });
  })
];
