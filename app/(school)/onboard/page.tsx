"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building,
  CheckCircle,
  XCircle,
  ShieldAlert,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";
import {
  SchoolOnboardPayload,
  SchoolOnboardPayloadSchema,
  School,
} from "@/types/schools.types";
import { schoolsService } from "@/services/schools.service";
import { Button } from "@/components/ui/Button";

type OnboardState = "VALIDATING" | "INVALID_TOKEN" | "SETUP" | "VERIFY_CONTACT" | "KYC" | "COMPLETE";

export default function SchoolOnboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<OnboardState>("VALIDATING");
  const [schoolData, setSchoolData] = useState<School | null>(null);
  const [otpToken, setOtpToken] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [kycData, setKycData] = useState({
    documentType: "SCHOOL_REGISTRATION",
    documentNumber: "",
    documentUrl: "https://example.com/doc.pdf", // Mock URL
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<SchoolOnboardPayload>({
    resolver: zodResolver(SchoolOnboardPayloadSchema),
    defaultValues: {
      inviteToken: token || "",
    },
  });

  useEffect(() => {
    if (!token) {
      setState("INVALID_TOKEN");
      return;
    }

    schoolsService
      .validateOnboardToken(token)
      .then((res) => {
        if (res.valid && res.school) {
          setSchoolData(res.school);
          setState("SETUP");
        } else {
          setState("INVALID_TOKEN");
        }
      })
      .catch(() => {
        setState("INVALID_TOKEN");
      });
  }, [token]);

  const onSetupSubmit = async (data: SchoolOnboardPayload) => {
    try {
      setError(null);
      const res = await schoolsService.submitSchoolOnboard(data);
      setOtpToken(res.otpToken);
      setState("VERIFY_CONTACT");
    } catch (err: any) {
      setError(err.message || "Failed to initiate setup. Please try again.");
    }
  };

  const onVerifyOTP = async () => {
    try {
      setError(null);
      await schoolsService.verifyOnboardOTP({ token: otpToken, otp });
      setState("KYC");
    } catch (err: any) {
      setError("Invalid OTP. Please try 123456 for testing.");
    }
  };

  const onKYCSubmit = async () => {
    if (!kycData.documentNumber) {
      setError("Please enter the document number");
      return;
    }
    try {
      setError(null);
      await schoolsService.submitSchoolKYC({
        token: otpToken,
        ...kycData,
      });
      setState("COMPLETE");
    } catch (err: any) {
      setError("Failed to submit KYC. Please try again.");
    }
  };

  const step = state === "SETUP" ? 1 : state === "VERIFY_CONTACT" ? 2 : state === "KYC" ? 3 : 4;

  return (
    <div className="min-h-screen bg-[#EFEFED] flex items-center justify-center px-4 py-12 font-body">
      <AnimatePresence mode="wait">
        {state === "VALIDATING" && (
          <motion.div
            key="validating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl p-8 border border-black/[0.06] shadow-sm max-w-[420px] w-full text-center"
          >
            <div className="w-10 h-10 border-2 border-[#F2F0EB] border-t-[#0FA37F] animate-spin mx-auto mb-4 rounded-full" />
            <p className="text-[#6B7280]">Verifying your invitation...</p>
          </motion.div>
        )}

        {state === "INVALID_TOKEN" && (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 border border-black/[0.06] shadow-sm max-w-[420px] w-full text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#FAECE7] flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-[#D85A30]" />
            </div>
            <h2 className="text-[1.1rem] font-semibold text-[#0B1A2C] mb-2">
              Invitation expired
            </h2>
            <p className="text-[#6B7280] text-[0.875rem] leading-relaxed mb-6">
              This onboarding link is no longer valid. Contact support@safepick.io
              if you need a new one.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => (window.location.href = "/")}
            >
              Back to Home
            </Button>
          </motion.div>
        )}

        {(state === "SETUP" || state === "VERIFY_CONTACT" || state === "KYC") && schoolData && (
          <motion.div
            key="onboarding-steps"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-8 border border-black/[0.06] shadow-sm max-w-[480px] w-full"
          >
            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-bold ${
                      step === s
                        ? "bg-[#0B1A2C] text-white"
                        : step > s
                        ? "bg-[#0FA37F] text-white"
                        : "bg-[#F2F0EB] text-[#6B7280]"
                    }`}
                  >
                    {step > s ? <CheckCircle className="w-3 h-3" /> : s}
                  </div>
                  {s < 3 && <div className="w-8 h-px bg-[#F2F0EB]" />}
                </div>
              ))}
              <span className="text-[0.75rem] font-medium text-[#6B7280] ml-auto">
                Step {step} of 3
              </span>
            </div>

            {state === "SETUP" && (
              <form onSubmit={handleSubmit(onSetupSubmit)} className="space-y-4">
                <div className="bg-[#E1F5EE] border border-[#0FA37F]/20 rounded-xl p-4 mb-6 flex gap-3 items-center">
                  <Building className="text-[#0FA37F] w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-[#0B1A2C] truncate">{schoolData.name}</p>
                    <p className="text-[0.78rem] text-[#6B7280] truncate">{schoolData.address}</p>
                  </div>
                </div>

                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">ADMIN DETAILS</p>
                <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C] mb-1">Create your account</h2>
                
                {error && (
                  <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-xl p-3 flex gap-2 items-center text-[#D85A30] text-[0.82rem]">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">Full name</label>
                    <input {...register("adminName")} className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] outline-none" placeholder="Mrs. Adeola Bello" />
                    {errors.adminName && <p className="text-coral text-[0.74rem] mt-1">{errors.adminName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">Work email</label>
                    <input {...register("adminEmail")} className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] outline-none" placeholder="admin@greenfield.edu.ng" />
                    {errors.adminEmail && <p className="text-coral text-[0.74rem] mt-1">{errors.adminEmail.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">Phone number</label>
                    <input {...register("adminPhone")} className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] outline-none" placeholder="+234 801 234 5678" />
                    {errors.adminPhone && <p className="text-coral text-[0.74rem] mt-1">{errors.adminPhone.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">Password</label>
                    <input {...register("password")} type="password" className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] outline-none" placeholder="••••••••" />
                    {errors.password && <p className="text-coral text-[0.74rem] mt-1">{errors.password.message}</p>}
                  </div>
                </div>

                <Button type="submit" variant="primary" fullWidth className="h-12 rounded-xl mt-6" loading={isSubmitting}>
                  Next: Verify contact
                </Button>
              </form>
            )}

            {state === "VERIFY_CONTACT" && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  onVerifyOTP();
                }} 
                className="space-y-6"
              >
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">VERIFICATION</p>
                  <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C] mb-1">Verify your email</h2>
                  <p className="text-[#6B7280] text-[0.875rem]">We've sent a 6-digit code to <span className="text-[#0B1A2C] font-medium">{getValues("adminEmail")}</span></p>
                </div>

                {error && (
                  <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-xl p-3 flex gap-2 items-center text-[#D85A30] text-[0.82rem]">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="000000"
                    className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-4 text-center text-[1.5rem] font-bold tracking-[0.5em] outline-none focus:border-[#0FA37F]"
                    autoFocus
                  />
                  <p className="text-center text-[0.78rem] text-[#6B7280]">Didn't receive it? <button type="button" className="text-[#0FA37F] font-semibold">Resend code</button></p>
                </div>

                <Button type="submit" variant="primary" fullWidth className="h-12 rounded-xl" disabled={otp.length !== 6}>
                  Verify and continue
                </Button>
              </form>
            )}

            {state === "KYC" && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  onKYCSubmit();
                }} 
                className="space-y-6"
              >
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">AUTHENTICITY</p>
                  <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C] mb-1">Verify your school</h2>
                  <p className="text-[#6B7280] text-[0.875rem]">Upload a valid document to verify that you are an official representative of {schoolData.name}.</p>
                </div>

                {error && (
                  <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-xl p-3 flex gap-2 items-center text-[#D85A30] text-[0.82rem]">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">Document type</label>
                    <select 
                      className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] outline-none"
                      value={kycData.documentType}
                      onChange={(e) => setKycData({...kycData, documentType: e.target.value})}
                    >
                      <option value="SCHOOL_REGISTRATION">School Registration Certificate</option>
                      <option value="GOVERNMENT_ID">Admin's Government ID</option>
                      <option value="LICENSE">Operating License</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">Document number</label>
                    <input 
                      className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] outline-none" 
                      placeholder="e.g. SRC-12345678"
                      value={kycData.documentNumber}
                      onChange={(e) => setKycData({...kycData, documentNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div className="border-2 border-dashed border-black/[0.06] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-[#0FA37F]/40 transition-colors cursor-pointer bg-[#F9F9F8]">
                    <Upload className="w-8 h-8 text-[#6B7280] mb-2" />
                    <p className="text-[0.875rem] font-medium text-[#0B1A2C]">Click to upload document</p>
                    <p className="text-[0.72rem] text-[#6B7280] mt-1">PDF, JPG, or PNG (Max. 5MB)</p>
                  </div>
                </div>

                <Button type="submit" variant="primary" fullWidth className="h-12 rounded-xl">
                  Submit for review
                </Button>
              </form>
            )}
          </motion.div>
        )}

        {state === "COMPLETE" && schoolData && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 border border-black/[0.06] shadow-sm max-w-[480px] w-full text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#0FA37F]" />
            </div>
            <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C] mb-2">
              Verification pending
            </h2>
            <p className="text-[#6B7280] text-[0.875rem] leading-relaxed mb-6">
              We've received your documents for <span className="text-[#0B1A2C] font-semibold">{schoolData.name}</span>. 
              Our team will review your application within 24 hours. You'll receive an email once your school is live.
            </p>
            <div className="bg-[#F9F9F8] rounded-xl p-4 mb-8 flex items-center gap-3 text-left">
              <FileText className="w-5 h-5 text-[#0FA37F]" />
              <div>
                <p className="text-[0.82rem] font-medium text-[#0B1A2C]">Reference ID: SP-SCH-{(Math.random()*1000000).toFixed(0)}</p>
                <p className="text-[0.72rem] text-[#6B7280]">Application submitted today</p>
              </div>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push("/")}
            >
              Finish and exit
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
