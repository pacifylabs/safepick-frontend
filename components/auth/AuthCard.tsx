"use client";
import { motion } from "framer-motion";
import React from "react";

export interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={[
        "w-full max-w-[420px] mx-auto p-8 rounded-[24px]",
        "border border-white/10",
        "bg-white/5",
        className || ""
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}

export default AuthCard;
