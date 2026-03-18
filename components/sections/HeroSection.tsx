"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

const heroImageUrl = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=80";

export function HeroSection() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen flex items-center bg-[var(--bg-page)] pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-0">
        {/* LEFT COLUMN */}
        <div className="flex-1 pr-0 md:pr-16 text-center md:text-left">
          {/* Section Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#0FA37F]/10 border border-[#0FA37F]/20 rounded-full px-4 py-2 mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-[#0FA37F]" />
            <span className="text-[0.78rem] font-medium text-[#0FA37F] font-body">
              Trusted child pickup verification platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-[3.5rem] md:text-[5rem] font-semibold text-[var(--text-primary)] leading-[1.0] tracking-[-0.03em] mb-6"
          >
            Every pickup,<br />
            <span className="italic text-[#0FA37F]">verified.</span><br />
            Every child,<br />
            safe.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-[1.125rem] text-[var(--text-secondary)] max-w-[480px] mx-auto md:mx-0 leading-relaxed mb-8"
          >
            SafePick gives parents real-time control over who picks up their child from school. Delegates, QR codes, and instant approval — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center md:justify-start gap-4 mb-10"
          >
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.03 }}>
                <Button
                  variant="primary"
                  className="bg-[#0FA37F] text-white rounded-full px-8 py-4 font-display text-[1rem] font-semibold hover:bg-[#1D9E75] border-none"
                >
                  Protect your child →
                </Button>
              </motion.div>
            </Link>
            <Button
              variant="outline"
              onClick={scrollToHowItWorks}
              className="bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] rounded-full px-8 py-4 font-body text-[0.9375rem] font-medium hover:bg-[var(--bg-muted)]"
            >
              See how it works
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-10"
          >
            {[
              "No account needed for schools",
              "Real-time parent approval",
              "KYC-verified delegates",
            ].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0FA37F]" />
                <span className="font-body text-[0.82rem] text-[var(--text-secondary)]">
                  {badge}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative w-full"
        >
          {/* Image Container */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative rounded-[32px] overflow-hidden h-[500px] md:h-[700px] shadow-2xl"
          >
            <Image
              src={heroImageUrl}
              alt="Parent holding child's hand walking to school"
              width={900}
              height={700}
              priority
              className="object-cover w-full h-full"
            />
          </motion.div>

          {/* Floating Stat Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="absolute -left-4 md:-left-8 bottom-12 md:bottom-24 bg-[var(--bg-surface)] rounded-2xl p-4 shadow-xl border border-[var(--border)] flex items-center gap-3 z-10"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center">
              <ShieldCheck className="text-[#0FA37F] w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-[1.5rem] font-semibold text-[var(--text-primary)] leading-none">98%</p>
              <p className="font-body text-[0.72rem] text-[var(--text-secondary)] mt-1">Pickup accuracy</p>
            </div>
          </motion.div>

          {/* Floating Stat Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="absolute -right-2 md:-right-4 top-16 bg-[var(--bg-surface)] rounded-2xl p-4 shadow-xl border border-[var(--border)] flex items-center gap-3 z-10"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAEEDA] flex items-center justify-center">
              <QrCode className="text-[#EF9F27] w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-[1.5rem] font-semibold text-[var(--text-primary)] leading-none">2.4s</p>
              <p className="font-body text-[0.72rem] text-[var(--text-secondary)] mt-1">Avg verification</p>
            </div>
          </motion.div>

          {/* Floating Notification Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="absolute left-4 top-20 bg-[#0B1A2C] rounded-2xl p-3 shadow-xl flex items-center gap-3 z-10 border border-white/5"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 bg-[#0FA37F] rounded-full"
            />
            <div>
              <p className="font-body text-[0.72rem] text-white font-medium">Pickup approved</p>
              <p className="font-body text-[0.65rem] text-white/50">Zara · Greenfield Academy</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
