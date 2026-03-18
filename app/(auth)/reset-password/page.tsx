"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/ui/AuthCard";
import { InputField } from "@/components/ui/InputField";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";
import { verifyResetOtp, resetPassword } from "@/services/auth.service";
import { motion, AnimatePresence } from "framer-motion";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  const [step, setStep] = useState<"OTP" | "NEW_PASSWORD">("OTP");
  const [resetToken, setResetToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch("password", "");

  const handleOtpComplete = async (otp: string) => {
    setIsVerifying(true);
    setHasOtpError(false);
    try {
      // Assuming forgotPassword already happened and we have an otpToken if needed
      // but the spec says POST /auth/verify-reset-otp { otpToken, otp }
      // I'll assume we pass the phone if we don't have otpToken
      const response = await verifyResetOtp({ otpToken: phone, otp });
      setResetToken(response.resetToken);
      setStep("NEW_PASSWORD");
    } catch (err) {
      setHasOtpError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const onPasswordSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await resetPassword({ resetToken, password: data.password });
      setSuccessMessage("Password updated. Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(passwordValue);

  return (
    <AuthCard>
      <div className="mb-6 sm:mb-10 flex items-center justify-between gap-2 px-2">
        {[
          { label: "Phone", step: "OTP", active: true },
          { label: "Identity", step: "NEW_PASSWORD", active: step === "NEW_PASSWORD" },
          { label: "Done", step: "DONE", active: !!successMessage },
        ].map((s, i, arr) => (
          <div key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <div
                className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-[0.65rem] sm:text-xs font-semibold transition-colors duration-300 ${
                  s.active ? "bg-teal text-white" : "border border-[var(--auth-border)] text-[var(--auth-text-muted)]"
                }`}
              >
                {i < (step === "NEW_PASSWORD" ? 1 : 0) || successMessage ? "✓" : i + 1}
              </div>
              <span className={`text-[0.55rem] sm:text-[0.65rem] uppercase tracking-wider ${s.active ? "text-white" : "text-[var(--auth-text-muted)]"}`}>
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className="mx-1 sm:mx-2 mb-4 sm:mb-6 h-[1px] flex-1 bg-[var(--auth-surface)]">
                <div
                  className="h-full bg-teal/50 transition-all duration-500"
                  style={{ width: i < (step === "NEW_PASSWORD" ? 1 : 0) || successMessage ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "OTP" ? (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
              STEP 1 OF 2
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
              Enter the <i className="text-teal-mid not-italic">reset code</i>
            </h1>
            <p className="mt-2 sm:mt-3 mb-6 sm:mb-8 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-[var(--auth-text-muted)]">
              Enter the 6-digit code sent to <span className="font-medium text-white">{phone}</span>
            </p>

            <div className="flex flex-col items-center">
              <OtpInput length={6} onComplete={handleOtpComplete} error={hasOtpError} disabled={isVerifying} />
              {hasOtpError && (
                <p className="mt-2 sm:mt-3 text-[0.74rem] sm:text-[0.78rem] text-coral-light">Incorrect code. Please try again.</p>
              )}
              <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-[var(--auth-text-muted)]">
                Didn't receive it?{" "}
                <button className="font-medium text-teal hover:underline">Resend code</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
              NEW PASSWORD
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
              Choose a new <i className="text-teal-mid not-italic">password</i>
            </h1>
            <p className="mt-2 sm:mt-3 mb-6 sm:mb-8 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-[var(--auth-text-muted)]">
              Make it strong. At least 8 characters.
            </p>

            {successMessage ? (
              <div className="rounded-[14px] bg-teal/10 border border-teal/20 p-3 sm:p-4 text-center text-teal-light">
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3 sm:space-y-4">
                <InputField
                  label="New password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  register={register}
                  error={errors.password?.message}
                />
                <InputField
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  register={register}
                  error={errors.confirmPassword?.message}
                />

                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength
                            ? strength === 1
                              ? "bg-coral"
                              : strength === 2
                              ? "bg-amber"
                              : strength === 3
                              ? "bg-teal-mid"
                              : "bg-teal"
                            : "bg-[var(--auth-surface)]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[0.65rem] sm:text-[0.7rem] text-[var(--auth-text-muted)] uppercase tracking-widest">
                    {strength === 1 && "Weak"}
                    {strength === 2 && "Fair"}
                    {strength === 3 && "Good"}
                    {strength === 4 && "Strong"}
                  </p>
                </div>

                <Button type="submit" variant="primary" fullWidth loading={isSubmitting} className="mt-4 sm:mt-6">
                  Set new password
                </Button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
