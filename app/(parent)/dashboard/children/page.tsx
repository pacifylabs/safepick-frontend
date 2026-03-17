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
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-[#F2F0EB] animate-pulse rounded-xl" />
          <div className="h-10 w-32 bg-[#F2F0EB] animate-pulse rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full bg-[#F2F0EB] animate-pulse rounded-xl border border-black/[0.04]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-8">
        <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#D85A30]/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-[#D85A30]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-navy text-lg">Unable to load children</h3>
            <p className="font-body text-sm text-navy/40 mt-1">
              There was a problem connecting to the server.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 border-[#D85A30]/20 text-[#D85A30] hover:bg-[#D85A30]/5"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
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
        <h2 className="font-display text-2xl font-bold text-navy mb-2">
          No children registered yet
        </h2>
        <p className="font-body text-navy/40 max-w-[320px] mb-8 leading-relaxed">
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
          <h1 className="font-display text-2xl font-bold text-navy">My Children</h1>
          <p className="font-body text-sm text-navy/40 mt-1">
            {children.length} {children.length === 1 ? "child" : "children"} registered
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#F2F0EB] rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-navy"
                  : "text-navy/40 hover:text-navy"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-navy"
                  : "text-navy/40 hover:text-navy"
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/20 group-focus-within:text-teal transition-colors" />
        <input
          type="text"
          placeholder="Search children..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 bg-white border border-black/[0.06] rounded-2xl pl-11 pr-4 text-sm font-body outline-none focus:border-teal/30 focus:ring-4 focus:ring-teal/5 transition-all"
        />
      </div>

      {/* CONTENT */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-sm">
          <div className="bg-[#F9F9F8] border-b border-black/[0.06] px-6 py-3 grid grid-cols-[2.5fr_1.2fr_2.5fr_1fr_auto] gap-4 items-center">
            {["Name", "Sharing", "School", "Modified"].map((h, idx) => (
              <span
                key={h}
                className={`font-body text-[0.75rem] font-bold text-navy/40 uppercase tracking-wider ${
                  idx === 3 ? "text-right" : ""
                }`}
              >
                {h}
              </span>
            ))}
            <div className="w-8" />
          </div>

          <div className="divide-y divide-black/[0.04]">
            {filteredChildren.map((child) => (
              <div
                key={child.id}
                onClick={() => router.push(`/dashboard/children/${child.id}`)}
                className={`px-6 py-4 grid grid-cols-[2.5fr_1.2fr_2.5fr_1fr_auto] gap-4 items-center cursor-pointer transition-colors ${
                  selectedChildId === child.id ? "bg-[#EEF2FF]/50" : "hover:bg-[#F9F9F8]"
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
                    <p className="font-body text-[0.875rem] font-bold text-navy truncate">
                      {child.fullName}
                    </p>
                    <p className="font-body text-[0.72rem] text-navy/40">{child.grade}</p>
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
                    <p className="font-body text-[0.82rem] text-navy truncate">
                      {child.school.name}
                    </p>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#BA7517] text-[0.7rem] font-bold uppercase tracking-wider">
                      Setup needed
                    </span>
                  )}
                </div>

                <p className="font-body text-[0.82rem] text-navy/40 text-right">
                  {format(new Date(child.createdAt), "MMM d, yyyy")}
                </p>

                <button className="p-1 hover:bg-[#F2F0EB] rounded-lg transition-colors text-navy/20 hover:text-navy">
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
              className="bg-white rounded-2xl p-5 border border-black/[0.06] cursor-pointer hover:shadow-md transition-all shadow-sm"
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
                <button className="p-1 hover:bg-[#F2F0EB] rounded-lg transition-colors text-navy/20 hover:text-navy">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <p className="font-display font-bold text-navy text-lg truncate">
                  {child.fullName}
                </p>
                <p className="font-body text-sm text-navy/40">{child.grade}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/[0.04]">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      child.enrollmentStatus === "VERIFIED" ? "bg-[#0FA37F]" : "bg-[#EF9F27]"
                    }`}
                  />
                  <span className="text-[0.65rem] text-navy/40 font-bold uppercase tracking-widest">
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
