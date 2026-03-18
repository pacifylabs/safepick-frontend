"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-[var(--bg-page)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-4">
            PRICING
          </p>
          <h2 className="font-display text-[3rem] font-semibold text-[var(--text-primary)]">
            Simple, transparent pricing
          </h2>
          <p className="font-body text-[1.125rem] text-[var(--text-secondary)] mt-4">
            Start free. Upgrade as your school grows.
          </p>

          {/* Toggle Row */}
          <div className="flex items-center gap-3 justify-center mt-10">
            <span className={`font-body text-[0.875rem] transition-colors ${!isYearly ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6 rounded-full bg-[#0FA37F] transition-colors focus:outline-none"
            >
              <motion.div
                animate={{ x: isYearly ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full"
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`font-body text-[0.875rem] transition-colors ${isYearly ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>
                Yearly
              </span>
              <span className="bg-[#E1F5EE] text-[#0FA37F] rounded-full px-2 py-0.5 text-[0.65rem] font-bold">
                SAVE 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {/* Card 1 — Starter */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 flex flex-col h-full">
            <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              STARTER
            </p>
            <div className="mb-2">
              <span className="font-display text-[3rem] font-semibold text-[var(--text-primary)]">Free</span>
            </div>
            <p className="font-body text-[0.875rem] text-[var(--text-secondary)] mb-8">
              For individual families
            </p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "1 child",
                "Up to 3 delegates",
                "QR + OTP verification",
                "Real-time notifications",
                "Basic attendance log",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#0FA37F] flex-shrink-0" />
                  <span className="font-body text-[0.875rem] text-[var(--text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup" className="w-full">
              <Button
                variant="outline"
                className="w-full border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] py-6 rounded-2xl font-body font-semibold"
              >
                Get started free
              </Button>
            </Link>
          </div>

          {/* Card 2 — Family (HIGHLIGHTED) */}
          <div className="bg-[#0B1A2C] border border-[#0FA37F]/20 rounded-3xl p-8 relative overflow-hidden flex flex-col h-full shadow-2xl scale-105 z-10">
            <div className="absolute top-4 right-4 bg-[#0FA37F] rounded-full px-3 py-1">
              <span className="font-body text-[0.65rem] font-bold text-white tracking-widest">MOST POPULAR</span>
            </div>
            
            <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-4">
              FAMILY
            </p>
            <div className="mb-2 flex items-baseline">
              <span className="font-display text-[3rem] font-semibold text-white">
                {isYearly ? "₦3,999" : "₦4,999"}
              </span>
              <span className="font-body text-[0.875rem] text-white/40 ml-2">/ month</span>
            </div>
            <p className="font-body text-[0.875rem] text-white/60 mb-8">
              For families with multiple children
            </p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Up to 5 children",
                "Unlimited delegates",
                "Secondary guardian alerts",
                "Emergency override codes",
                "Full attendance history",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#0FA37F] flex-shrink-0" />
                  <span className="font-body text-[0.875rem] text-white/70">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup" className="w-full">
              <Button
                variant="primary"
                className="w-full bg-[#0FA37F] text-white hover:bg-[#1D9E75] border-none py-6 rounded-2xl font-body font-semibold"
              >
                Get Family plan
              </Button>
            </Link>
          </div>

          {/* Card 3 — School */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 flex flex-col h-full">
            <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              SCHOOL
            </p>
            <div className="mb-2">
              <span className="font-display text-[3rem] font-semibold text-[var(--text-primary)]">Custom</span>
            </div>
            <p className="font-body text-[0.875rem] text-[var(--text-secondary)] mb-8">
              For schools and institutions
            </p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Unlimited children",
                "School admin dashboard",
                "Gate kiosk app",
                "Bulk enrollment",
                "Analytics & reporting",
                "Dedicated support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#0FA37F] flex-shrink-0" />
                  <span className="font-body text-[0.875rem] text-[var(--text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="mailto:schools@safepick.io" className="w-full">
              <Button
                variant="primary"
                className="w-full bg-[#0B1A2C] text-white hover:bg-[#1a2b3c] border-none py-6 rounded-2xl font-body font-semibold"
              >
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
