"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface QuickAccessCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  meta: string;
  onClick: () => void;
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  meta,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-black/[0.06] cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <div
        className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="font-body text-[0.875rem] font-semibold text-[#0B1A2C] mb-1">
        {title}
      </p>
      <p className="font-body text-[0.75rem] text-[#6B7280]">{meta}</p>
    </motion.div>
  );
};
