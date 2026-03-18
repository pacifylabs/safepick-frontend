"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CalendarCheck, 
  ShieldAlert,
  LucideIcon,
  Home,
  Calendar,
  Bell,
  Building,
  History,
  FolderOpen,
  MapPin,
  ShieldCheck,
  Users2,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: boolean;
  disabled?: boolean;
}

interface MobileNavProps {
  items?: NavItem[];
  role?: "PARENT" | "DELEGATE";
}

const defaultNavItems: NavItem[] = [
  { href: "/dashboard/children", icon: FolderOpen, label: "Children" },
  { href: "/dashboard/delegates", icon: ShieldCheck, label: "Delegates" },
  { href: "/dashboard/secondary-guardians", icon: Users2, label: "Guardians" },
  { href: "/dashboard/pickups", icon: Bell, label: "Pickups" },
  { href: "/dashboard/attendance", icon: CalendarCheck, label: "Attendance" },
  { href: "/dashboard/emergency", icon: ShieldAlert, label: "Emergency" },
  { href: "/dashboard/track", icon: MapPin, label: "Track", disabled: true },
];

const defaultDelegateItems: NavItem[] = [
  { href: "/delegate/dashboard", icon: Home, label: "Home" },
  { href: "/delegate/children", icon: Users, label: "Children" },
  { href: "/delegate/schedule", icon: Calendar, label: "Schedule" },
  { href: "/delegate/pickups", icon: Bell, label: "Pickups", badge: true },
  { href: "/delegate/audit", icon: History, label: "Activity" },
];

export function MobileNav({ items, role = "PARENT" }: MobileNavProps) {
  const pathname = usePathname();
  const navItems = items || (role === "DELEGATE" ? defaultDelegateItems : defaultNavItems);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-t border-[var(--border)] flex items-center justify-around px-2 py-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => item.disabled && e.preventDefault()}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
              item.disabled 
                ? "opacity-40 cursor-not-allowed pointer-events-none" 
                : isActive ? "text-teal" : "text-[var(--text-secondary)]"
            }`}
          >
            <Icon size={20} />
            <span className="font-body text-[0.62rem] font-medium">{item.label}</span>
            {item.badge && (
              <div className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-teal" />
            )}
            {item.disabled && (
              <div className="absolute -top-1 -right-1 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-full px-1 py-0 text-[0.45rem] font-medium">
                Soon
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
