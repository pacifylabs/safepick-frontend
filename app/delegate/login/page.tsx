"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/ui/AuthCard";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { delegateService } from "@/services/delegate.service";
import { useToastStore } from "@/stores/toast.store";
import Link from "next/link";

const loginSchema = z.object({
  phone: z.string().min(7, "Enter a valid phone number"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function DelegateLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((state: any) => state.addToast);

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
        message = "Delegate account not found. Please ask the parent for an invite.";
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

  return (
    <main className="min-h-screen bg-[#0B1A2C] flex flex-col items-center justify-center p-6">
      <div className="mb-12">
        <Logo variant="light" size="lg" />
      </div>

      <AuthCard>
        <SectionLabel className="text-[#0FA37F]">DELEGATE LOGIN</SectionLabel>
        
        <h1 className="text-3xl font-semibold text-white mt-4 mb-2 font-display">
          Welcome back, <i className="text-[#0FA37F] not-italic">delegate</i>
        </h1>
        
        <p className="text-white/50 mb-8 text-sm leading-relaxed">
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

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
          <p className="text-white/40 text-sm">
            Not a delegate?{" "}
            <Link href="/login" className="text-[#0FA37F] font-medium hover:underline">
              Parent sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    </main>
  );
}
