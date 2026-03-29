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
import { loginUser } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

const loginSchema = z.object({
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state: any) => state.setSession);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    // Demo mode fallback for production without backend
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" && !process.env.NEXT_PUBLIC_API_BASE_URL) {
      // Mock successful login
      const mockUser = {
        id: "usr_01H8M3Q9V",
        fullName: "Amara Osei",
        phone: data.phone,
        email: "amara@example.com",
        role: "PARENT",
        createdAt: "2025-01-01T00:00:00Z"
      };
      setSession(mockUser as any, "demo-mock-token");
      router.push("/dashboard");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await loginUser(data);
      setSession(response.user as any, response.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid phone number or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      <div className="mb-6 sm:mb-8">
        <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-gray-400">
          WELCOME BACK
        </span>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
          Good to see you <i className="text-teal-mid not-italic">again</i>
        </h1>
        <p className="mt-2 sm:mt-3 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-white/50">
          Sign in to your SafePick account.
        </p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 rounded-[14px] bg-red-50 border border-red-200 p-3 sm:p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <InputField
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="+234 801 234 5678"
          register={register}
          error={errors.phone?.message}
        />
        <div className="relative">
          <InputField
            label="Your password"
            name="password"
            type="password"
            placeholder="••••••••"
            register={register}
            error={errors.password?.message}
          />
          <Link
            href="/forgot-password"
            className="absolute right-0 bottom-0 text-[0.75rem] sm:text-[0.8rem] text-teal hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          className="mt-4 sm:mt-6"
        >
          Sign in
        </Button>
      </form>

      <div className="relative my-6 sm:my-8 flex items-center justify-center">
        <div className="absolute w-full border-t border-[var(--auth-border)]" />
        <span className="relative bg-[var(--auth-bg)] px-4 text-xs sm:text-sm text-[var(--auth-text-muted)]">or</span>
      </div>

      <p className="text-center font-body text-xs sm:text-sm text-[var(--auth-text-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-teal hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-8 pt-6 border-t border-[var(--auth-border)] text-center">
        <p className="font-body text-xs sm:text-sm text-[var(--auth-text-muted)]">
          Are you a delegate?{" "}
          <Link href="/delegate/login" className="font-medium text-[#0FA37F] hover:underline">
            Delegate sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
