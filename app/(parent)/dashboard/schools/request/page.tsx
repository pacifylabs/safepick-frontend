"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";
import {
  RequestSchoolRequestSchema,
  RequestSchoolPayload,
} from "@/types/school-requests.types";
import { useSubmitSchoolRequest } from "@/hooks/useSchoolRequests";
import { useToastStore } from "@/stores/toast.store";
import { Button } from "@/components/ui/Button";
import { useSchoolSearch } from "@/hooks/useSchoolsManagement";
import { useState } from "react";

export default function RequestSchoolPage() {
  const router = useRouter();
  const { mutate: submitRequest, isPending } = useSubmitSchoolRequest();
  const { addToast } = useToastStore();

  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const { data: existingSchools = [] } = useSchoolSearch(
    schoolSearchQuery.trim().length >= 2 ? schoolSearchQuery : ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RequestSchoolPayload>({
    resolver: zodResolver(RequestSchoolRequestSchema),
  });

  const onSubmit = (data: RequestSchoolPayload) => {
    const payload: RequestSchoolPayload = {
      schoolName: data.schoolName,
      schoolAddress: data.schoolAddress,
      schoolPhone: data.schoolPhone || undefined,
      schoolEmail: data.schoolEmail || undefined,
      notes: data.notes || undefined,
    };
    submitRequest(payload, {
      onSuccess: (res) => {
        addToast({ message: res.message, variant: "success" });
        router.push("/dashboard/schools/requests");
      },
      onError: (err: any) => {
        const code = err.data?.error;
        if (code === "SCHOOL_ALREADY_EXISTS") {
          addToast({
            message: "This school is already registered. Search and link your child instead.",
            variant: "warning",
          });
          router.push("/dashboard/schools");
        } else if (code === "DUPLICATE_REQUEST") {
          addToast({
            message: "You already have a pending request for this school.",
            variant: "warning",
          });
          router.push("/dashboard/schools/requests");
        } else if (code === "MAX_PENDING_REQUESTS") {
          addToast({
            message: "You can only have 3 pending requests. Cancel one to submit a new one.",
            variant: "danger",
          });
        } else {
          addToast({
            message: err.message || "Failed to submit request. Please try again.",
            variant: "danger",
          });
        }
      },
    });
  };

  const showExistingWarning = schoolSearchQuery.trim().length >= 2 && existingSchools.length > 0;

  return (
    <div className="p-6 max-w-[640px] font-body">
      <div className="flex items-center gap-2 text-[0.875rem] mb-6">
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard/schools")}>Schools</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-primary)] font-medium">Request School</span>
      </div>

      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[0.875rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-8">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">REQUEST SCHOOL</p>
        <h2 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-1">Request a School</h2>
        <p className="text-[0.875rem] text-[var(--text-secondary)] mb-2">
          Can&apos;t find your school? Submit a request and an admin will review it.
        </p>

        {showExistingWarning && (
          <div className="bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-xl p-4 mb-6 text-[0.875rem] text-[#BA7517] space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">School may already be registered</p>
                <p className="mt-1 text-[0.8rem]">
                  We found {existingSchools.length} school{existingSchools.length > 1 ? "s" : ""} matching &quot;{schoolSearchQuery}&quot;. Try linking your child to an existing school instead.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {existingSchools.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  onClick={() => router.push(`/dashboard/schools/${s.id}`)}
                  className="flex items-center justify-between w-full bg-white/60 rounded-xl px-4 py-2.5 text-left hover:bg-white/90 transition-colors"
                >
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
                    <p className="text-[0.75rem] text-[var(--text-secondary)]">{s.address}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 text-[var(--text-secondary)]" />
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">School Name *</label>
            <input
              {...register("schoolName")}
              type="text"
              placeholder="e.g. Greenfield International School"
              onChange={(e) => {
                setValue("schoolName", e.target.value);
                setSchoolSearchQuery(e.target.value);
              }}
              className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] ${
                errors.schoolName ? "border-coral" : "border-[var(--border)]"
              }`}
            />
            {errors.schoolName && (
              <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.schoolName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">School Address *</label>
            <input
              {...register("schoolAddress")}
              type="text"
              placeholder="e.g. 123 Education Avenue"
              className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] ${
                errors.schoolAddress ? "border-coral" : "border-[var(--border)]"
              }`}
            />
            {errors.schoolAddress && (
              <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.schoolAddress.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Phone Number</label>
              <input
                {...register("schoolPhone")}
                type="tel"
                placeholder="+234 801 234 5678"
                className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] ${
                  errors.schoolPhone ? "border-coral" : "border-[var(--border)]"
                }`}
              />
              {errors.schoolPhone && (
                <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.schoolPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Email</label>
              <input
                {...register("schoolEmail")}
                type="email"
                placeholder="school@example.com"
                className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] ${
                  errors.schoolEmail ? "border-coral" : "border-[var(--border)]"
                }`}
              />
              {errors.schoolEmail && (
                <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.schoolEmail.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Notes</label>
            <textarea
              {...register("notes")}
              placeholder="Any additional information about the school..."
              rows={3}
              className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] resize-none ${
                errors.notes ? "border-coral" : "border-[var(--border)]"
              }`}
            />
            {errors.notes && (
              <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/schools")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
