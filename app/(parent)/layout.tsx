"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Activity,
  CalendarDays,
  Users,
  Search,
  Bell,
  ChevronDown,
  Clock,
  Heart,
  Share2,
  Tag,
  Plus,
  Settings,
  ShieldAlert,
  CircleDashed,
  ChevronRight,
  LayoutGrid,
  List,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { useChildren } from "@/hooks/useChildren";
import { ChildDetailPanel } from "@/components/dashboard/ChildDetailPanel";
import { Child } from "@/types/children.types";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };
  const {
    rightPanelOpen,
    selectedChildId,
    closeRightPanel,
    notificationCount,
    panicActive,
  } = useUIStore();
  const { data: childrenData = [] } = useChildren();

  const navTabs = [
    { href: "/dashboard", icon: FolderOpen, label: "Dashboard" },
    { href: "/dashboard/activity", icon: Activity, label: "Activity" },
    { href: "/dashboard/attendance", icon: CalendarDays, label: "Attendance" },
    { href: "/dashboard/delegates", icon: Users, label: "Delegates" },
  ];

  const sidebarChildren = childrenData.slice(0, 5);

  const getChildColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["bg-[#1D9E75]", "bg-[#185FA5]", "bg-[#BA7517]", "bg-[#993556]"];
    return colors[Math.abs(hash) % 4];
  };

  return (
    <div className="min-h-screen bg-[#EFEFED] flex flex-col font-body">
      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[101] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
                <Link href="/dashboard" className="hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
                  <Logo variant="dark" size="sm" />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-[#F2F0EB] rounded-lg text-[#6B7280]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Profile Section */}
                <div className="flex items-center gap-3 p-3 bg-[#F9F9F8] rounded-2xl border border-black/[0.04]">
                  <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-medium">
                    {user?.fullName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.9rem] font-semibold text-[#0B1A2C] truncate">{user?.fullName}</p>
                    <p className="text-[0.75rem] text-[#6B7280] truncate">{user?.phone}</p>
                  </div>
                </div>

                {/* Main Links */}
                <div className="space-y-1">
                  {navTabs.map((tab) => (
                    <button
                      key={tab.href}
                      onClick={() => {
                        router.push(tab.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        pathname === tab.href
                          ? "bg-[#EEF2FF] text-[#3730A3]"
                          : "text-[#6B7280] hover:bg-[#F2F0EB]"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="text-[0.9rem] font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Protected Children List */}
                <div className="pt-2">
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-[#6B7280]/60 mb-2 px-3">
                    PROTECTED CHILDREN
                  </p>
                  <div className="space-y-1">
                    {childrenData.map((child: Child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          router.push(`/dashboard/children/${child.id}`);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F2F0EB] transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-medium text-white ${getChildColor(child.id)}`}>
                          {child.fullName[0]}
                        </div>
                        <span className="text-[0.875rem] text-[#0B1A2C]">{child.fullName.split(" ")[0]}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        router.push("/dashboard/children/new");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#6B7280] hover:bg-[#F2F0EB] border border-dashed border-black/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[0.875rem]">Add child</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Utility Actions */}
              <div className="p-4 border-t border-black/[0.06] bg-[#F9F9F8] space-y-1">
                <button
                  onClick={() => {
                    // router.push("/settings");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#6B7280] hover:bg-[#F2F0EB]"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-[0.9rem]">Settings</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#D85A30] hover:bg-[#FAECE7]"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[0.9rem]">Sign out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* TOP NAV BAR */}
      <header className="bg-white border-b border-black/[0.06] px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 md:gap-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 hover:bg-[#F2F0EB] rounded-lg text-[#6B7280]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <Logo variant="dark" size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <button
                  key={tab.href}
                  onClick={() => router.push(tab.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[0.875rem] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#0B1A2C] text-white"
                      : "text-[#6B7280] hover:text-[#0B1A2C] hover:bg-[#F2F0EB]"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#F2F0EB] rounded-xl px-3 py-2 w-[220px] cursor-text hover:bg-[#ECEAE5] transition-colors">
            <Search className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[0.875rem] text-[#6B7280]">Search anything...</span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-[#F2F0EB] flex items-center justify-center relative cursor-pointer hover:bg-[#ECEAE5]">
            <Bell className="w-4 h-4 text-[#0B1A2C]" />
            {notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D85A30] text-[0.6rem] text-white flex items-center justify-center">
                {notificationCount}
              </div>
            )}
          </div>

          <div className="w-9 h-9 rounded-full overflow-hidden cursor-pointer bg-[#1D9E75] flex items-center justify-center border border-black/5">
            {user?.fullName ? (
              <span className="text-[0.75rem] font-medium text-white">
                {user.fullName.split(" ").map((n: string) => n[0]).join("")}
              </span>
            ) : (
              <Users className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="hidden md:flex w-[240px] flex-shrink-0 bg-white border-r border-black/[0.06] flex-col h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
          <div className="p-4">
            <div
              onClick={() => router.push("/dashboard")}
              className="bg-[#EEF2FF] text-[#3730A3] rounded-xl px-3 py-2.5 mb-1 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center">
                <FolderOpen className="w-4 h-4 mr-2" />
                <span className="text-[0.875rem] font-medium">Dashboard</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>

            <div className="flex flex-col gap-0.5 mt-2">
              {[
                { icon: Clock, label: "Recent" },
                { icon: Heart, label: "Favourites" },
                { icon: Share2, label: "Shared" },
                { icon: Tag, label: "Tags" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[0.875rem] text-[#6B7280] hover:bg-[#F2F0EB] hover:text-[#0B1A2C] cursor-pointer transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-[#F2F0EB] my-3" />

            <p className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-[#6B7280]/60 mb-2 px-3">
              PROTECTED CHILDREN
            </p>

            <div className="flex flex-col gap-0.5">
              {sidebarChildren.map((child: Child) => (
                <div
                  key={child.id}
                  onClick={() => router.push(`/dashboard/children/${child.id}`)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#F2F0EB] transition-colors group"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-medium text-white ${getChildColor(child.id)}`}>
                    {child.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-medium text-[#0B1A2C] truncate">
                      {child.fullName.split(" ")[0]}
                    </p>
                    <p className="text-[0.68rem] text-[#6B7280]">{child.grade}</p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full relative ${
                      child.enrollmentStatus === "VERIFIED"
                        ? "bg-[#0FA37F]"
                        : child.enrollmentStatus === "REJECTED"
                        ? "bg-[#D85A30]"
                        : "bg-[#EF9F27]"
                    }`}
                  >
                    {child.enrollmentStatus === "PENDING_VERIFICATION" && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-[#EF9F27]/40" />
                    )}
                  </div>
                </div>
              ))}

              <div
                onClick={() => router.push("/dashboard/children/new")}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#F2F0EB] border border-dashed border-[#0B1A2C]/10 mt-1"
              >
                <Plus className="w-4 h-4 text-[#6B7280]" />
                <p className="text-[0.82rem] text-[#6B7280]">Add child</p>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-[#F2F0EB]">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#F2F0EB] text-[#6B7280] hover:text-[#0B1A2C]">
              <Settings className="w-4 h-4" />
              <span className="text-[0.875rem]">Settings</span>
            </div>

            <div
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-coral/10 text-[#D85A30] hover:text-coral"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[0.875rem]">Sign out</span>
            </div>

            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer mt-1 ${panicActive ? "bg-[#FAECE7] text-[#D85A30]" : "text-[#6B7280] hover:bg-[#FAECE7] hover:text-[#D85A30]"}`}>
              <ShieldAlert className="w-4 h-4" />
              <span className="text-[0.875rem]">Emergency</span>
              {panicActive && <div className="w-2 h-2 rounded-full bg-[#D85A30] ml-auto animate-pulse" />}
            </div>

            <div className="mt-3 px-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CircleDashed className="w-3.5 h-3.5 text-[#6B7280]" />
                  <p className="text-[0.75rem] text-[#6B7280]">Children</p>
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5 text-[#6B7280] cursor-pointer"
                  onClick={() => router.push("/dashboard/children/new")}
                />
              </div>
              <div className="w-full h-1.5 bg-[#F2F0EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0FA37F] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((childrenData.length / 10) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[0.7rem] text-[#6B7280] mt-1">
                {childrenData.length} of 10 children registered
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative bg-[#F9F9F8]">
          {children}
        </main>

        {/* RIGHT DETAIL PANEL */}
        <aside className="hidden lg:block">
          <div
            className={`h-[calc(100vh-57px)] sticky top-[57px] bg-white border-l border-black/[0.06] transition-all duration-300 ease-in-out overflow-hidden ${
              rightPanelOpen ? "w-[300px]" : "w-0"
            }`}
          >
            <AnimatePresence mode="wait">
              {rightPanelOpen && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-[300px] h-full"
                >
                  <ChildDetailPanel childId={selectedChildId} onClose={closeRightPanel} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.06] flex items-center justify-around px-2 py-2 pb-safe z-50">
        {[
          { icon: FolderOpen, label: "Dashboard", href: "/dashboard" },
          { icon: Activity, label: "Activity", href: "/dashboard/activity" },
          { icon: CalendarDays, label: "Attendance", href: "/dashboard/attendance" },
          { icon: Users, label: "Delegates", href: "/dashboard/delegates" },
          { icon: ShieldAlert, label: "Emergency", href: "/emergency" },
        ].map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-3 ${
                isActive ? "text-[#0FA37F]" : "text-[#6B7280]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[0.6rem] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
