import { z } from "zod";
import { apiFetch } from "@/services/apiClient";

const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
  role: z.string(),
  phoneVerified: z.boolean(),
  createdAt: z.string()
});

const registerRequestSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional()
});

const registerResponseSchema = z.object({
  message: z.string(),
  otpToken: z.string(),
  expiresIn: z.number()
});

const verifyOtpRequestSchema = z.object({
  otpToken: z.string(),
  otp: z.string()
});

const verifyOtpResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema
});

const resendOtpRequestSchema = z.object({
  otpToken: z.string()
});

const resendOtpResponseSchema = z.object({
  message: z.string(),
  otpToken: z.string(),
  expiresIn: z.number()
});

const loginRequestSchema = z.object({
  phone: z.string(),
  password: z.string()
});

const loginResponseSchema = verifyOtpResponseSchema;

const refreshRequestSchema = z.object({
  refreshToken: z.string()
});

const refreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});

const forgotPasswordRequestSchema = z.object({
  phone: z.string()
});

const forgotPasswordResponseSchema = z.object({
  message: z.string(),
  otpToken: z.string(),
  expiresIn: z.number()
});

const verifyResetOtpRequestSchema = z.object({
  otpToken: z.string(),
  otp: z.string()
});

const verifyResetOtpResponseSchema = z.object({
  resetToken: z.string(),
  expiresIn: z.number()
});

const resetPasswordRequestSchema = z.object({
  resetToken: z.string(),
  password: z.string()
});

const resetPasswordResponseSchema = z.object({
  message: z.string()
});

const getMeResponseSchema = z.object({
  user: userSchema
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>;
export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;
export type ResendOtpRequest = z.infer<typeof resendOtpRequestSchema>;
export type ResendOtpResponse = z.infer<typeof resendOtpResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>;
export type VerifyResetOtpRequest = z.infer<typeof verifyResetOtpRequestSchema>;
export type VerifyResetOtpResponse = z.infer<typeof verifyResetOtpResponseSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
export type GetMeResponse = z.infer<typeof getMeResponseSchema>;

export async function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  const body = registerRequestSchema.parse(payload);
  const data = await apiFetch<unknown>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return registerResponseSchema.parse(data);
}

export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const body = verifyOtpRequestSchema.parse(payload);
  const data = await apiFetch<unknown>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return verifyOtpResponseSchema.parse(data);
}

export async function resendOtp(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
  const body = resendOtpRequestSchema.parse(payload);
  const data = await apiFetch<unknown>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return resendOtpResponseSchema.parse(data);
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const body = loginRequestSchema.parse(payload);
  const data = await apiFetch<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return loginResponseSchema.parse(data);
}

export async function getCurrentUser(): Promise<GetMeResponse> {
  const data = await apiFetch<unknown>("/auth/me");
  return getMeResponseSchema.parse(data);
}

export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const body = forgotPasswordRequestSchema.parse(payload);
  const data = await apiFetch<unknown>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return forgotPasswordResponseSchema.parse(data);
}

export async function verifyResetOtp(
  payload: VerifyResetOtpRequest
): Promise<VerifyResetOtpResponse> {
  const body = verifyResetOtpRequestSchema.parse(payload);
  const data = await apiFetch<unknown>("/auth/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return verifyResetOtpResponseSchema.parse(data);
}

export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const body = resetPasswordRequestSchema.parse(payload);
  const data = await apiFetch<unknown>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return resetPasswordResponseSchema.parse(data);
}

export async function refreshToken(payload: RefreshRequest): Promise<RefreshResponse> {
  const body = refreshRequestSchema.parse(payload);
  const data = await apiFetch<unknown>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return refreshResponseSchema.parse(data);
}
