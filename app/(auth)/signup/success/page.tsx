"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

import { useAuthStore } from "@/stores/auth.store";

export default function SignupSuccessPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [countdown, setCountdown] = useState(4);
  const firstName = user?.fullName?.split(" ")[0] || "there";

  useEffect(() => {
    // Try to get user name from some storage or state if needed, but here we just mock
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <AuthCard>
      <div className="relative mb-6 sm:mb-8 flex h-20 sm:h-24 w-full items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center"
        >
          <div className="absolute inset-0 animate-[ping_2s_infinite] rounded-full border-2 border-teal/30" />
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-teal/20 text-teal shadow-[0_0_20px_rgba(15,163,127,0.3)]">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="sm:w-7 sm:h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </motion.div>
      </div>

      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold leading-tight text-white">
          You're all set, <br />
          <span className="text-teal-mid">{firstName}!</span>
        </h1>
        <p className="mt-3 sm:mt-4 font-body text-[0.9rem] sm:text-[0.95rem] leading-relaxed text-white/50">
          Welcome to SafePick. Let's register your first child.
        </p>
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={() => router.push("/dashboard/children/new")}
        className="mt-2 sm:mt-4"
      >
        Register my first child
      </Button>

      <div className="mt-8 sm:mt-10 flex flex-col items-center">
        <p className="mb-2 sm:mb-3 text-[0.7rem] sm:text-[0.75rem] font-medium tracking-wide text-white/30">
          Taking you to dashboard in {countdown}s
        </p>
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 4, ease: "linear" }}
            className="h-full bg-teal"
          />
        </div>
      </div>
    </AuthCard>
  );
}
