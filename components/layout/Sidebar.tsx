"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/auth.store";
import { useDelegateAuthStore } from "@/stores/delegateAuth.store";
import Cookies from "js-cookie";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CalendarCheck, 
  ShieldAlert,
  LogOut,
  LucideIcon,
  Home,
  Calendar,
  Bell,
  Building,
  History,
  FolderOpen,
  MapPin,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  emergency?: boolean;
  badge?: boolean;
  disabled?: boolean;
}

interface SidebarProps {
  items?: NavItem[];
  role?: "PARENT" | "DELEGATE";
}

const defaultParentItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/children", icon: FolderOpen, label: "Children" },
  { href: "/dashboard/delegates", icon: Users, label: "Delegates" },
  { href: "/dashboard/pickups", icon: Bell, label: "Pickups" },
  { href: "/dashboard/attendance", icon: CalendarCheck, label: "Attendance" },
  { href: "/dashboard/emergency", icon: ShieldAlert, label: "Emergency" },
  { href: "/dashboard/track", icon: MapPin, label: "Track", disabled: true },
];

const defaultDelegateItems: NavItem[] = [
  { href: "/delegate/dashboard", icon: Home, label: "Home" },
  { href: "/delegate/children", icon: Users, label: "My children" },
  { href: "/delegate/schedule", icon: Calendar, label: "Schedule" },
  { href: "/delegate/pickups", icon: Bell, label: "Pickups", badge: true },
  { href: "/delegate/schools", icon: Building, label: "Schools" },
  { href: "/delegate/audit", icon: History, label: "Activity" },
];

export function Sidebar({ items, role = "PARENT" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const parentUser = useAuthStore((state: any) => state.user);
  const clearParentSession = useAuthStore((state: any) => state.clearSession);
  
  const delegateUser = useDelegateAuthStore((state: any) => state.delegate);
  const clearDelegateSession = useDelegateAuthStore((state: any) => state.clearDelegate);

  const isDelegate = role === "DELEGATE";
  const user = isDelegate ? delegateUser : parentUser;
  const navItems = items || (isDelegate ? defaultDelegateItems : defaultParentItems);

  const handleSignOut = () => {
    if (isDelegate) {
      clearDelegateSession();
      Cookies.remove("delegate-access-token");
      router.push("/delegate/login");
    } else {
      clearParentSession();
      Cookies.remove("accessToken");
      router.push("/login");
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "??";

  return (
    <div className="hidden md:flex w-[240px] flex-shrink-0 bg-navy min-h-screen flex-col sticky top-0 h-screen overflow-y-auto border-r border-white/5">
      <div className="p-6">
        <Logo variant="light" size="md" className="mb-10" />

        <p className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-white/25 mb-3 font-body">
          MAIN MENU
        </p>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-[0.875rem] font-medium transition-all duration-150 ${
                  item.disabled
                    ? "opacity-40 cursor-not-allowed pointer-events-none"
                    : isActive
                      ? "bg-teal/15 text-teal border-l-2 border-teal"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.disabled && (
                  <span className="bg-[#F2F0EB] text-[#6B7280] rounded-full px-2 py-0.5 text-[0.6rem] font-medium">
                    Soon
                  </span>
                )}
                {item.emergency && (
                  <div className="w-2 h-2 rounded-full bg-coral ml-auto" />
                )}
                {item.badge && (
                  <div className="w-2 h-2 rounded-full bg-teal ml-auto animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="w-full h-px bg-white/10 mb-4" />
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-mid flex items-center justify-center text-[0.75rem] font-medium text-white font-body">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.82rem] font-medium text-white truncate font-body">
              {user?.fullName || (isDelegate ? "Delegate User" : "Parent User")}
            </p>
            <p className="text-[0.72rem] text-white/40 truncate font-body">
              {isDelegate ? "Delegate account" : "Parent account"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 text-[0.82rem] transition-all duration-150 font-body"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
