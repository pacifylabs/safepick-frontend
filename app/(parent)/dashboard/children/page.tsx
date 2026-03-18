"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
  Baby,
} from "lucide-react";
import { useChildren } from "@/hooks/useChildren";
import { useUIStore } from "@/stores/ui.store";
import { AvatarStack } from "@/components/dashboard/AvatarStack";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { Child } from "@/types/children.types";

export default function ChildrenPage() {
  const router = useRouter();
  const { data: children = [], isLoading, isError, refetch } = useChildren();
  const { viewMode, setViewMode, openRightPanel, selectedChildId } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChildren = children.filter((child) =>
    child.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChildColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["bg-[#1D9E75]", "bg-[#185FA5]", "bg-[#BA7517]", "bg-[#993556]"];
    return colors[Math.abs(hash) % 4];
  };

  if (isLoading) {
    return (
      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[100px] animate-pulse bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl" />
          ))}
        </div>
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] h-[400px] animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-6">
        <div className="bg-[#FAECE7] border border-[#D85A30]/30 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-[#D85A30]" />
          <div>
            <h3 className="font-body text-lg font-semibold text-[var(--text-primary)]">Unable to load children</h3>
            <p className="text-[var(--text-secondary)] text-sm">Please check your connection and try again.</p>
          </div>
          <Button variant="primary" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#EEF2FF] flex items-center justify-center mb-6">
          <Baby className="w-10 h-10 text-[#4F46E5]" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-2">
          No children registered yet
        </h2>
        <p className="font-body text-[var(--text-secondary)] max-w-[320px] mb-8 leading-relaxed">
          Add your children to start managing their school pickups and authorized delegates.
        </p>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/children/new")}
          className="h-12 px-8 rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add your first child
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* HEADER & TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">My Children</h1>
          <p className="font-body text-sm text-[var(--text-secondary)] mt-1">
            {children.length} {children.length === 1 ? "child" : "children"} registered
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[var(--bg-page)] rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "grid"
                  ? "bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "list"
                  ? "bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => router.push("/dashboard/children/new")}
            className="h-10 px-4 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-teal transition-colors" />
        <input
          type="text"
          placeholder="Search children..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl pl-11 pr-4 text-sm font-body outline-none focus:border-teal/30 focus:ring-4 focus:ring-teal/5 transition-all"
        />
      </div>

      {/* CONTENT */}
      {viewMode === "list" ? (
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-surface-2)] border-b border-[var(--border)] px-6 py-3 grid grid-cols-[2.5fr_1.2fr_2.5fr_1fr_auto] gap-4 items-center">
            {["Name", "Sharing", "School", "Modified"].map((h, idx) => (
              <span
                key={h}
                className={`font-body text-[0.75rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider ${
                  idx === 3 ? "text-right" : ""
                }`}
              >
                {h}
              </span>
            ))}
            <div className="w-8" />
          </div>

          <div className="divide-y divide-[var(--border)]">
            {filteredChildren.map((child) => (
              <div
                key={child.id}
                onClick={() => router.push(`/dashboard/children/${child.id}`)}
                className={`px-6 py-4 grid grid-cols-[2.5fr_1.2fr_2.5fr_1fr_auto] gap-4 items-center cursor-pointer transition-colors ${
                  selectedChildId === child.id ? "bg-[#EEF2FF]/50" : "hover:bg-[var(--bg-surface-2)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-[0.75rem] font-bold ${getChildColor(
                      child.id
                    )}`}
                  >
                    {child.photoUrl ? (
                      <img
                        src={child.photoUrl}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      child.fullName[0]
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-[0.875rem] font-bold text-[var(--text-primary)] truncate">
                      {child.fullName}
                    </p>
                    <p className="font-body text-[0.72rem] text-[var(--text-secondary)]">{child.grade}</p>
                  </div>
                </div>

                <div>
                  <AvatarStack
                    users={[
                      { id: child.secondaryGuardian.id, fullName: child.secondaryGuardian.fullName },
                    ]}
                  />
                </div>

                <div className="min-w-0">
                  {child.enrollmentStatus === "VERIFIED" && child.school ? (
                    <p className="font-body text-[0.82rem] text-[var(--text-primary)] truncate">
                      {child.school.name}
                    </p>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#BA7517] text-[0.7rem] font-bold uppercase tracking-wider">
                      Setup needed
                    </span>
                  )}
                </div>

                <p className="font-body text-[0.82rem] text-[var(--text-secondary)] text-right">
                  {format(new Date(child.createdAt), "MMM d, yyyy")}
                </p>

                <button className="p-1 hover:bg-[var(--bg-muted)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChildren.map((child) => (
            <div
              key={child.id}
              onClick={() => router.push(`/dashboard/children/${child.id}`)}
              className="bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border)] cursor-pointer hover:shadow-md transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[1rem] font-bold ${getChildColor(
                    child.id
                  )}`}
                >
                  {child.photoUrl ? (
                    <img
                      src={child.photoUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    child.fullName[0]
                  )}
                </div>
                <button className="p-1 hover:bg-[var(--bg-muted)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <p className="font-display font-bold text-[var(--text-primary)] text-lg truncate">
                  {child.fullName}
                </p>
                <p className="font-body text-sm text-[var(--text-secondary)]">{child.grade}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      child.enrollmentStatus === "VERIFIED" ? "bg-[#0FA37F]" : "bg-[#EF9F27]"
                    }`}
                  />
                  <span className="text-[0.65rem] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                    {child.enrollmentStatus === "VERIFIED" ? "Verified" : "Pending"}
                  </span>
                </div>
                <AvatarStack
                  users={[
                    { id: child.secondaryGuardian.id, fullName: child.secondaryGuardian.fullName },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
