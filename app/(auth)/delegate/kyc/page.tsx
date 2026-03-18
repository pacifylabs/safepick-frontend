"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/ui/AuthCard";
import { InputField } from "@/components/ui/InputField";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/services/apiClient";

const kycSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  idType: z.string().min(1, "Please select an ID type"),
  idNumber: z.string().min(4, "Invalid ID number"),
});

type KycFormValues = z.infer<typeof kycSchema>;

type Step = "PHONE" | "OTP" | "IDENTITY" | "SUBMITTED";

function DelegateKycContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [step, setStep] = useState<Step>("PHONE");
  const [phone, setPhone] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploads, setUploads] = useState<{ [key: string]: string | null }>({
    front: null,
    back: null,
    selfie: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
  });

  const onPhoneSubmit = async () => {
    if (!phone) return;
    setIsVerifying(true);
    try {
      await apiFetch<any>("/delegates/kyc/start", {
        method: "POST",
        body: JSON.stringify({ inviteToken: token, phone }),
      });
      setStep("OTP");
    } catch (err) {
      // Handle error
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneVerified = async (otp: string) => {
    setIsVerifying(true);
    setHasOtpError(false);
    try {
      // In a real app, you'd verify the OTP here
      // For now, we simulate success
      setStep("IDENTITY");
    } catch (err) {
      setHasOtpError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const onIdentitySubmit = async (data: KycFormValues) => {
    setIsSubmitting(true);
    try {
      await apiFetch<any>("/delegates/kyc/submit", {
        method: "POST",
        body: JSON.stringify({ ...data, ...uploads, inviteToken: token }),
      });
      setStep("SUBMITTED");
    } catch (err) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = (type: string) => {
    setUploads((prev) => ({ ...prev, [type]: "uploaded_file.png" }));
  };

  const currentStepIndex = 
    step === "PHONE" ? 0 : 
    step === "OTP" ? 0 : // Both phone and OTP are step 1 visually
    step === "IDENTITY" ? 1 : 2;

  return (
    <>
      <div className="mb-6 sm:mb-10 flex items-center justify-between gap-2 px-2">
        {[
          { label: "Phone", active: step === "PHONE" || step === "OTP" },
          { label: "Identity", active: step === "IDENTITY" },
          { label: "Done", active: step === "SUBMITTED" },
        ].map((s, i, arr) => (
          <div key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <div
                className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-[0.65rem] sm:text-xs font-semibold transition-colors duration-300 ${
                  s.active || i < currentStepIndex ? "bg-teal text-white" : "border border-[var(--auth-border)] text-[var(--auth-text-muted)]"
                }`}
              >
                {i < currentStepIndex || step === "SUBMITTED" ? "✓" : i + 1}
              </div>
              <span className={`text-[0.55rem] sm:text-[0.65rem] uppercase tracking-wider ${s.active || i < currentStepIndex ? "text-white" : "text-[var(--auth-text-muted)]"}`}>
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className="mx-1 sm:mx-2 mb-4 sm:mb-6 h-[1px] flex-1 bg-[var(--auth-surface)]">
                <div
                  className="h-full bg-teal/50 transition-all duration-500"
                  style={{ width: i < currentStepIndex || step === "SUBMITTED" ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "PHONE" && (
          <motion.div 
            key="phone" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
          >
            <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
              STEP 1 OF 3
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
              Verify your <i className="text-teal-mid not-italic">phone</i>
            </h1>
            <p className="mt-2 sm:mt-3 mb-6 sm:mb-8 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-[var(--auth-text-muted)]">
              We'll send a one-time code to confirm your number.
            </p>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[0.75rem] sm:text-[0.78rem] font-medium text-white/70">Your phone number</label>
                <input
                  type="tel"
                  placeholder="+234 801 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 bg-[var(--auth-surface)] border border-[var(--auth-border)] rounded-[14px] text-white text-[0.9rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all"
                />
              </div>

              <Button variant="primary" fullWidth loading={isVerifying} onClick={onPhoneSubmit}>
                Send verification code
              </Button>
            </div>
          </motion.div>
        )}

        {step === "OTP" && (
          <motion.div 
            key="otp" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={() => setStep("PHONE")}
              className="mb-4 text-xs text-[var(--auth-text-muted)] hover:text-white transition-colors flex items-center gap-1"
            >
              ← Back to phone
            </button>
            <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
              ENTER CODE
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
              Check your <i className="text-teal-mid not-italic">messages</i>
            </h1>
            <p className="mt-2 sm:mt-3 mb-6 sm:mb-8 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-[var(--auth-text-muted)]">
              Enter the 6-digit code sent to <span className="text-white font-medium">{phone}</span>
            </p>

            <div className="flex flex-col items-center">
              <OtpInput length={6} onComplete={handlePhoneVerified} error={hasOtpError} disabled={isVerifying} />
              {hasOtpError && (
                <p className="mt-2 sm:mt-3 text-[0.74rem] sm:text-[0.78rem] text-coral-light">Incorrect code. Please try again.</p>
              )}
              <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-[var(--auth-text-muted)] text-center">
                Didn't receive it?{" "}
                <button className="font-medium text-teal hover:underline">Resend code</button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "IDENTITY" && (
          <motion.div 
            key="identity" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
          >
            <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
              STEP 2 OF 3
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
              Your <i className="text-teal-mid not-italic">identity</i>
            </h1>
            <p className="mt-2 sm:mt-3 mb-6 sm:mb-8 font-body text-[0.85rem] sm:text-[0.9rem] font-light leading-relaxed text-[var(--auth-text-muted)]">
              We need to verify who you are. Kept private and encrypted.
            </p>

            <form onSubmit={handleSubmit(onIdentitySubmit)} className="space-y-3 sm:space-y-4">
              <InputField label="Full name" name="fullName" placeholder="David Mensah" register={register} error={errors.fullName?.message} />
              
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[0.75rem] sm:text-[0.78rem] font-medium text-white/70">ID Type</label>
                <select
                  {...register("idType")}
                  className="w-full px-4 py-3 sm:py-3.5 bg-[var(--auth-surface)] border border-[var(--auth-border)] rounded-[14px] text-white text-[0.9rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all appearance-none"
                >
                  <option value="" className="bg-navy">Select ID type</option>
                  <option value="NATIONAL_ID" className="bg-navy">National ID</option>
                  <option value="PASSPORT" className="bg-navy">Passport</option>
                  <option value="DRIVERS_LICENCE" className="bg-navy">Driver's Licence</option>
                </select>
                {errors.idType && <p className="text-[0.74rem] text-coral">{errors.idType.message}</p>}
              </div>

              <InputField label="ID number" name="idNumber" placeholder="NGA-1234567" register={register} error={errors.idNumber?.message} />

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { id: "front", label: "Front of ID" },
                  { id: "back", label: "Back of ID" },
                ].map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleUpload(u.id)}
                    className={`flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed p-3 sm:p-4 text-center transition-all cursor-pointer ${
                      uploads[u.id] ? "border-teal/50 bg-teal/5" : "border-[var(--auth-border)] bg-[var(--auth-surface)] hover:border-white/20 hover:bg-white/[0.08]"
                    }`}
                  >
                    {uploads[u.id] ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-teal/20 text-teal text-xs">✓</div>
                        <span className="text-[0.6rem] sm:text-[0.65rem] text-[var(--auth-text-muted)] truncate w-full">{uploads[u.id]}</span>
                      </div>
                    ) : (
                      <>
                        <div className="mb-1 sm:mb-2 text-white/30">
                          <svg viewBox="0 0 24 24" width="20" height="20" className="sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                        </div>
                        <span className="text-[0.65rem] sm:text-[0.7rem] text-[var(--auth-text-muted)] leading-tight">Tap to upload<br />{u.label}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div
                onClick={() => handleUpload("selfie")}
                className={`flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed p-4 sm:p-6 text-center transition-all cursor-pointer ${
                  uploads.selfie ? "border-teal/50 bg-teal/5" : "border-[var(--auth-border)] bg-[var(--auth-surface)] hover:border-white/20 hover:bg-white/[0.08]"
                }`}
              >
                {uploads.selfie ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-teal/20 text-teal">✓</div>
                    <div className="text-left">
                      <p className="text-[0.75rem] sm:text-[0.8rem] text-white font-medium">Selfie uploaded</p>
                      <p className="text-[0.6rem] sm:text-[0.65rem] text-white/40">{uploads.selfie}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-1 sm:mb-2 text-white/30">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <p className="text-[0.78rem] sm:text-[0.82rem] text-[var(--auth-text-muted)]">Take or upload a selfie</p>
                    <p className="mt-0.5 text-[0.65rem] sm:text-[0.72rem] text-white/20 uppercase tracking-wider font-medium">Must clearly show your face</p>
                  </>
                )}
              </div>

              <Button type="submit" variant="primary" fullWidth loading={isSubmitting} className="mt-4 sm:mt-6">
                Submit for verification
              </Button>
            </form>
          </motion.div>
        )}

        {step === "SUBMITTED" && (
          <motion.div key="submitted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="mx-auto mb-4 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-teal/20 text-teal">
              <svg viewBox="0 0 24 24" width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-white">Verification submitted</h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-[300px] font-body text-[0.85rem] sm:text-[0.9rem] leading-relaxed text-[var(--auth-text-muted)]">
              Being reviewed. Parent notified once verified — usually within a few hours.
            </p>

            <div className="mt-6 sm:mt-10 flex gap-3 sm:gap-4 rounded-[14px] bg-[var(--auth-surface)] p-3 sm:p-4 text-left">
              <div className="flex-shrink-0 text-teal mt-0.5">
                <svg viewBox="0 0 24 24" width="18" height="18" className="sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="font-body text-[0.8rem] sm:text-[0.85rem] leading-relaxed text-white/60">
                You'll receive an SMS when the parent approves.
              </p>
            </div>
            
            <Button variant="ghost" fullWidth className="mt-6 sm:mt-8 text-[var(--auth-text-muted)]" onClick={() => router.push("/")}>
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function DelegateKycPage() {
  return (
    <AuthCard>
      <Suspense
        fallback={
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--auth-border)] border-t-teal" />
            <p className="font-body text-[0.9rem] text-[var(--auth-text-muted)]">Loading...</p>
          </div>
        }
      >
        <DelegateKycContent />
      </Suspense>
    </AuthCard>
  );
}
