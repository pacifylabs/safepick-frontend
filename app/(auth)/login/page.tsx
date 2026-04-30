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
  const clearMswSession = useAuthStore((state: any) => state.clearMswSession);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
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

   const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);

    const normalizedData = {
      ...data,
      phone: normalizePhone(data.phone),
    };

    try {
      const response = await loginUser(normalizedData);
      console.log("[Login] API Response:", response);
      setSession(response.user as any, response.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[Login] Error:", err);
      setError(err?.data?.message || err?.message || "Invalid phone number or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async (userType: "parent" | "delegate" | "school") => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if MSW is available by making a test call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+2348012345678", password: "demo" })
      });
      
      if (!response.ok) {
        throw new Error("MSW not available");
      }
      
      // Mock successful login based on user type
      let mockUser, redirectPath;
      
      switch (userType) {
        case "parent":
          mockUser = {
            id: "usr_01H8M3Q9V",
            fullName: "Amara Osei",
            phone: "+2348012345678",
            email: "amara@example.com",
            role: "PARENT",
            createdAt: "2025-01-01T00:00:00Z"
          };
          redirectPath = "/dashboard";
          break;
        case "delegate":
          mockUser = {
            id: "del_123",
            fullName: "John Driver",
            phone: "+2348012345678",
            photoUrl: null,
            kycStatus: "APPROVED",
            role: "DELEGATE",
            createdAt: "2024-03-15T10:00:00Z"
          };
          redirectPath = "/delegate/dashboard";
          break;
        case "school":
          mockUser = {
            id: "sch_001",
            fullName: "Grange School Admin",
            phone: "+2348012345678",
            email: "admin@grange.edu",
            role: "SCHOOL_ADMIN",
            createdAt: "2024-01-01T00:00:00Z"
          };
          redirectPath = "/school/gate";
          break;
      }
      
      clearMswSession();
      setSession(mockUser as any, "demo-mock-token");
      router.push(redirectPath);
      
    } catch (err) {
      setError("Demo mode is not available. MSW is not running.");
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

      {/* Quick Demo Access */}
      <div className="mt-6 pt-6 border-t border-[var(--auth-border)]">
        <p className="text-center font-body text-xs sm:text-sm text-[var(--auth-text-muted)] mb-4">
          Quick demo access (MSW required)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleDemoAccess("parent")}
            disabled={isSubmitting}
            className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-700 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Demo as Parent
          </button>
          <button
            onClick={() => handleDemoAccess("delegate")}
            disabled={isSubmitting}
            className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-700 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Demo as Delegate
          </button>
          <button
            onClick={() => handleDemoAccess("school")}
            disabled={isSubmitting}
            className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-700 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Demo as School
          </button>
        </div>
      </div>
    </AuthCard>
  );
}
