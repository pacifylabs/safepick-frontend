"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    .slice(0, 2)
    .toUpperCase();

  const getStatusConfig = (status: Child["enrollmentStatus"]) => {
    switch (status) {
      case "VERIFIED":
        return { label: "At school", className: "bg-blue-500/20 text-blue-300" };
      case "PENDING_VERIFICATION":
      case "PENDING_SCHOOL":
        return { label: "Pickup soon", className: "bg-amber/20 text-amber" };
      case "REJECTED":
        return { label: "Alert", className: "bg-coral/20 text-coral-light" };
      default:
        return { label: "Safe", className: "bg-teal/20 text-teal-light" };
    }
  };

  const status = getStatusConfig(child.enrollmentStatus);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/dashboard/children/${child.id}`)}
      className="bg-navy rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-teal-mid flex items-center justify-center text-white font-body font-medium">
          {child.photoUrl ? (
            <img
              src={child.photoUrl}
              alt={child.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[1rem] font-medium text-white truncate font-body leading-tight">
            {child.fullName}
          </p>
          <p className="text-[0.75rem] text-white/40 mt-1 font-body truncate">
            {child.school?.name ?? "No school"} · {child.grade}
          </p>
        </div>

        <div className={`flex-shrink-0 rounded-full py-1 px-3 text-[0.62rem] font-medium font-body uppercase tracking-wider ${status.className}`}>
          {status.label}
        </div>
      </div>
    </motion.div>
  );
}
