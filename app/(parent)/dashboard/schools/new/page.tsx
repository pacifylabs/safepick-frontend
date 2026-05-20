"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, AlertCircle } from "lucide-react";
import { CreateSchoolRequestSchema, CreateSchoolRequest } from "@/types/schools.types";
import { useCreateSchool } from "@/hooks/useSchoolsManagement";
import { useToastStore } from "@/stores/toast.store";
import { Button } from "@/components/ui/Button";

export default function NewSchoolPage() {
  const router = useRouter();
  const { mutate: createSchool, isPending } = useCreateSchool();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSchoolRequest>({
    resolver: zodResolver(CreateSchoolRequestSchema),
  });

  const onSubmit = (data: CreateSchoolRequest) => {
    createSchool(data, {
      onSuccess: () => {
        addToast({ message: "School created successfully", variant: "success" });
        router.push("/dashboard/schools");
      },
      onError: (err) => {
        addToast({ message: err.message || "Failed to create school", variant: "danger" });
      },
    });
  };

  return (
    <div className="p-6 max-w-[640px] font-body">
      <div className="flex items-center gap-2 text-[0.875rem] mb-6">
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard/schools")}>Schools</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-primary)] font-medium">New</span>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-8">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">NEW SCHOOL</p>
        <h2 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-1">Add a school</h2>
        <p className="text-[0.875rem] text-[var(--text-secondary)] mb-8">Register a new school in the system.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">School Name</label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g. Greenfield International School"
              className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] ${
                errors.name ? "border-coral" : "border-[var(--border)]"
              }`}
            />
            {errors.name && (
              <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Address</label>
            <input
              {...register("address")}
              type="text"
              placeholder="e.g. 123 Education Avenue"
              className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] ${
                errors.address ? "border-coral" : "border-[var(--border)]"
              }`}
            />
            {errors.address && (
              <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Phone Number</label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+234 801 234 5678"
                className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] ${
                  errors.phone ? "border-coral" : "border-[var(--border)]"
                }`}
              />
              {errors.phone && (
                <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="school@example.com"
                className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] ${
                  errors.email ? "border-coral" : "border-[var(--border)]"
                }`}
              />
              {errors.email && (
                <p className="text-[0.7rem] text-coral flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/schools")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              Create School
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
