"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1A2C] px-6 text-center relative overflow-hidden">
      {/* TOP: Logo */}
      <div className="absolute top-0 left-0 p-8">
        <Logo
          variant="light"
          size="sm"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push("/dashboard")}
        />
      </div>

      {/* CENTER CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10"
      >
        {/* Large 404 display */}
        <h1 className="font-display text-[8rem] md:text-[12rem] font-semibold leading-none tracking-tight bg-gradient-to-b from-white/80 to-white/10 bg-clip-text text-transparent select-none">
          404
        </h1>

        {/* Teal divider line */}
        <div className="w-12 h-1 bg-[#0FA37F] rounded-full mx-auto my-6" />

        {/* Heading */}
        <h2 className="font-display text-[1.75rem] font-semibold text-white mb-3">
          Page not found
        </h2>

        {/* Subtext */}
        <p className="font-body text-[0.9375rem] text-white/50 max-w-[320px] mx-auto leading-relaxed mb-10">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        {/* Buttons row */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => router.push("/dashboard")}
            className="bg-[#0FA37F] hover:bg-[#1D9E75]"
          >
            Back to dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white/50 hover:text-white"
          >
            Go back
          </Button>
        </div>
      </motion.div>

      {/* BOTTOM: Branded footer */}
      <div className="absolute bottom-8 left-0 right-0">
        <p className="font-body text-[0.72rem] text-white/20 text-center tracking-widest uppercase">
          SafePick · Child Safety Platform
        </p>
      </div>

      {/* Background decorative elements (optional but matching design system) */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-teal/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
