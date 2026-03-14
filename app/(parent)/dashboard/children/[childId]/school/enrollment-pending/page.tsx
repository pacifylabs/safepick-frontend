"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useChild } from "@/hooks/useChildren";
import { useEnrollmentStatus } from "@/hooks/useSchools";
import { Button } from "@/components/ui/Button";

export default function EnrollmentPendingPage() {
  const { childId } = useParams();
  const router = useRouter();
  const { data: child } = useChild(childId as string);
  const { data: enrollment } = useEnrollmentStatus(childId as string);

  const steps = [
    {
      title: "Child registered",
      description: `${child?.fullName || "Child"} added to SafePick`,
      status: "COMPLETE",
    },
    {
      title: "School selected",
      description: `${enrollment?.school?.name || "School"} selected as ${child?.fullName?.split(" ")[0]}'s school`,
      status: "COMPLETE",
    },
    {
      title: "Awaiting school verification",
      description: "The school admin needs to verify your child's enrollment. This usually takes 1–2 school days.",
      status: "ACTIVE",
    },
    {
      title: "Enrollment confirmed",
      description: "Attendance tracking and pickup features will activate",
      status: "PENDING",
    },
  ];

  return (
    <div className="max-w-[560px] mx-auto px-6 py-6 font-body">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 mb-6 text-[0.875rem]">
        <span
          className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]"
          onClick={() => router.push("/dashboard")}
        >
          Home
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span
          className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]"
          onClick={() => router.push("/dashboard")}
        >
          My Children
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span
          className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]"
          onClick={() => router.push(`/dashboard/children/${childId}`)}
        >
          {child?.fullName || "Child"}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-[#0B1A2C] font-medium">Enrollment Status</span>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#E1F5EE] flex items-center justify-center">
            <Building className="text-[#0FA37F] w-6 h-6" />
          </div>
          <div>
            <p className="text-[1rem] font-semibold text-[#0B1A2C]">
              {enrollment?.school?.name || "Loading school..."}
            </p>
            <p className="text-[0.78rem] text-[#6B7280] mt-0.5">
              {enrollment?.school?.address}, {enrollment?.school?.city}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-0">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      step.status === "COMPLETE"
                        ? "bg-[#0FA37F]"
                        : step.status === "ACTIVE"
                        ? "bg-[#FAEEDA]"
                        : "bg-[#F2F0EB]"
                    }`}
                  >
                    {step.status === "COMPLETE" ? (
                      <CheckCircle className="text-white w-4 h-4" />
                    ) : step.status === "ACTIVE" ? (
                      <Clock className="text-[#BA7517] w-4 h-4" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                    )}
                  </div>
                  {step.status === "ACTIVE" && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-[#EF9F27]/20 -z-10" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 w-px bg-[#F2F0EB] my-1" />
                )}
              </div>
              <div className="pb-8 flex-1 min-w-0">
                <p
                  className={`text-[0.875rem] font-medium mb-1 transition-colors ${
                    step.status === "PENDING" ? "text-[#6B7280]" : "text-[#0B1A2C]"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[0.78rem] text-[#6B7280] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-xl p-4 mt-2 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-[#BA7517] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[0.82rem] font-medium text-[#0B1A2C] mb-1">
              Is your school not receiving the request?
            </p>
            <p className="text-[0.78rem] text-[#6B7280] leading-relaxed">
              Make sure your child's name and grade match exactly what's on the
              school register.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          fullWidth
          className="mt-6 h-12 rounded-xl border border-black/[0.06]"
          onClick={() => router.push(`/dashboard/children/${childId}`)}
        >
          Back to {child?.fullName?.split(" ")[0]}'s profile
        </Button>
      </div>
    </div>
  );
}
