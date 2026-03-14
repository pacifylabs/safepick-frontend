"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/auth.store";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CalendarCheck, 
  ShieldAlert,
  LogOut
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/children", icon: Users, label: "My Children" },
  { href: "/dashboard/delegates", icon: UserCheck, label: "Delegates" },
  { href: "/dashboard/attendance", icon: CalendarCheck, label: "Attendance" },
  { href: "/dashboard/emergency", icon: ShieldAlert, label: "Emergency", emergency: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()
    : "??";

  return (
    <div className="hidden md:flex w-[240px] flex-shrink-0 bg-navy min-h-screen flex-col sticky top-0 h-screen overflow-y-auto">
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
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-[0.875rem] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-teal/15 text-teal border-l-2 border-teal"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.emergency && (
                  <div className="w-2 h-2 rounded-full bg-coral ml-auto" />
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
              {user?.fullName || "Parent User"}
            </p>
            <p className="text-[0.72rem] text-white/40 truncate font-body">
              Parent account
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
