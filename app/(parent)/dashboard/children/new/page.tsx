"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Pencil,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  RegisterChildPayload,
  RegisterChildPayloadSchema,
} from "@/types/children.types";
import { useRegisterChild } from "@/hooks/useChildren";
import { useChildrenStore } from "@/stores/children.store";
import { Button } from "@/components/ui/Button";


export default function NewChildPage() {
  const router = useRouter();
  const { registrationStep, setRegistrationStep, registrationDraft, updateDraft, clearDraft } = useChildrenStore();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterChildPayload>({
    resolver: zodResolver(RegisterChildPayloadSchema),
    defaultValues: {
      fullName: registrationDraft.fullName || "",
      dateOfBirth: registrationDraft.dateOfBirth || "",
      grade: registrationDraft.grade || "",
    },
  });

  const { mutate: registerChild, isPending } = useRegisterChild();

  const onSubmit = (data: RegisterChildPayload) => {
    registerChild(data, {
      onSuccess: (newChild) => {
        clearDraft();
        router.push(`/dashboard/children/${newChild.id}/school`);
      },
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
    });
    if (registrationStep === "REVIEW") setRegistrationStep("DETAILS");
  };

  const formData = watch();

  return (
    <div className="max-w-[560px] mx-auto px-6 py-6 font-body">
      {/* STEP PROGRESS BAR */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { id: "DETAILS", label: "Child details" },
          { id: "REVIEW", label: "Review" },
        ].map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-bold ${
                  registrationStep === s.id
                    ? "bg-[#0B1A2C] text-white"
                    : idx < ["DETAILS", "REVIEW"].indexOf(registrationStep)
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
            {idx < 1 && <div className="flex-1 h-px bg-[var(--bg-page)]" />}
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

          {registrationStep === "REVIEW" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-[480px] mx-auto w-full"
            >
              <div className="mb-6">
                <p className="font-sans text-[0.72rem] uppercase tracking-widest text-[#0FA37F] mb-1">
                  STEP 2 OF 2
                </p>
                <h2 className="font-serif text-[1.75rem] font-semibold text-[var(--text-primary)] leading-tight">
                  Confirm child details
                </h2>
                <p className="font-sans text-[0.875rem] text-[var(--text-secondary)] mt-1">
                  Review before registering.
                </p>
              </div>

              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <div>
                    <p className="font-sans text-[0.72rem] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">
                      CHILD&apos;S NAME
                    </p>
                    <p className="font-sans text-[0.9375rem] font-medium text-[var(--text-primary)]">
                      {formData.fullName}
                    </p>
                  </div>
                  <button
                    onClick={() => setRegistrationStep("DETAILS")}
                    className="font-sans text-[0.78rem] font-medium text-[#0FA37F] hover:text-[#1D9E75] transition-all duration-200"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <div>
                    <p className="font-sans text-[0.72rem] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">
                      DATE OF BIRTH
                    </p>
                    <p className="font-sans text-[0.9375rem] font-medium text-[var(--text-primary)]">
                      {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setRegistrationStep("DETAILS")}
                    className="font-sans text-[0.78rem] font-medium text-[#0FA37F] hover:text-[#1D9E75] transition-all duration-200"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-sans text-[0.72rem] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">
                      GRADE
                    </p>
                    <p className="font-sans text-[0.9375rem] font-medium text-[var(--text-primary)]">
                      {formData.grade}
                    </p>
                  </div>
                  <button
                    onClick={() => setRegistrationStep("DETAILS")}
                    className="font-sans text-[0.78rem] font-medium text-[#0FA37F] hover:text-[#1D9E75] transition-all duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="bg-[var(--bg-muted)] rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-sans text-[0.68rem] text-[var(--text-muted)] uppercase tracking-wide mb-1">
                    SAFEPICK ID — assigned on registration
                  </p>
                  <p className="font-serif text-[1.125rem] font-semibold text-[var(--text-primary)] tracking-widest">
                    SP-2026-XXXXX
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#0FA37F]" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-full py-3.5 text-center font-sans text-[0.9375rem] font-medium hover:bg-[var(--border)] transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isPending}
                  className="flex-[2] bg-[#0B1A2C] text-white rounded-full py-3.5 font-sans text-[0.9375rem] font-medium text-center hover:bg-[#0FA37F] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    "Register child"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
