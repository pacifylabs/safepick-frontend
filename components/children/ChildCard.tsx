"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, AlertCircle, Clock, Building } from "lucide-react";
import { Child } from "@/types/children.types";

interface ChildCardProps {
  child: Child;
}

export function ChildCard({ child }: ChildCardProps) {
  const router = useRouter();

  const initials = child.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const getStatusConfig = (status: Child["enrollmentStatus"]) => {
    switch (status) {
      case "VERIFIED":
        return { label: "At school", className: "bg-teal/20 text-teal-mid" };
      case "PENDING_VERIFICATION":
        return { label: "Verification pending", className: "bg-amber/20 text-amber" };
      case "PENDING_SCHOOL":
        return { label: "Setup needed", className: "bg-amber/20 text-amber" };
      case "SCHOOL_NOT_ON_SAFEPICK":
        return { label: "Coming soon", className: "bg-amber/20 text-amber" };
      case "REJECTED":
        return { label: "Rejected", className: "bg-coral/20 text-coral" };
      default:
        return { label: status, className: "bg-muted/20 text-muted" };
    }
  };

  const status = getStatusConfig(child.enrollmentStatus);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/dashboard/children/${child.id}`)}
      className="bg-navy rounded-2xl p-4 cursor-pointer border border-white/5 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        {child.photoUrl ? (
          <img
            src={child.photoUrl}
            alt={child.fullName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-teal-mid flex items-center justify-center text-[0.85rem] font-medium text-white font-body">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[0.9rem] font-medium text-white truncate font-body">
            {child.fullName}
          </p>
          <p className="text-[0.75rem] text-white/40 mt-0.5 font-body">
            {child.grade} {child.school ? `· ${child.school.name}` : "· No school linked"}
          </p>
        </div>

        <div className={`rounded-full py-1 px-3 text-[0.72rem] font-medium font-body ${status.className}`}>
          {status.label}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[0.7rem] text-white/25 font-body">
          ID: {child.safepickId}
        </p>

        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-teal/60" />
          <p className="text-[0.7rem] text-white/30 font-body">
            {child.secondaryGuardian.fullName}
          </p>
        </div>
      </div>

      {child.enrollmentStatus !== "VERIFIED" && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {child.enrollmentStatus === "PENDING_SCHOOL" && (
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber" />
              <p className="text-[0.75rem] text-amber font-body">Link a school to continue setup</p>
            </div>
          )}
          {child.enrollmentStatus === "PENDING_VERIFICATION" && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber" />
              <p className="text-[0.75rem] text-amber font-body">Waiting for school to verify enrollment</p>
            </div>
          )}
          {child.enrollmentStatus === "SCHOOL_NOT_ON_SAFEPICK" && (
            <div className="flex items-center gap-2">
              <Building size={16} className="text-amber" />
              <p className="text-[0.75rem] text-amber font-body">Your school hasn't joined SafePick yet</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
