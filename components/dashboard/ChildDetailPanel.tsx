"use client";

import React, { useState } from "react";
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
  FileText,
  History,
  StickyNote,
} from "lucide-react";
import { useChild } from "@/hooks/useChildren";
import { useDelegatesForChild } from "@/hooks/useDelegates";
import { useAuditLog } from "@/hooks/useAudit";
import { AvatarStack } from "./AvatarStack";
import { useRouter } from "next/navigation";
import { AuditEntry, AUDIT_EVENT_LABELS } from "@/types/audit.types";

interface ChildDetailPanelProps {
  childId: string | null;
  onClose: () => void;
}

type TabType = "activity" | "notes" | "versions";

// Check if MSW is enabled
const isMswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";

export const ChildDetailPanel: React.FC<ChildDetailPanelProps> = ({
  childId,
  onClose,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("activity");
  const { data: child, isLoading: loadingChild, error } = useChild(childId || "");
  const { data: delegates = [], isLoading: loadingDelegates } = useDelegatesForChild(childId || "");

  // Fetch real audit log data when not in MSW mode
  const { data: auditData, isLoading: loadingAudit } = useAuditLog({
    childId: childId || undefined,
    limit: 10,
  });

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

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <Info className="w-12 h-12 text-[#D85A30]/50 mb-3" />
        <p className="font-body text-[0.875rem] text-[#6B7280]/60 mb-2">
          Error loading child details
        </p>
        <p className="font-body text-[0.7rem] text-[#6B7280]/40">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
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
            {(child.enrollmentStatus || "PENDING").toLowerCase().replace(/_/g, " ")}
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
              ...(child.secondaryGuardian ? [{
                id: child.secondaryGuardian.id,
                fullName: child.secondaryGuardian.fullName,
              }] : []),
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
          <button
            onClick={() => setActiveTab("activity")}
            className={`font-body text-[0.875rem] pb-3 transition-colors ${
              activeTab === "activity"
                ? "text-[#0B1A2C] font-medium border-b-2 border-[#0B1A2C] -mb-px"
                : "text-[#6B7280] hover:text-[#0B1A2C]"
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`font-body text-[0.875rem] pb-3 transition-colors ${
              activeTab === "notes"
                ? "text-[#0B1A2C] font-medium border-b-2 border-[#0B1A2C] -mb-px"
                : "text-[#6B7280] hover:text-[#0B1A2C]"
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("versions")}
            className={`font-body text-[0.875rem] pb-3 transition-colors ${
              activeTab === "versions"
                ? "text-[#0B1A2C] font-medium border-b-2 border-[#0B1A2C] -mb-px"
                : "text-[#6B7280] hover:text-[#0B1A2C]"
            }`}
          >
            Versions
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="min-h-[200px]">
          {activeTab === "activity" && (
            <ActivityTabContent
              child={child}
              auditEntries={auditData?.entries}
              isLoading={loadingAudit}
              isMswEnabled={isMswEnabled}
            />
          )}
          {activeTab === "notes" && <NotesTabContent />}
          {activeTab === "versions" && <VersionsTabContent />}
        </div>
      </div>
    </div>
  );
};

// --- Activity Tab Content ---

interface ActivityTabContentProps {
  child: {
    id: string;
    fullName: string;
    safepickId: string;
  };
  auditEntries?: AuditEntry[];
  isLoading: boolean;
  isMswEnabled: boolean;
}

const ActivityTabContent: React.FC<ActivityTabContentProps> = ({
  child,
  auditEntries,
  isLoading,
  isMswEnabled,
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-4 w-20 bg-[#F2F0EB] animate-pulse rounded" />
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#F2F0EB] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 bg-[#F2F0EB] animate-pulse rounded" />
            <div className="h-8 w-full bg-[#F2F0EB] animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  // MSW Mode: Show stub data
  if (isMswEnabled) {
    return (
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
    );
  }

  // Real API Mode: Show actual audit data
  if (!auditEntries || auditEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <History className="w-8 h-8 text-[#6B7280]/30 mb-2" />
        <p className="font-body text-[0.78rem] text-[#6B7280]/60">
          No activity recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {auditEntries.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[0.6rem] ${
                entry.eventType.includes("DENIED") || entry.eventType.includes("HELD")
                  ? "bg-[#D85A30]"
                  : entry.eventType.includes("APPROVED")
                  ? "bg-[#1D9E75]"
                  : "bg-[#4F46E5]"
              }`}
            >
              {entry.actorName.slice(0, 2).toUpperCase()}
            </div>
            {index < auditEntries.length - 1 && (
              <div className="flex-1 w-px bg-[#F2F0EB] mt-1" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="font-body text-[0.78rem] text-[#6B7280] leading-relaxed">
              {AUDIT_EVENT_LABELS[entry.eventType] || entry.eventType}
              {entry.delegateName && (
                <>
                  {" · "}
                  <span className="text-[#4F46E5]">{entry.delegateName}</span>
                </>
              )}
            </p>
            <p className="font-body text-[0.65rem] text-[#6B7280]/50 mt-0.5">
              {new Date(entry.timestamp).toLocaleDateString()} · {entry.actorName}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Notes Tab Content ---

const NotesTabContent: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <StickyNote className="w-8 h-8 text-[#6B7280]/30 mb-2" />
      <p className="font-body text-[0.78rem] text-[#6B7280]/60 mb-1">
        Notes coming soon
      </p>
      <p className="font-body text-[0.65rem] text-[#6B7280]/40 max-w-[200px]">
        You&apos;ll be able to add and manage notes about your child here
      </p>
    </div>
  );
};

// --- Versions Tab Content ---

const VersionsTabContent: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <FileText className="w-8 h-8 text-[#6B7280]/30 mb-2" />
      <p className="font-body text-[0.78rem] text-[#6B7280]/60 mb-1">
        Version history coming soon
      </p>
      <p className="font-body text-[0.65rem] text-[#6B7280]/40 max-w-[200px]">
        Track changes to your child&apos;s profile over time
      </p>
    </div>
  );
};
