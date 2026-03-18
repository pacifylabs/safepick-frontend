"use client";

import React from "react";
import { motion } from "framer-motion";

const schools = [
  "Greenfield Academy",
  "Sunrise Montessori",
  "Bright Future School",
  "Lagos Prep",
  "Abuja Academy",
  "Gold Coast Primary",
  "Heritage School",
  "Rainbow Kids",
  "Eagle Eye Academy",
];

export function TrustedBySection() {
  return (
    <section className="bg-[var(--bg-surface)] border-y border-[var(--border)] py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)] mb-8">
          TRUSTED BY SCHOOLS ACROSS AFRICA
        </p>
        
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-6 items-center">
            {[...schools, ...schools].map((school, index) => (
              <div
                key={`${school}-${index}`}
                className="bg-[var(--bg-muted)] rounded-full px-6 py-2.5 font-body text-[0.82rem] text-[var(--text-secondary)] whitespace-nowrap"
              >
                {school}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
