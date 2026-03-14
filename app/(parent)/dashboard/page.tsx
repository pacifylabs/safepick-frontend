"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  UserCheck,
  CalendarCheck,
  ShieldAlert,
  MoreHorizontal,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useChildren } from "@/hooks/useChildren";
import { useDelegates } from "@/hooks/useDelegates";
import { useUIStore } from "@/stores/ui.store";
import { useDelegatesStore } from "@/stores/delegates.store";
import { QuickAccessCard } from "@/components/dashboard/QuickAccessCard";
import { AvatarStack } from "@/components/dashboard/AvatarStack";
import { InviteStatusBanner } from "@/components/delegates/InviteStatusBanner";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { data: children = [], isLoading: loadingChildren, isError, refetch } = useChildren();
  const { data: delegates = [], isLoading: loadingDelegates } = useDelegates();
  const {
    viewMode,
    setViewMode,
    openRightPanel,
    selectedChildId,
    setPageTitle,
    panicActive,
  } = useUIStore();

  const { dismissedBanners, dismissBanner } = useDelegatesStore();

  useEffect(() => {
    setPageTitle("Files");
  }, [setPageTitle]);

  const quickAccessItems = [
    {
      title: "Children",
      meta: children.length > 0 ? `${children.length} registered` : "No children yet",
      icon: FolderOpen,
      iconBg: "bg-[#EEF2FF]",
      iconColor: "text-[#4F46E5]",
      onClick: () => {},
    },
    {
      title: "Delegates",
      meta: delegates.length > 0 ? `${delegates.length} authorized` : "None yet",
      icon: UserCheck,
      iconBg: "bg-[#E1F5EE]",
      iconColor: "text-[#0FA37F]",
      onClick: () => router.push("/dashboard/delegates"),
    },
    {
      title: "Attendance",
      meta: format(new Date(), "EEE MMM d"),
      icon: CalendarCheck,
      iconBg: "bg-[#FAEEDA]",
      iconColor: "text-[#BA7517]",
      onClick: () => router.push("/dashboard/calendar"),
    },
    {
      title: "Emergency",
      meta: panicActive ? "ACTIVE" : "All clear",
      icon: ShieldAlert,
      iconBg: "bg-[#FAECE7]",
      iconColor: panicActive ? "text-[#D85A30]" : "text-[#6B7280]",
      onClick: () => router.push("/emergency"),
    },
  ];

  const isLoading = loadingChildren || loadingDelegates;

  if (isLoading) {
    return (
      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[100px] animate-pulse bg-white border border-black/[0.06] rounded-2xl" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-black/[0.06] h-[400px] animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-6">
        <div className="bg-[#FAECE7] border border-[#D85A30]/30 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-[#D85A30]" />
          <div>
            <h3 className="font-body text-lg font-semibold text-[#0B1A2C]">Unable to load dashboard</h3>
            <p className="text-[#6B7280] text-sm">Please check your connection and try again.</p>
          </div>
          <Button variant="primary" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* QUICK ACCESS ROW */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body text-[1rem] font-semibold text-[#0B1A2C]">Quick Access</h2>
          <MoreHorizontal className="w-4 h-4 text-[#6B7280] cursor-pointer" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAccessItems.map((item) => (
            <QuickAccessCard key={item.title} {...item} />
          ))}
        </div>
      </div>

      {/* Banners for pending actions */}
      <div className="space-y-3">
        <AnimatePresence>
          {delegates
            .filter(d => d.kycStatus === "APPROVED" && !dismissedBanners.includes(`banner-${d.id}`))
            .map(d => (
              <motion.div
                key={`banner-${d.id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <InviteStatusBanner
                  type="KYC_APPROVED"
                  delegateName={d.fullName}
                  onAction={() => router.push(`/dashboard/delegates/${d.id}`)}
                  onDismiss={() => dismissBanner(`banner-${d.id}`)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* BREADCRUMB + TOOLBAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-body text-[0.875rem]">
          <span className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]" onClick={() => router.push("/dashboard")}>Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-[#0B1A2C] font-medium">My Children</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#F2F0EB] rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "grid" ? "bg-white shadow-sm text-[#0B1A2C]" : "text-[#6B7280] hover:text-[#0B1A2C]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "list" ? "bg-white shadow-sm text-[#0B1A2C]" : "text-[#6B7280] hover:text-[#0B1A2C]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="rounded-xl h-9 px-4"
            onClick={() => router.push("/dashboard/children/new")}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New
          </Button>
        </div>
      </div>

      {/* CHILDREN CONTENT */}
      {children.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-[#4F46E5]" />
          </div>
          <h3 className="font-body text-[1.1rem] font-semibold text-[#0B1A2C] mb-2">No children registered</h3>
          <p className="font-body text-[0.875rem] text-[#6B7280] max-w-[280px] leading-relaxed mb-6">
            Register your first child to start managing pickups, delegates, and attendance in one place.
          </p>
          <Button variant="primary" onClick={() => router.push("/dashboard/children/new")}>
            Register a child
          </Button>
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          <div className="bg-[#F9F9F8] border-b border-black/[0.06] px-6 py-3 grid grid-cols-[2.5fr_1.2fr_2.5fr_1fr_auto] gap-4 items-center">
            {["Name", "Sharing", "School", "Modified"].map((h, idx) => (
              <span 
                key={h} 
                className={`font-body text-[0.75rem] font-medium text-[#6B7280] flex items-center gap-1 cursor-pointer hover:text-[#0B1A2C] select-none ${idx === 3 ? 'justify-end' : ''}`}
              >
                {h}
              </span>
            ))}
            <div />
          </div>

          <div className="divide-y divide-black/[0.04]">
            {children.map((child) => (
              <div
                key={child.id}
                onClick={() => openRightPanel(child.id)}
                className={`px-6 py-3.5 grid grid-cols-[2.5fr_1.2fr_2.5fr_1fr_auto] gap-4 items-center cursor-pointer transition-colors duration-100 ${
                  selectedChildId === child.id ? "bg-[#EEF2FF]/50" : "hover:bg-[#F9F9F8]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl bg-[#EEF2FF] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/children/${child.id}`);
                    }}
                  >
                    {child.photoUrl ? (
                      <img src={child.photoUrl} alt={child.fullName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <FolderOpen className="w-4 h-4 text-[#4F46E5]" />
                    )}
                  </div>
                  <div
                    className="min-w-0 cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/children/${child.id}`);
                    }}
                  >
                    <p className="font-body text-[0.875rem] font-medium text-[#0B1A2C] truncate">{child.fullName}</p>
                    <p className="font-body text-[0.72rem] text-[#6B7280]">{child.grade}</p>
                  </div>
                </div>

                <div>
                  <AvatarStack
                    users={[
                      { id: child.secondaryGuardianId, fullName: child.secondaryGuardian.fullName },
                      ...delegates
                        .filter(d => d.authorizations.some(a => a.childId === child.id))
                        .map(d => ({ id: d.id, fullName: d.fullName, photoUrl: d.photoUrl || undefined }))
                    ]}
                  />
                </div>

                <div className="min-w-0 flex items-center overflow-hidden">
                  {child.enrollmentStatus === "VERIFIED" ? (
                    <p className="font-body text-[0.82rem] text-[#0B1A2C] truncate">{child.school?.name}</p>
                  ) : (
                    <span className="bg-[#FAEEDA] text-[#BA7517] text-[0.72rem] px-2 py-0.5 rounded-full whitespace-nowrap inline-block max-w-full overflow-hidden text-ellipsis">
                      {child.enrollmentStatus === "PENDING_SCHOOL" ? "Setup needed" : "Verifying"}
                    </span>
                  )}
                </div>

                <p className="font-body text-[0.82rem] text-[#6B7280] truncate text-right">
                  {format(new Date(child.createdAt), "MMM d, yyyy")}
                </p>

                <div className="relative">
                  <button className="p-1 hover:bg-[#F2F0EB] rounded-lg transition-colors text-[#6B7280] hover:text-[#0B1A2C]">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {children.map((child) => (
            <motion.div
              key={child.id}
              whileHover={{ y: -2 }}
              onClick={() => openRightPanel(child.id)}
              className="bg-white rounded-2xl p-4 border border-black/[0.06] cursor-pointer hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-3">
                {child.photoUrl ? (
                  <img src={child.photoUrl} alt={child.fullName} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <FolderOpen className="w-6 h-6 text-[#4F46E5]" />
                )}
              </div>
              <p className="font-body text-[0.875rem] font-semibold text-[#0B1A2C] mb-0.5 truncate">{child.fullName}</p>
              <p className="font-body text-[0.72rem] text-[#6B7280] mb-3">{child.grade}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${child.enrollmentStatus === "VERIFIED" ? "bg-[#0FA37F]" : "bg-[#EF9F27]"}`} />
                  <span className="text-[0.65rem] text-[#6B7280] font-medium capitalize">
                    {child.enrollmentStatus.toLowerCase().replace(/_/g, " ")}
                  </span>
                </div>
                <MoreHorizontal className="w-3.5 h-3.5 text-[#6B7280]" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
