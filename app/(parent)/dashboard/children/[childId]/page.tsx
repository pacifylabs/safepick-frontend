"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Shield,
  Calendar,
  Building,
  UserCheck,
  Baby,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import { useChild, useDeleteChild } from "@/hooks/useChildren";
import { useDelegatesForChild } from "@/hooks/useDelegates";
import { useUIStore } from "@/stores/ui.store";
import { AvatarStack } from "@/components/dashboard/AvatarStack";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

export default function ChildProfilePage() {
  const { childId } = useParams();
  const router = useRouter();
  const { data: child, isLoading: loadingChild, isError } = useChild(childId as string);
  const { data: delegates = [], isLoading: loadingDelegates } = useDelegatesForChild(childId as string);
  const { openRightPanel } = useUIStore();
  const { mutate: deleteChild, isPending: isDeleting } = useDeleteChild();

  useEffect(() => {
    if (childId) {
      openRightPanel(childId as string);
    }
  }, [childId, openRightPanel]);

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove ${child?.fullName}? This action cannot be undone.`)) {
      deleteChild(childId as string, {
        onSuccess: () => {
          router.push("/dashboard");
        }
      });
    }
  };

  const isLoading = loadingChild || loadingDelegates;

  if (isLoading) {
    return (
      <div className="max-w-[680px] mx-auto px-6 py-6 space-y-6">
        <div className="h-48 bg-[#0B1A2C] animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white animate-pulse rounded-2xl border border-black/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !child) {
    return (
      <div className="max-w-[680px] mx-auto px-6 py-6 text-center">
        <p className="text-muted">Child not found or an error occurred.</p>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 py-6 font-body">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 mb-6 text-[0.875rem]">
        <span className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]" onClick={() => router.push("/dashboard")}>My Children</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-[#0B1A2C] font-medium">{child.fullName}</span>
      </div>

      {/* HERO CARD */}
      <div className="bg-[#0B1A2C] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-xl font-bold border-2 border-white/10">
              {child.photoUrl ? (
                <img src={child.photoUrl} alt={child.fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                child.fullName[0]
              )}
            </div>
            <div>
              <h1 className="font-display text-[1.5rem] font-semibold text-white">
                {child.fullName}
              </h1>
              <p className="text-[0.82rem] text-white/50 mt-1">
                {child.grade} · {child.school?.name || "No school linked"}
              </p>
              <p className="text-[0.7rem] text-white/25 mt-1">
                ID: {child.safepickId}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[0.72rem] font-medium ${
            child.enrollmentStatus === "VERIFIED"
              ? "bg-[#0FA37F]/20 text-[#0FA37F]"
              : "bg-[#EF9F27]/20 text-[#EF9F27]"
          }`}>
            {child.enrollmentStatus.replace(/_/g, " ")}
          </span>
        </div>

        <div className="w-full h-px bg-white/10 mt-4 pt-4" />
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#0FA37F]/60" />
            <p className="text-[0.75rem] text-white/40">
              Backup: <span className="text-white/60 font-medium">{child.secondaryGuardian.fullName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-white/30" />
            <p className="text-[0.75rem] text-white/40">
              Registered {format(new Date(child.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* SECTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School card */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <p className="text-[0.65rem] font-bold text-[#6B7280] uppercase tracking-wider mb-4">SCHOOL</p>
          {child.enrollmentStatus === "VERIFIED" && child.school ? (
            <div className="flex gap-3">
              <Building className="w-5 h-5 text-[#0FA37F] mt-0.5" />
              <div>
                <p className="font-medium text-[#0B1A2C] text-sm">{child.school.name}</p>
                <p className="text-[#0FA37F] text-[0.75rem] font-medium mt-1">Enrollment verified</p>
              </div>
            </div>
          ) : child.enrollmentStatus === "PENDING_VERIFICATION" && child.school ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Building className="w-5 h-5 text-[#BA7517] mt-0.5" />
                <div>
                  <p className="font-medium text-[#0B1A2C] text-sm">{child.school.name}</p>
                  <span className="inline-block bg-[#FAEEDA] text-[#BA7517] text-[0.7rem] px-2 py-0.5 rounded-full font-medium mt-1">
                    Enrollment pending
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#4F46E5] h-8 justify-start px-0 hover:bg-transparent hover:underline"
                onClick={() => router.push(`/dashboard/children/${child.id}/school/enrollment-pending`)}
              >
                View enrollment status
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2 text-center">
              <p className="text-sm text-[#6B7280] mb-3">No school linked yet</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#4F46E5] h-8 border border-[#4F46E5]/20 px-4 rounded-lg"
                onClick={() => router.push(`/dashboard/children/${child.id}/school`)}
              >
                Link a school
              </Button>
            </div>
          )}
        </div>

        {/* Delegates card */}
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.65rem] font-bold text-[#6B7280] uppercase tracking-wider">AUTHORIZED DELEGATES</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#4F46E5] h-6 px-0 hover:bg-transparent"
              onClick={() => router.push(`/dashboard/delegates?child=${child.id}`)}
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Invite
            </Button>
          </div>
          
          <div className="space-y-3">
            {delegates.length > 0 ? (
              delegates.map((delegate) => (
                <div 
                  key={delegate.id}
                  onClick={() => router.push(`/dashboard/delegates/${delegate.id}`)}
                  className="flex items-center gap-3 py-2 border-b border-[#F2F0EB] last:border-0 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F2F0EB] flex items-center justify-center text-[0.7rem] font-bold text-[#6B7280]">
                    {delegate.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.875rem] font-medium text-[#0B1A2C] truncate group-hover:text-[#4F46E5] transition-colors">
                      {delegate.fullName}
                    </p>
                    <p className="text-[0.72rem] text-[#6B7280] truncate">
                      {delegate.relationship.toLowerCase()} · {delegate.authorizations.find(a => a.childId === child.id)?.authType.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                </div>
              ))
            ) : (
              <div className="py-2">
                <p className="text-[0.875rem] text-[#6B7280]">No delegates authorized.</p>
                <p className="text-[0.78rem] text-[#6B7280]/60 mt-1">
                  Invite a driver, nanny, or family member.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-5 border border-black/[0.06]">
          <p className="text-[0.65rem] font-bold text-[#6B7280] uppercase tracking-wider mb-4">ATTENDANCE</p>
          <div className="flex flex-col items-center py-8 text-center">
            <Calendar className="w-8 h-8 text-[#6B7280]/20 mb-2" />
            <p className="text-sm text-[#6B7280]">No records yet</p>
          </div>
        </div>

        {/* Recent pickups card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-5 border border-black/[0.06]">
          <p className="text-[0.65rem] font-bold text-[#6B7280] uppercase tracking-wider mb-4">RECENT PICKUPS</p>
          <div className="flex flex-col items-center py-8 text-center">
            <UserCheck className="w-8 h-8 text-[#6B7280]/20 mb-2" />
            <p className="text-sm text-[#6B7280]">No pickups recorded yet</p>
          </div>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="bg-[#FAECE7] rounded-2xl p-5 border border-[#D85A30]/20 mt-4">
        <p className="text-[0.65rem] font-bold text-[#D85A30] uppercase tracking-wider mb-2">DANGER ZONE</p>
        <p className="text-[0.82rem] text-[#993C1D] mb-3">
          Removing this child will revoke all authorized delegates and clear pickup history. This action cannot be undone.
        </p>
        <Button variant="danger" size="sm" className="h-9 px-4" onClick={handleRemove} loading={isDeleting}>Remove this child</Button>
      </div>
    </div>
  );
}
