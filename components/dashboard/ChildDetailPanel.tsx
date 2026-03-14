"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FolderOpen,
  UserCheck,
  Building,
  Baby,
  MoreHorizontal,
  ChevronRight,
  Info,
} from "lucide-react";
import { useChild } from "@/hooks/useChildren";
import { useDelegatesForChild } from "@/hooks/useDelegates";
import { AvatarStack } from "./AvatarStack";
import { useRouter } from "next/navigation";

interface ChildDetailPanelProps {
  childId: string | null;
  onClose: () => void;
}

export const ChildDetailPanel: React.FC<ChildDetailPanelProps> = ({
  childId,
  onClose,
}) => {
  const router = useRouter();
  const { data: child, isLoading: loadingChild } = useChild(childId || "");
  const { data: delegates = [], isLoading: loadingDelegates } = useDelegatesForChild(childId || "");

  if (!childId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <FolderOpen className="w-12 h-12 text-[#6B7280]/30 mb-3" />
        <p className="font-body text-[0.875rem] text-[#6B7280]/60">
          Select a child to view details
        </p>
      </div>
    );
  }

  if (loadingChild) {
    return (
      <div className="p-5 space-y-4">
        <div className="h-10 w-10 bg-[#F2F0EB] animate-pulse rounded-xl" />
        <div className="h-6 w-3/4 bg-[#F2F0EB] animate-pulse rounded-md" />
        <div className="h-4 w-1/2 bg-[#F2F0EB] animate-pulse rounded-md" />
      </div>
    );
  }

  if (!child) return null;

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* PANEL HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center cursor-pointer" onClick={() => router.push(`/dashboard/children/${child.id}`)}>
            {child.photoUrl ? (
              <img
                src={child.photoUrl}
                alt={child.fullName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <FolderOpen className="text-[#4F46E5] w-5 h-5" />
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#F2F0EB] rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-[#6B7280] hover:text-[#0B1A2C]" />
        </button>
      </div>

      {/* CHILD NAME + META */}
      <div className="mt-1">
        <h3 className="font-body text-[1.1rem] font-semibold text-[#0B1A2C] mb-1 cursor-pointer hover:text-[#4F46E5] transition-colors" onClick={() => router.push(`/dashboard/children/${child.id}`)}>
          {child.fullName}
        </h3>
        <p className="font-body text-[0.78rem] text-[#6B7280]">
          {child.safepickId} · {child.grade} ·{" "}
          {child.school?.name || "No school"}
        </p>
      </div>

      {/* TAGS ROW */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-body text-[0.72rem] font-medium text-[#6B7280]">
            Tags
          </p>
          <button className="font-body text-[0.72rem] text-[#4F46E5] hover:underline">
            Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="bg-[#EEF2FF] text-[#3730A3] rounded-full px-2.5 py-1 font-body text-[0.72rem] font-medium capitalize">
            {child.enrollmentStatus.toLowerCase().replace(/_/g, " ")}
          </span>
          {child.school && (
            <span className="bg-[#E1F5EE] text-[#0F6E56] rounded-full px-2.5 py-1 font-body text-[0.72rem] font-medium truncate max-w-[120px]">
              {child.school.name}
            </span>
          )}
          <span className="bg-[#F2F0EB] text-[#6B7280] rounded-full px-2.5 py-1 font-body text-[0.72rem]">
            {child.grade}
          </span>
        </div>
      </div>

      {/* SHARING SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-[0.72rem] font-medium text-[#6B7280]">
            Sharing
          </p>
          <button 
            className="font-body text-[0.72rem] text-[#4F46E5] hover:underline"
            onClick={() => router.push(`/dashboard/delegates?child=${child.id}`)}
          >
            Manage
          </button>
        </div>
        <div className="flex items-center gap-2">
          <AvatarStack
            users={[
              {
                id: child.secondaryGuardianId,
                fullName: child.secondaryGuardian.fullName,
              },
              ...delegates.map(d => ({
                id: d.id,
                fullName: d.fullName,
                photoUrl: d.photoUrl || undefined
              }))
            ]}
          />
        </div>
      </div>

      <div className="w-full h-px bg-[#F2F0EB]" />

      {/* ACTIVITY TABS */}
      <div>
        <div className="flex gap-4 border-b border-[#F2F0EB] mb-4">
          <button className="font-body text-[0.875rem] pb-3 text-[#0B1A2C] font-medium border-b-2 border-[#0B1A2C] -mb-px">
            Activity
          </button>
          <button className="font-body text-[0.875rem] pb-3 text-[#6B7280] hover:text-[#0B1A2C]">
            Notes
          </button>
          <button className="font-body text-[0.875rem] pb-3 text-[#6B7280] hover:text-[#0B1A2C]">
            Versions
          </button>
        </div>

        {/* STUB ACTIVITY DATA */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-body text-[0.72rem] font-medium text-[#6B7280] mb-4">
              Yesterday
            </p>
            <div className="flex gap-3 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#1D9E75] border-2 border-white flex items-center justify-center text-white text-[0.6rem]">
                  YO
                </div>
                <div className="flex-1 w-px bg-[#F2F0EB] mt-1" />
              </div>
              <div className="flex-1">
                <p className="font-body text-[0.78rem] text-[#6B7280] leading-relaxed">
                  You authorized{" "}
                  <span className="text-[#4F46E5] cursor-pointer" onClick={() => router.push('/dashboard/delegates')}>
                    David Mensah
                  </span>{" "}
                  to pick up {child.fullName}
                </p>
                <div className="mt-1.5 flex items-center gap-2 bg-[#F9F9F8] rounded-lg px-2.5 py-1.5 border border-black/[0.06]">
                  <UserCheck className="w-4 h-4 text-[#6B7280]" />
                  <p className="font-body text-[0.72rem] text-[#0B1A2C]">
                    Driver · Authorized
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="font-body text-[0.72rem] font-medium text-[#6B7280] mb-4">
              30 days ago
            </p>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#BA7517] border-2 border-white flex items-center justify-center text-white text-[0.6rem]">
                  SP
                </div>
              </div>
              <div className="flex-1">
                <p className="font-body text-[0.78rem] text-[#6B7280] leading-relaxed">
                  You registered {child.fullName} on SafePick
                </p>
                <div className="mt-1.5 flex items-center gap-2 bg-[#F9F9F8] rounded-lg px-2.5 py-1.5 border border-black/[0.06]">
                  <Baby className="w-4 h-4 text-[#6B7280]" />
                  <p className="font-body text-[0.72rem] text-[#0B1A2C]">
                    {child.safepickId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
