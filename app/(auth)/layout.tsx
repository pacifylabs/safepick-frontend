import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function AuthLayout(props: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-navy flex flex-col items-center justify-center overflow-x-hidden">
      {/* Fixed background decorations that won't cause overflow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-teal/10 blur-[120px] translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full bg-teal/5 blur-[100px] -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-20">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo variant="light" size="md" />
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-all group"
        >
          <span className="sm:inline hidden">Back to home</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-teal group-hover:bg-teal/10 transition-all">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        </Link>
      </div>

      <main className="relative z-10 w-full flex-grow flex items-center justify-center px-4 py-12 sm:py-20">
        {props.children}
      </main>
    </div>
  );
}
