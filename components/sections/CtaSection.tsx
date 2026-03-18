"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-24 bg-[#0B1A2C] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0FA37F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#EF9F27]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-4">
          GET STARTED
        </p>
        <h2 className="font-display text-[3.5rem] text-white font-semibold max-w-[600px] mx-auto leading-tight">
          Your child's safety starts with one tap.
        </h2>
        <p className="font-body text-[1rem] text-white/50 max-w-[480px] mx-auto mt-6 mb-10 leading-relaxed">
          Join thousands of parents who trust SafePick to protect their children at school pickup every day.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup">
            <motion.div whileHover={{ scale: 1.03 }}>
              <Button
                variant="primary"
                className="bg-[#0FA37F] text-white rounded-full px-10 py-4 font-display text-[1rem] font-semibold hover:bg-[#1D9E75] border-none h-auto"
              >
                Create free account
              </Button>
            </motion.div>
          </Link>
          <Link href="#features">
            <Button
              variant="outline"
              className="border border-white/20 text-white/70 rounded-full px-10 py-4 font-body text-[1rem] font-medium hover:bg-white/5 h-auto"
            >
              Learn more
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
