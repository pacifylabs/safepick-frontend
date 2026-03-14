"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CalendarCheck, 
  ShieldAlert 
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/children", icon: Users, label: "Children" },
  { href: "/dashboard/delegates", icon: UserCheck, label: "Delegates" },
  { href: "/dashboard/attendance", icon: CalendarCheck, label: "History" },
  { href: "/dashboard/emergency", icon: ShieldAlert, label: "Panic" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/5 flex items-center justify-around px-2 py-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              isActive ? "text-teal" : "text-muted"
            }`}
          >
            <Icon size={20} />
            <span className="font-body text-[0.62rem] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
