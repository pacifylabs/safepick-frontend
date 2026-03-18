"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Pencil,
  Info,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Baby,
  Building,
} from "lucide-react";
import {
  RegisterChildPayload,
  RegisterChildPayloadSchema,
} from "@/types/children.types";
import { useRegisterChild, useGuardianLookup } from "@/hooks/useChildren";
import { useChildrenStore } from "@/stores/children.store";
import { Button } from "@/components/ui/Button";

type Step = "DETAILS" | "GUARDIAN" | "REVIEW";

export default function NewChildPage() {
  const router = useRouter();
  const { registrationStep, setRegistrationStep, registrationDraft, updateDraft, clearDraft } = useChildrenStore();
  const [guardianPhone, setGuardianPhone] = useState(registrationDraft.guardianPhone || "");

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    setValue,
    setError,
  } = useForm<RegisterChildPayload>({
    resolver: zodResolver(RegisterChildPayloadSchema),
    defaultValues: {
      fullName: registrationDraft.fullName || "",
      dateOfBirth: registrationDraft.dateOfBirth || "",
      grade: registrationDraft.grade || "",
      secondaryGuardian: { phone: registrationDraft.guardianPhone || "" },
    },
  });

  const { mutate: registerChild, isPending } = useRegisterChild();
  const { data: guardianLookup } = useGuardianLookup(guardianPhone);

  const onSubmit = (data: RegisterChildPayload) => {
    registerChild(data, {
      onSuccess: (newChild) => {
        clearDraft();
        router.push(`/dashboard/children/${newChild.id}/school`);
      },
      onError: (err: any) => {
        if (err.data?.error === "SECONDARY_GUARDIAN_NOT_FOUND") {
          setError("secondaryGuardian.phone", { message: "Guardian not found. Please check the phone number." });
          setRegistrationStep("GUARDIAN");
        } else if (err.data?.error === "SECONDARY_GUARDIAN_CONFLICT") {
          setError("secondaryGuardian.phone", { message: "You cannot be the secondary guardian for your own child." });
          setRegistrationStep("GUARDIAN");
        }
      }
    });
  };

  const nextStep = async () => {
    const formData = watch();
    if (registrationStep === "DETAILS") {
      const isValid = await trigger(["fullName", "dateOfBirth", "grade"]);
      if (isValid) {
        updateDraft({
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          grade: formData.grade,
        });
        setRegistrationStep("GUARDIAN");
      }
    } else if (registrationStep === "GUARDIAN") {
      const isValid = await trigger(["secondaryGuardian.phone"]);
      if (isValid) {
        updateDraft({
          guardianPhone: formData.secondaryGuardian.phone,
          guardianName: guardianLookup?.user?.fullName,
        });
        setRegistrationStep("REVIEW");
      }
    }
  };

  const prevStep = () => {
    const formData = watch();
    updateDraft({
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      grade: formData.grade,
      guardianPhone: formData.secondaryGuardian.phone,
    });
    if (registrationStep === "GUARDIAN") setRegistrationStep("DETAILS");
    else if (registrationStep === "REVIEW") setRegistrationStep("GUARDIAN");
  };

  const formData = watch();

  return (
    <div className="max-w-[560px] mx-auto px-6 py-6 font-body">
      {/* STEP PROGRESS BAR */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { id: "DETAILS", label: "Child details" },
          { id: "GUARDIAN", label: "Guardian" },
          { id: "REVIEW", label: "Review" },
        ].map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-bold ${
                  registrationStep === s.id
                    ? "bg-[#0B1A2C] text-white"
                    : idx < ["DETAILS", "GUARDIAN", "REVIEW"].indexOf(registrationStep)
                    ? "bg-[#0FA37F] text-white"
                    : "bg-[var(--bg-page)] text-[var(--text-secondary)]"
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-[0.75rem] font-medium ${
                  registrationStep === s.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < 2 && <div className="flex-1 h-px bg-[var(--bg-page)]" />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
        <AnimatePresence mode="wait">
          {registrationStep === "DETAILS" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  nextStep();
                }} 
                className="space-y-6"
              >
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">
                    CHILD INFORMATION
                  </p>
                  <h2 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-1">
                    Tell us about your child
                  </h2>
                  <p className="text-[0.875rem] text-[var(--text-secondary)]">
                    This information helps schools verify your child's identity.
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-[var(--bg-page)] border-2 border-dashed border-[var(--text-primary)]/15 flex items-center justify-center group-hover:border-[#0FA37F] group-hover:bg-[#E1F5EE] transition-all cursor-pointer">
                      <Camera className="w-7 h-7 text-[var(--text-secondary)]" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0FA37F] flex items-center justify-center border-2 border-[var(--bg-surface)]">
                      <Pencil className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <p className="text-[0.72rem] text-[var(--text-secondary)] mt-2">
                    Tap to add photo (optional)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">
                      Child's full name
                    </label>
                    <input
                      {...register("fullName")}
                      placeholder="Zara Osei"
                      className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-[0.875rem] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-[var(--bg-surface)] outline-none transition-all"
                    />
                    {errors.fullName && (
                      <p className="text-coral text-[0.74rem] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">
                      Date of birth
                    </label>
                    <input
                      {...register("dateOfBirth")}
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-[0.875rem] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-[var(--bg-surface)] outline-none transition-all"
                    />
                    {errors.dateOfBirth && (
                      <p className="text-coral text-[0.74rem] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">
                      Grade
                    </label>
                    <select
                      {...register("grade")}
                      className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-[0.875rem] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-[var(--bg-surface)] outline-none transition-all appearance-none"
                    >
                      <option value="">Select a grade</option>
                      {[
                        "Nursery 1",
                        "Nursery 2",
                        "KG 1",
                        "KG 2",
                        "Primary 1",
                        "Primary 2",
                        "Primary 3",
                        "Primary 4",
                        "Primary 5",
                        "Primary 6",
                        "JSS 1",
                        "JSS 2",
                        "JSS 3",
                        "SSS 1",
                        "SSS 2",
                        "SSS 3",
                      ].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    {errors.grade && (
                      <p className="text-coral text-[0.74rem] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.grade.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full h-12 rounded-xl mt-4">
                  Continue
                </Button>
              </form>
            </motion.div>
          )}

          {registrationStep === "GUARDIAN" && (
            <motion.div
              key="guardian"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  nextStep();
                }} 
                className="space-y-6"
              >
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">
                    SECONDARY GUARDIAN
                  </p>
                  <h2 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-1">
                    Who's your backup?
                  </h2>
                  <p className="text-[0.875rem] text-[var(--text-secondary)]">
                    This person will be able to manage pickups for your child.
                  </p>
                </div>

                <div className="bg-[#E1F5EE] border border-[#0FA37F]/20 rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-[#0FA37F] flex-shrink-0" />
                  <p className="text-[0.78rem] text-[#0F6E56] leading-relaxed">
                    This person must have a verified SafePick account. They'll receive an SMS to confirm their role.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">
                    Guardian's phone number
                  </label>
                  <input
                    {...register("secondaryGuardian.phone")}
                    onChange={(e) => {
                      register("secondaryGuardian.phone").onChange(e);
                      if (e.target.value.length >= 7) setGuardianPhone(e.target.value);
                    }}
                    placeholder="+233 XX XXX XXXX"
                    className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-[0.875rem] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-[var(--bg-surface)] outline-none transition-all"
                  />
                  {errors.secondaryGuardian?.phone && (
                    <p className="text-coral text-[0.74rem] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.secondaryGuardian.phone.message}
                    </p>
                  )}

                  {guardianLookup && (
                    <div className={`mt-3 p-3 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                      guardianLookup.found ? "bg-[#E1F5EE] border-[#0FA37F]/20" : "bg-[#FAECE7] border-[#D85A30]/20"
                    }`}>
                      {guardianLookup.found ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-[#0FA37F] flex items-center justify-center text-white text-[0.65rem] font-bold">
                            {guardianLookup.user?.fullName.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div className="flex-1">
                            <p className="text-[0.82rem] font-medium text-[var(--text-primary)]">{guardianLookup.user?.fullName}</p>
                            <p className="text-[0.72rem] text-[var(--text-secondary)]">SafePick member</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-[#0FA37F]" />
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-[#D85A30]" />
                          <div className="flex-1">
                            <p className="text-[0.82rem] font-medium text-[var(--text-primary)]">No account found</p>
                            <button type="button" className="text-[0.72rem] text-[#D85A30] font-semibold underline">Send invite link</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit" variant="primary" className="flex-[2] h-12 rounded-xl" disabled={!guardianLookup?.found}>
                    Continue
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {registrationStep === "REVIEW" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">
                  REVIEW
                </p>
                <h2 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-1">
                  Confirm registration
                </h2>
              </div>

              <div className="divide-y divide-[var(--bg-page)]">
                {[
                  { label: "Child's name", value: formData.fullName, step: "DETAILS" },
                  { label: "Date of birth", value: formData.dateOfBirth, step: "DETAILS" },
                  { label: "Grade", value: formData.grade, step: "DETAILS" },
                  { label: "Secondary Guardian", value: guardianLookup?.user?.fullName, step: "GUARDIAN" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-4">
                    <div>
                      <p className="text-[0.72rem] text-[var(--text-secondary)] mb-0.5">{row.label}</p>
                      <p className="text-[0.875rem] font-medium text-[var(--text-primary)]">{row.value}</p>
                    </div>
                    <button
                      onClick={() => setRegistrationStep(row.step as Step)}
                      className="text-[0.75rem] font-semibold text-[#4F46E5] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-[var(--bg-surface-2)] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[0.78rem] text-[var(--text-secondary)]">SafePick ID will be assigned:</p>
                  <p className="text-[1rem] font-bold text-[var(--text-primary)]">SP-2026-XXXXX</p>
                </div>
                <Baby className="w-8 h-8 text-[var(--text-primary)]/10" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={prevStep} disabled={isPending}>
                  Back
                </Button>
                <Button variant="primary" className="flex-[2] h-12 rounded-xl" onClick={handleSubmit(onSubmit)} loading={isPending}>
                  Register child
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
