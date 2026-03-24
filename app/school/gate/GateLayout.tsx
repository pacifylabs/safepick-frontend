"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { History } from "lucide-react";

export function GateLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0B1A2C] overflow-hidden flex flex-col font-body selection:bg-[#0FA37F]/30">
      {/* TOP BAR */}
      <header className="px-8 py-5 border-b border-white/10 flex items-center justify-between z-50 bg-[#0B1A2C]">
        <div className="flex items-center gap-4">
          <Logo variant="light" className="h-8" />
          <div className="w-px h-6 bg-white/10 mx-2" />
          <span className="text-white/40 uppercase tracking-[0.2em] text-[0.7rem] font-bold">Gate Terminal</span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-white font-display text-[1.25rem] font-semibold tracking-wider uppercase">
            Gate Verification
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            href="/school/audit" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group"
          >
            <History className="w-4 h-4 group-hover:text-[#0FA37F] transition-colors" />
            <span className="text-[0.75rem] font-bold uppercase tracking-widest">Audit Log</span>
          </Link>
          <div className="text-right">
            <p className="text-white font-mono text-[1.1rem] font-bold leading-none">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
            <p className="text-white/30 text-[0.75rem] uppercase font-bold tracking-widest mt-1">St. Jude's Primary</p>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      {/* BOTTOM BAR */}
      <footer className="px-8 py-4 border-t border-white/10 flex items-center justify-between bg-[#0B1A2C] z-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#0FA37F] animate-pulse" />
          <span className="text-white/40 font-bold text-[0.75rem] uppercase tracking-widest">SafePick Gate · Live</span>
        </div>
        
        <div className="text-white/20 font-bold text-[0.75rem] uppercase tracking-widest">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </footer>
    </div>
  );
}
