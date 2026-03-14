"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full max-w-[420px] mx-auto bg-white/5 border border-white/10 rounded-[24px] p-6 sm:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default AuthCard;
