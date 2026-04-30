"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/ui/AuthCard";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { delegateService } from "@/services/delegate.service";
import { useToastStore } from "@/stores/toast.store";
import { useDelegateAuthStore } from "@/stores/delegateAuth.store";
import Link from "next/link";

const loginSchema = z.object({
  phone: z.string().min(7, "Enter a valid phone number"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function DelegateLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((state: any) => state.addToast);
  const setDelegateSession = useDelegateAuthStore((state: any) => state.setSession);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await delegateService.login(data.phone);
      addToast({
        message: "Login code sent to your phone",
        variant: "success",
      });
      router.push(`/delegate/verify?phone=${encodeURIComponent(data.phone)}&token=${response.otpToken}`);
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";
      if (error.status === 404 || error.data?.error === "DELEGATE_NOT_FOUND") {
        message = "Delegate account not found. Please ask your parent for an invite.";
        setError("phone", { message });
      } else {
        setError("phone", { message: error.message || message });
      }
      addToast({
        message,
        variant: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = (userType: "delegate" | "school") => {
    setIsLoading(true);

    // Bypass verification — directly set mock session and redirect to dashboard
    let mockDelegate: any;
    let redirectPath: string;

    switch (userType) {
      case "delegate":
        mockDelegate = {
          id: "del_123",
          fullName: "John Driver",
          phone: "+2348012345678",
          photoUrl: null,
          kycStatus: "APPROVED",
          role: "DELEGATE",
          createdAt: "2024-03-15T10:00:00Z",
          totalAuthorizations: 2,
          activeAuthorizations: 2,
          pendingPickupsToday: 1,
        };
        redirectPath = "/delegate/dashboard";
        break;
      case "school":
      default:
        mockDelegate = {
          id: "sch_001",
          fullName: "Grange School Admin",
          phone: "+2348012345678",
          photoUrl: null,
          kycStatus: "APPROVED",
          role: "SCHOOL_ADMIN",
          createdAt: "2024-01-01T00:00:00Z",
          totalAuthorizations: 0,
          activeAuthorizations: 0,
          pendingPickupsToday: 0,
        };
        redirectPath = "/school/gate";
        break;
    }

    setDelegateSession(mockDelegate, "demo-mock-token");
    router.push(redirectPath);
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0B1A2C] flex flex-col overflow-x-hidden relative">
      <AuthNavbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-[480px] mx-auto">
          <AuthCard className="w-full">
            <SectionLabel className="text-[#0FA37F]">DELEGATE LOGIN</SectionLabel>

            <h1 className="text-3xl font-semibold text-[var(--auth-text)] mt-4 mb-2 font-display">
              Welcome back, <span className="text-[#0FA37F]">delegate</span>
            </h1>

            <p className="text-[var(--auth-text-muted)] mb-8 text-sm leading-relaxed">
              Sign in to view your pickup schedule and QR codes.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+234 801 234 5678"
                register={register}
                error={errors.phone?.message}
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
              >
                Send login code
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-[var(--auth-border)] flex flex-col items-center gap-4">
              <p className="text-[var(--auth-text-muted)] text-sm">
                Not a delegate?{" "}
                <Link href="/login" className="text-[#0FA37F] font-medium hover:underline">
                  Parent sign in
                </Link>
              </p>

              {/* Quick Demo Access */}
              <p className="text-[var(--auth-text-muted)] text-sm mb-4">
                Quick demo access (MSW required)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDemoAccess("delegate")}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-700 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Demo as Delegate
                </button>
                <button
                  onClick={() => handleDemoAccess("school")}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-700 hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Demo as School
                </button>
              </div>
            </div>
          </AuthCard>
        </div>
      </div>
    </main>
  );
}
