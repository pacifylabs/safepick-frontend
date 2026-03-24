"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function AuthNavbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 w-full px-6 py-5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 group no-underline">
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors duration-200">
          <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors duration-200" />
        </div>
        <Logo variant="light" size="sm" />
      </Link>
    </nav>
  );
}

export default AuthNavbar;
