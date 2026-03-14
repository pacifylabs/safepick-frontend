"use client";

import React from "react";
import { motion } from "framer-motion";

interface AdoptionProgressProps {
  requestCount: number;
  threshold: number;
  schoolName: string;
}

export const AdoptionProgress: React.FC<AdoptionProgressProps> = ({
  requestCount,
  threshold,
  schoolName,
}) => {
  const percentage = Math.min(Math.round((requestCount / threshold) * 100), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="font-body text-[0.78rem] text-[#6B7280]">
          {requestCount} of {threshold} parents requested
        </p>
        <p className="font-body text-[0.78rem] font-medium text-[#0B1A2C]">
          {percentage}%
        </p>
      </div>
      <div className="w-full h-2 bg-[#F2F0EB] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#EF9F27] rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="font-body text-[0.72rem] text-[#6B7280] mt-1.5">
        {Math.max(threshold - requestCount, 0)} more parents needed to trigger school onboarding
      </p>
    </div>
  );
};
