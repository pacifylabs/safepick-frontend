"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  UserPlus, 
  Users, 
  QrCode, 
  CheckCircle 
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Parent registers child",
    description: "Add your child's details and link them to their school.",
    icon: UserPlus,
  },
  {
    number: 2,
    title: "Invite a delegate",
    description: "Send an invite to your driver, nanny or family member. They verify their identity via KYC.",
    icon: Users,
  },
  {
    number: 3,
    title: "Delegate shows QR at gate",
    description: "The delegate displays their dynamic QR code. School staff scans it at the gate.",
    icon: QrCode,
  },
  {
    number: 4,
    title: "You approve in one tap",
    description: "You receive a push notification and approve or deny the release from anywhere in real time.",
    icon: CheckCircle,
  },
];

export function HowItWorksSection() {
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: true,
  });

  return (
    <section id="how-it-works" className="py-24 bg-[var(--bg-surface)]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-4">
            HOW IT WORKS
          </p>
          <h2 className="font-display text-[3rem] font-semibold text-[var(--text-primary)]">
            Safe pickup in four steps
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-0 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex-1 text-center px-6 relative z-10"
            >
              {/* Connector Line (Desktop) */}
              {index > 0 && (
                <div className="hidden md:block absolute left-[-50%] top-6 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0FA37F]/30 to-transparent -z-10" />
              )}

              {/* Step Number Circle */}
              <div className="w-12 h-12 rounded-full bg-[#0FA37F] mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#0FA37F]/20">
                <span className="font-display text-[1.25rem] font-semibold text-white">
                  {step.number}
                </span>
              </div>

              {/* Step Icon */}
              <step.icon className="text-[var(--text-secondary)] w-8 h-8 mx-auto mb-4" />

              {/* Step Heading */}
              <h3 className="font-body text-[0.9375rem] font-bold text-[var(--text-primary)] mb-3">
                {step.title}
              </h3>

              {/* Step Body */}
              <p className="font-body text-[0.82rem] text-[var(--text-secondary)] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
