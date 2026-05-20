"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, AlertCircle } from "lucide-react";
import { UpdateSchoolRequestSchema, UpdateSchoolRequest } from "@/types/schools.types";
import { useSchool, useUpdateSchool } from "@/hooks/useSchoolsManagement";
import { useToastStore } from "@/stores/toast.store";
import { Button } from "@/components/ui/Button";

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: school, isLoading } = useSchool(id);
  const { mutate: updateSchool, isPending } = useUpdateSchool();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSchoolRequest>({
    resolver: zodResolver(UpdateSchoolRequestSchema),
  });

  useEffect(() => {
    if (school) {
      reset({
        name: school.name,
        address: school.address,
        phone: school.phone,
        email: school.email,
      });
    }
  }, [school, reset]);

  const onSubmit = (data: UpdateSchoolRequest) => {
    updateSchool(
      { id, data },
      {
        onSuccess: () => {
          addToast({ message: "School updated successfully", variant: "success" });
          router.push(`/dashboard/schools/${id}`);
        },
        onError: (err) => {
          addToast({ message: err.message || "Failed to update school", variant: "danger" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-[640px]">
        <div className="h-6 w-48 bg-[var(--bg-surface)] animate-pulse rounded mb-6" />
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-8 space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-[var(--bg-surface-2)] animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[640px] font-body">
      <div className="flex items-center gap-2 text-[0.875rem] mb-6">
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard/schools")}>Schools</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push(`/dashboard/schools/${id}`)}>{school?.name}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-primary)] font-medium">Edit</span>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-8">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">EDIT SCHOOL</p>
        <h2 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-1">Edit {school?.name}</h2>
        <p className="text-[0.875rem] text-[var(--text-secondary)] mb-8">Update school information.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">School Name</label>
            <input
              {...register("name")}
              type="text"
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
            <Button variant="ghost" onClick={() => router.push(`/dashboard/schools/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
