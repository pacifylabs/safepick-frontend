"use client";

import { Bell } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/auth.store";

export function TopHeader() {
  const user = useAuthStore((state: { user: any; }) => state.user);
  const notificationCount = 0; // Mock

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: any[]) => n[0]).join("").toUpperCase()
    : "??";

  return (
    <header className="bg-white border-b border-black/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Logo variant="dark" size="sm" />
        </div>
        <h1 className="hidden md:block font-body text-[1rem] font-medium text-navy">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center relative cursor-pointer hover:bg-[#E8E6E1] transition-colors">
          <Bell size={16} className="text-navy" />
          {notificationCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral flex items-center justify-center text-[0.6rem] font-medium text-white font-body">
              {notificationCount > 9 ? "9+" : notificationCount}
            </div>
          )}
        </button>

        <button className="w-9 h-9 rounded-xl overflow-hidden cursor-pointer bg-teal-mid flex items-center justify-center text-[0.75rem] font-medium text-white font-body">
          {initials}
        </button>
      </div>
    </header>
  );
}
