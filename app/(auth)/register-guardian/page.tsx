"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/ui/AuthCard";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { registerUser } from "@/services/auth.service";

const registerGuardianSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterGuardianFormValues = z.infer<typeof registerGuardianSchema>;

export default function RegisterGuardianPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "";
  const inviterName = searchParams.get("inviter") || "A parent";

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormFieldError,
  } = useForm<RegisterGuardianFormValues>({
    resolver: zodResolver(registerGuardianSchema),
    defaultValues: {
      phone: phoneParam,
    },
  });

  const onSubmit = async (data: RegisterGuardianFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await registerUser({
        fullName: data.fullName,
        phone: data.phone,
        email: "",
        password: data.password,
        role: "SECONDARY_GUARDIAN",
      });
      router.push(`/verify?phone=${encodeURIComponent(data.phone)}&role=guardian&otpToken=${response.otpToken}`);
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
      <div className="mb-4 sm:mb-6 rounded-[14px] bg-teal/10 border border-teal/20 p-3 sm:p-4 flex gap-3">
        <div className="flex-shrink-0 mt-0.5 text-teal">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h4 className="font-body text-[0.78rem] sm:text-[0.82rem] font-medium text-white mb-0.5 sm:mb-1">
            {inviterName} added you as a trusted guardian
          </h4>
          <p className="font-body text-[0.74rem] sm:text-[0.78rem] text-white/50 leading-relaxed">
            Create your account to receive pickup requests when they're unavailable.
          </p>
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
          JOIN SAFEPICK
        </span>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
          You're a trusted <i className="text-teal-mid not-italic">guardian</i>
        </h1>
        <p className="mt-2 sm:mt-3 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-white/50">
          Complete your account to start protecting the children in your care.
        </p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 rounded-[14px] bg-coral/10 border border-coral/20 p-3 sm:p-4 text-sm text-coral-light">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <InputField
          label="Your full name"
          name="fullName"
          placeholder="Kwame Osei"
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
          Create guardian account
        </Button>
      </form>

      <p className="mt-6 sm:mt-8 text-center font-body text-[0.7rem] sm:text-[0.75rem] text-white/30 leading-relaxed">
        By continuing you agree to{" "}
        <Link href="/terms" className="text-white/50 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-white/50 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </AuthCard>
  );
}
