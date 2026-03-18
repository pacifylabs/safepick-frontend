"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Phone, 
  ArrowLeft, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { secondaryGuardianService } from "@/services/secondaryGuardian.service";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Logo } from "@/components/ui/Logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const LoginSchema = z.object({
  phone: z.string().min(7, "Enter a valid phone number"),
});

type LoginFields = z.infer<typeof LoginSchema>;

export default function SecondaryLoginPage() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const { otpToken } = await secondaryGuardianService.secondaryLogin(data.phone);
      router.push(`/secondary/verify?otpToken=${encodeURIComponent(otpToken)}&phone=${encodeURIComponent(data.phone)}`);
    } catch (err: any) {
      setError(err.message || "Failed to log in. Check your number and try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="bg-[var(--auth-bg)] min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] mx-auto flex flex-col items-center"
      >
        <Logo variant="light" size="sm" className="mb-8" />
        
        <span className="font-body text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#0FA37F] mb-3">
          SECONDARY GUARDIAN LOGIN
        </span>
        
        <h1 className="font-display text-[2rem] font-semibold text-white text-center leading-[1.08] tracking-[-0.03em] mb-2">
          Welcome back
        </h1>
        
        <p className="font-body text-[0.875rem] text-[var(--auth-text-muted)] text-center leading-relaxed mb-8">
          Enter your phone number to access your dashboard.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <InputField
            label="Phone number"
            name="phone"
            type="tel"
            register={register}
            error={errors.phone?.message}
            placeholder="+234 801 234 5678"
            className="bg-[var(--auth-surface)] border-[var(--auth-border)] text-white placeholder:text-[var(--auth-text-muted)]"
          />

          {error && (
            <div className="bg-[#D85A30]/10 border border-[#D85A30]/30 rounded-xl p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#D85A30] flex-shrink-0" />
              <p className="font-body text-[0.78rem] text-[#D85A30]">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={isLoggingIn}
            className="h-14 text-[1rem]"
          >
            {isLoggingIn ? "Sending code..." : "Send verification code"}
          </Button>
        </form>

        <div className="w-full mt-6 p-5 bg-[var(--auth-surface)] border border-[var(--auth-border)] rounded-2xl">
          <p className="font-body text-[0.78rem] font-bold text-white mb-2 uppercase tracking-wider">
            Note
          </p>
          <p className="font-body text-[0.82rem] text-[var(--auth-text-muted)] leading-relaxed">
            If you haven't been added as a secondary guardian yet, you won't be able to log in. 
            Contact the primary parent to send you an invite.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
