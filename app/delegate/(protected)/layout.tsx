"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  useDelegateProfile,
  useDelegatePickupRequests,
} from "@/hooks/useDelegate";
import { useDelegateAuthStore } from "@/stores/delegateAuth.store";
import { SosButton } from "@/components/delegate/SosButton";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  Building,
  LogOut,
} from "lucide-react";

function getInitials(name?: string): string {
  if (!name) return "DL";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DelegateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, clearDelegate } = useDelegateAuthStore();

  const { data: delegate } = useDelegateProfile();
  const { data: pickupData } = useDelegatePickupRequests();

  const pendingCount = useMemo(() => {
    if (!Array.isArray(pickupData)) return 0;
    return pickupData.filter((r: any) => r.status === "PENDING_GATE").length;
  }, [pickupData]);

  const navItems = [
    { href: "/delegate/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/delegate/children", icon: Users, label: "My children" },
    { href: "/delegate/schedule", icon: Calendar, label: "Schedule" },
    {
      href: "/delegate/pickups",
      icon: Bell,
      label: "Pickups",
      badge: pendingCount,
    },
    { href: "/delegate/schools", icon: Building, label: "Schools" },
  ];

  const handleSignOut = () => {
    clearDelegate();
    router.replace("/delegate/login");
  };

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.replace("/delegate/login");
    }
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#E8EAF0]">
      <aside className="hidden lg:flex w-[220px] flex-shrink-0 bg-[#0B1A2C] flex-col fixed top-0 left-0 h-screen z-40">
        <div className="px-5 py-6 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <div className="w-[8px] h-[8px] bg-[#0FA37F] rounded-full"></div>
            <span className="font-['Fraunces'] text-[1.1rem] font-semibold text-white tracking-[-0.02em]">
              SafePick
            </span>
          </div>
        </div>

        <div className="flex-1 px-3 py-2 space-y-1">
          <div className="text-[0.6rem] font-medium uppercase tracking-[0.1em] text-white/25 px-3 mb-3">
            Main menu
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "flex items-center gap-[9px] px-3 py-[9px] rounded-[9px] bg-[rgba(15,163,127,0.12)] text-[#0FA37F] relative"
                    : "flex items-center gap-[9px] px-3 py-[9px] rounded-[9px] text-white/50 hover:text-white/75 hover:bg-white/[0.05] transition-all"
                }
              >
                {isActive && (
                  <div className="absolute left-0 top-[20%] w-[2.5px] h-[60%] bg-[#0FA37F] rounded-r-full"></div>
                )}
                <Icon
                  className={`w-[15px] h-[15px] flex-shrink-0 ${
                    isActive ? "opacity-100" : "opacity-80"
                  }`}
                />
                <span className="text-[0.8rem] font-['DM_Sans'] font-medium flex-1">
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-[#D85A30] text-white text-[0.58rem] font-medium rounded-full px-[6px] py-[2px] leading-[1.2]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-3 pb-5 border-t border-white/[0.07] pt-4">
          <div className="flex items-center gap-[9px] p-[10px] rounded-[10px] bg-white/[0.04]">
            <div className="w-[34px] h-[34px] rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[0.68rem] font-medium flex-shrink-0">
              {getInitials(delegate?.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.78rem] font-medium text-white font-['DM_Sans'] truncate">
                {delegate?.fullName ?? "Delegate"}
              </p>
              <p className="text-[0.65rem] text-white/40 font-['DM_Sans'] mt-[1px]">
                Delegate
              </p>
            </div>
          </div>
          <div
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-[8px] mt-[6px] rounded-[8px] cursor-pointer text-white/30 hover:text-[#D85A30] hover:bg-white/[0.04] transition-all font-['DM_Sans'] text-[0.75rem]"
          >
            <LogOut className="w-[13px] h-[13px]" />
            <span>Sign out</span>
          </div>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.07] z-40 flex justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-[3px] py-1 px-3 relative"
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-[#0FA37F]" : "text-[#6B7280]"
                }`}
              />
              <span
                className={`text-[0.6rem] font-['DM_Sans'] ${
                  isActive ? "text-[#0FA37F]" : "text-[#6B7280]"
                }`}
              >
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-0 right-1 w-[16px] h-[16px] bg-[#D85A30] text-white rounded-full text-[0.55rem] font-medium flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen">
        <div className="flex flex-1">
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
      </div>

      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50">
        <SosButton />
      </div>
    </div>
  );
}
