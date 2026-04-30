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
import { registerUser } from "@/services/auth.service";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormFieldError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const normalizePhone = (phone: string): string => {
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (cleaned.startsWith("+")) {
      return cleaned;
    }
    if (cleaned.startsWith("0")) {
      return "+234" + cleaned.slice(1);
    }
    return "+234" + cleaned;
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setError(null);

    const normalizedPhone = normalizePhone(data.phone);

    try {
      const response = await registerUser({
        fullName: data.fullName,
        phone: normalizedPhone,
        email: data.email || "",
        password: data.password,
      });
      router.push(`/verify?phone=${encodeURIComponent(normalizedPhone)}&otpToken=${response.otpToken}`);
    } catch (err: any) {
      if (err.data?.error === "PHONE_ALREADY_REGISTERED") {
        setFormFieldError("phone", { message: "Phone number already registered" });
      } else {
        setError(err.message || "A network error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <div className="mb-6 sm:mb-8">
        <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
          CREATE ACCOUNT
        </span>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[var(--auth-text)]">
          Your child's safety, <i className="text-teal-mid not-italic">here</i>
        </h1>
        <p className="mt-2 sm:mt-3 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-[var(--auth-text-muted)]">
          Join thousands of parents protecting their children at the school gate.
        </p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 rounded-[14px] bg-coral/10 border border-coral/20 p-3 sm:p-4 text-sm text-coral-light">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <InputField
          label="Full name"
          name="fullName"
          placeholder="Amara Osei"
          register={register}
          error={errors.fullName?.message}
        />
        <InputField
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="+234 801 234 5678"
          register={register}
          error={errors.phone?.message}
        />
        <InputField
          label="Email address (optional)"
          name="email"
          type="email"
          placeholder="amara@example.com"
          register={register}
          error={errors.email?.message}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          register={register}
          error={errors.password?.message}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          className="mt-4 sm:mt-6"
        >
          Create account
        </Button>
      </form>

      <div className="relative my-6 sm:my-8 flex items-center justify-center">
        <div className="absolute w-full border-t border-[var(--auth-border)]" />
        <span className="relative bg-[var(--auth-bg)] px-4 text-xs sm:text-sm text-[var(--auth-text-muted)]">or</span>
      </div>

      <p className="text-center font-body text-xs sm:text-sm text-[var(--auth-text-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
