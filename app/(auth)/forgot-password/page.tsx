"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/ui/AuthCard";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { forgotPassword } from "@/services/auth.service";
import { motion, AnimatePresence } from "framer-motion";

const forgotPasswordSchema = z.object({
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<"FORM" | "SUCCESS">("FORM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await forgotPassword(data);
      setPhone(data.phone);
      setState("SUCCESS");
    } catch (err: any) {
      if (err.data?.error === "USER_NOT_FOUND") {
        setError("phone", { message: "No account found with this phone number" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <button
        onClick={() => router.back()}
        className="mb-4 sm:mb-6 flex items-center text-sm font-medium text-[var(--auth-text-muted)] hover:text-[var(--auth-text)] transition-colors"
      >
        ← Back
      </button>

      <AnimatePresence mode="wait">
        {state === "FORM" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="mb-6 sm:mb-8">
              <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
                RESET PASSWORD
              </span>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[var(--auth-text)]">
                Forgot your <i className="text-teal-mid not-italic">password?</i>
              </h1>
              <p className="mt-2 sm:mt-3 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-[var(--auth-text-muted)]">
                Don&apos;t worry, it happens. Enter your phone number below and we&apos;ll send you a reset code.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <InputField
                label="Phone number"
                name="phone"
                type="tel"
                placeholder="+234 801 234 5678"
                register={register}
                error={errors.phone?.message}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isSubmitting}
                className="mt-4 sm:mt-6"
              >
                Send reset code
              </Button>
            </form>

            <p className="mt-6 sm:mt-8 text-center font-body text-xs sm:text-sm text-white/50">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-teal hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-teal/20 text-teal">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="sm:w-8 sm:h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-white">Code sent</h2>
            <p className="mt-2 sm:mt-3 font-body text-[0.85rem] sm:text-[0.9rem] text-white/50">
              We sent a reset code to <span className="font-medium text-white">{phone}</span>
            </p>

            <Button
              variant="primary"
              fullWidth
              className="mt-6 sm:mt-8"
              onClick={() => router.push(`/reset-password?phone=${encodeURIComponent(phone)}`)}
            >
              Enter reset code
            </Button>

            <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-white/40">
              Didn't receive it?{" "}
              <button className="font-medium text-teal hover:underline">
                Resend code
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
