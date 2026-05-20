"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useSubmitKyc } from "@/hooks/useDelegateKyc";
import { SubmitKycRequestSchema, SubmitKycRequest, IdType } from "@/types/delegateKyc.types";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Copy,
  ArrowLeft,
} from "lucide-react";

type Step = "TOKEN" | "INFO" | "IDENTITY" | "DOCUMENTS" | "CONSENT" | "SUBMITTED";

const steps = [
  { key: "TOKEN", label: "Token" },
  { key: "INFO", label: "Info" },
  { key: "IDENTITY", label: "ID" },
  { key: "DOCUMENTS", label: "Docs" },
  { key: "CONSENT", label: "Consent" },
] as const;

export default function DelegateKycSubmitPage() {
  const router = useRouter();
  const { mutate: submitKyc, isPending: submitting } = useSubmitKyc();
  const [step, setStep] = useState<Step>("TOKEN");
  const [inviteToken, setInviteToken] = useState("");
  const [tokenError, setTokenError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SubmitKycRequest>({
    resolver: zodResolver(SubmitKycRequestSchema),
    defaultValues: {
      inviteToken: "",
      fullName: "",
      email: "",
      relationship: "",
      idType: undefined,
      idNumber: "",
      idDocumentUrl: "",
      selfieUrl: "",
      address: "",
      consentAccepted: false as unknown as true,
    },
  });

  const onTokenSubmit = () => {
    if (!inviteToken.trim()) {
      setTokenError("Enter your invite token");
      return;
    }
    setValue("inviteToken", inviteToken.trim());
    setTokenError("");
    setStep("INFO");
  };

  const onInfoSubmit = () => {
    const name = watch("fullName");
    if (!name || name.length < 2) return;
    setStep("IDENTITY");
  };

  const onIdentitySubmit = () => {
    const idType = watch("idType");
    const idNumber = watch("idNumber");
    if (!idType || !idNumber || idNumber.length < 4) return;
    setStep("DOCUMENTS");
  };

  const onDocsSubmit = () => {
    const docUrl = watch("idDocumentUrl");
    const selfieUrl = watch("selfieUrl");
    if (!docUrl || !selfieUrl) return;
    setStep("CONSENT");
  };

  const onSubmit = (data: SubmitKycRequest) => {
    submitKyc(data, {
      onSuccess: () => {
        setStep("SUBMITTED");
      },
      onError: (err) => {
        setTokenError(err.message || "Submission failed. Please try again.");
      },
    });
  };

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <main className="min-h-screen bg-[#0B1A2C] flex flex-col overflow-x-hidden relative">
      <nav className="absolute top-0 left-0 right-0 z-50 w-full px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <Logo variant="light" size="sm" />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-[480px] mx-auto">
          <AuthCard className="w-full">
            {step !== "SUBMITTED" && (
              <div className="mb-8 flex items-center justify-between gap-2 px-2">
                {steps.map((s, i) => (
                  <div key={s.key} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.6rem] font-semibold transition-colors ${
                          i <= currentStepIndex ? "bg-teal text-white" : "border border-white/20 text-white/40"
                        }`}
                      >
                        {i < currentStepIndex ? "✓" : i + 1}
                      </div>
                      <span
                        className={`text-[0.55rem] uppercase tracking-wider ${
                          i <= currentStepIndex ? "text-white" : "text-white/40"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="mx-1 mb-4 h-[1px] flex-1 bg-white/10">
                        <div
                          className="h-full bg-teal/50 transition-all duration-500"
                          style={{ width: i < currentStepIndex ? "100%" : "0%" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "TOKEN" && (
                <motion.div
                  key="token"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal">
                    STEP 1 OF 5
                  </span>
                  <h1 className="mt-2 font-display text-2xl font-semibold text-white">
                    Enter your <i className="text-teal not-italic">invite token</i>
                  </h1>
                  <p className="mt-2 mb-6 font-body text-[0.85rem] font-light leading-relaxed text-white/50">
                    Paste the token you received from the parent who invited you.
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">Invite Token</label>
                      <input
                        type="text"
                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                        value={inviteToken}
                        onChange={(e) => { setInviteToken(e.target.value); setTokenError(""); }}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all font-mono"
                      />
                      {tokenError && (
                        <p className="text-[0.74rem] text-coral flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {tokenError}
                        </p>
                      )}
                    </div>

                    <Button variant="primary" fullWidth onClick={onTokenSubmit}>
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "INFO" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button onClick={() => setStep("TOKEN")} className="mb-4 text-xs text-white/50 hover:text-white flex items-center gap-1">
                    <ChevronLeft className="w-3 h-3" /> Back
                  </button>
                  <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal">
                    STEP 2 OF 5
                  </span>
                  <h1 className="mt-2 font-display text-2xl font-semibold text-white">
                    Your <i className="text-teal not-italic">information</i>
                  </h1>
                  <p className="mt-2 mb-6 font-body text-[0.85rem] font-light leading-relaxed text-white/50">
                    Tell us about yourself.
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">Full Name</label>
                      <input
                        {...register("fullName")}
                        type="text"
                        placeholder="David Mensah"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all"
                      />
                      {errors.fullName && <p className="text-[0.74rem] text-coral">{errors.fullName.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">Email (optional)</label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="david@example.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all"
                      />
                      {errors.email && <p className="text-[0.74rem] text-coral">{errors.email.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">Relationship (optional)</label>
                      <input
                        {...register("relationship")}
                        type="text"
                        placeholder="e.g. Nanny, Driver, Uncle"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all"
                      />
                    </div>

                    <Button variant="primary" fullWidth onClick={onInfoSubmit}>
                      Continue
                    </Button>
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
                  <button onClick={() => setStep("INFO")} className="mb-4 text-xs text-white/50 hover:text-white flex items-center gap-1">
                    <ChevronLeft className="w-3 h-3" /> Back
                  </button>
                  <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal">
                    STEP 3 OF 5
                  </span>
                  <h1 className="mt-2 font-display text-2xl font-semibold text-white">
                    Your <i className="text-teal not-italic">ID</i>
                  </h1>
                  <p className="mt-2 mb-6 font-body text-[0.85rem] font-light leading-relaxed text-white/50">
                    Select ID type and enter the number.
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">ID Type</label>
                      <select
                        {...register("idType")}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all appearance-none"
                      >
                        <option value="" className="bg-navy">Select ID type</option>
                        <option value="NIN" className="bg-navy">National ID (NIN)</option>
                        <option value="VOTER_CARD" className="bg-navy">Voter Card</option>
                        <option value="PASSPORT" className="bg-navy">Passport</option>
                        <option value="DRIVERS_LICENSE" className="bg-navy">Driver&apos;s License</option>
                      </select>
                      {errors.idType && <p className="text-[0.74rem] text-coral">{errors.idType.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">ID Number</label>
                      <input
                        {...register("idNumber")}
                        type="text"
                        placeholder="NGA-1234567"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all"
                      />
                      {errors.idNumber && <p className="text-[0.74rem] text-coral">{errors.idNumber.message}</p>}
                    </div>

                    <Button variant="primary" fullWidth onClick={onIdentitySubmit}>
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "DOCUMENTS" && (
                <motion.div
                  key="docs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button onClick={() => setStep("IDENTITY")} className="mb-4 text-xs text-white/50 hover:text-white flex items-center gap-1">
                    <ChevronLeft className="w-3 h-3" /> Back
                  </button>
                  <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal">
                    STEP 4 OF 5
                  </span>
                  <h1 className="mt-2 font-display text-2xl font-semibold text-white">
                    Upload <i className="text-teal not-italic">documents</i>
                  </h1>
                  <p className="mt-2 mb-6 font-body text-[0.85rem] font-light leading-relaxed text-white/50">
                    Provide URLs to your ID document and selfie.
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">ID Document URL</label>
                      <input
                        {...register("idDocumentUrl")}
                        type="url"
                        placeholder="https://example.com/my-id.jpg"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all"
                      />
                      {errors.idDocumentUrl && <p className="text-[0.74rem] text-coral">{errors.idDocumentUrl.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">Selfie URL</label>
                      <input
                        {...register("selfieUrl")}
                        type="url"
                        placeholder="https://example.com/selfie.jpg"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all"
                      />
                      {errors.selfieUrl && <p className="text-[0.74rem] text-coral">{errors.selfieUrl.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-[0.75rem] font-medium text-white/85">Your Address</label>
                      <input
                        {...register("address")}
                        type="text"
                        placeholder="123 Main Street, City"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[0.85rem] outline-none focus:border-teal focus:ring-3 focus:ring-teal/25 transition-all"
                      />
                      {errors.address && <p className="text-[0.74rem] text-coral">{errors.address.message}</p>}
                    </div>

                    <Button variant="primary" fullWidth onClick={onDocsSubmit}>
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "CONSENT" && (
                <motion.div
                  key="consent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button onClick={() => setStep("DOCUMENTS")} className="mb-4 text-xs text-white/50 hover:text-white flex items-center gap-1">
                    <ChevronLeft className="w-3 h-3" /> Back
                  </button>
                  <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal">
                    FINAL STEP
                  </span>
                  <h1 className="mt-2 font-display text-2xl font-semibold text-white">
                    Review & <i className="text-teal not-italic">consent</i>
                  </h1>
                  <p className="mt-2 mb-6 font-body text-[0.85rem] font-light leading-relaxed text-white/50">
                    Please confirm your details before submitting.
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 space-y-2 text-[0.8rem]">
                      <p className="flex justify-between"><span className="text-white/50">Name:</span> <span className="text-white font-medium">{watch("fullName")}</span></p>
                      <p className="flex justify-between"><span className="text-white/50">ID Type:</span> <span className="text-white font-medium">{watch("idType")}</span></p>
                      <p className="flex justify-between"><span className="text-white/50">Address:</span> <span className="text-white font-medium">{watch("address")}</span></p>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("consentAccepted")}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 accent-teal"
                      />
                      <span className="text-[0.8rem] text-white/70 leading-relaxed">
                        I consent to the collection and verification of my identity documents for the purpose of child pickup authorization. I understand my data will be encrypted and handled securely.
                      </span>
                    </label>
                    {errors.consentAccepted && (
                      <p className="text-[0.74rem] text-coral flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.consentAccepted.message}
                      </p>
                    )}

                    <Button type="submit" variant="primary" fullWidth loading={submitting}>
                      Submit for Verification
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === "SUBMITTED" && (
                <motion.div
                  key="submitted"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal/20 text-teal">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-white">Verification submitted</h2>
                  <p className="mx-auto mt-3 max-w-[300px] font-body text-[0.9rem] leading-relaxed text-white/50">
                    Your KYC has been submitted for review. The parent will be notified once it&apos;s approved.
                  </p>

                  <div className="mt-6 flex gap-3 rounded-xl bg-white/5 p-4 text-left">
                    <ShieldCheck className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                    <p className="font-body text-[0.8rem] leading-relaxed text-white/60">
                      You can check your KYC status anytime using your invite token.
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    fullWidth
                    className="mt-8 text-white/50"
                    onClick={() => router.push("/delegate/kyc/status")}
                  >
                    Check KYC Status
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </AuthCard>
        </div>
      </div>
    </main>
  );
}
