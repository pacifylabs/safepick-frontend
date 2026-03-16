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
  History
} from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: boolean;
}

interface MobileNavProps {
  items?: NavItem[];
  role?: "PARENT" | "DELEGATE";
}

const defaultNavItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/children", icon: Users, label: "Children" },
  { href: "/dashboard/delegates", icon: UserCheck, label: "Delegates" },
  { href: "/dashboard/attendance", icon: CalendarCheck, label: "History" },
  { href: "/dashboard/emergency", icon: ShieldAlert, label: "Panic" },
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/5 flex items-center justify-around px-2 py-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
              isActive ? "text-teal" : "text-muted"
            }`}
          >
            <Icon size={20} />
            <span className="font-body text-[0.62rem] font-medium">{item.label}</span>
            {item.badge && (
              <div className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-teal" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
