"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  QrCode, 
  Bell, 
  Users, 
  Shield, 
  CalendarDays, 
  AlertTriangle 
} from "lucide-react";

const features = [
  {
    title: "QR + OTP Verification",
    description: "Dynamic QR codes expire every 15 minutes. OTP and biometric fallback ensure no delegate is ever turned away wrongly.",
    icon: QrCode,
    bg: "bg-[#E1F5EE]",
    color: "text-[#0FA37F]",
  },
  {
    title: "Instant Parent Approval",
    description: "Get a push notification the moment your child's delegate arrives at the gate. Approve or deny in one tap — from anywhere.",
    icon: Bell,
    bg: "bg-[#0FA37F]/20",
    color: "text-[#0FA37F]",
    highlight: true,
  },
  {
    title: "KYC-Verified Delegates",
    description: "Every delegate submits identity documents before they are authorized. Parents approve each delegate with custom day and time rules.",
    icon: Users,
    bg: "bg-[#FAEEDA]",
    color: "text-[#EF9F27]",
  },
  {
    title: "Secondary Guardian Fallback",
    description: "If you miss a pickup notification, your trusted emergency contact is automatically alerted via SMS or WhatsApp.",
    icon: Shield,
    bg: "bg-[#F0EAF8]",
    color: "text-[#7C3AED]",
  },
  {
    title: "Drop-off & Clock-out Log",
    description: "Every arrival and departure is timestamped and logged. View your child's full attendance history anytime.",
    icon: CalendarDays,
    bg: "bg-[#E1F5EE]",
    color: "text-[#0FA37F]",
  },
  {
    title: "Emergency Override & Panic",
    description: "Generate one-time override codes for schools. Trigger a panic button to instantly suspend all delegate access.",
    icon: AlertTriangle,
    bg: "bg-[#FAECE7]",
    color: "text-[#D85A30]",
  },
];

export function FeaturesSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section id="features" className="py-24 bg-[var(--bg-page)]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-4">
            WHAT SAFEPICK DOES
          </p>
          <h2 className="font-display text-[3rem] font-semibold text-[var(--text-primary)] max-w-[600px] mx-auto leading-tight">
            Every layer of security, working together
          </h2>
          <p className="font-body text-[1rem] text-[var(--text-secondary)] max-w-[520px] mx-auto mt-4 leading-relaxed">
            From delegate verification to real-time parent approval — SafePick secures every step of the school pickup process.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`relative p-8 rounded-3xl border transition-shadow duration-300 hover:shadow-xl ${
                feature.highlight
                  ? "bg-[#0B1A2C] border-[#0FA37F]/20"
                  : "bg-[var(--bg-surface)] border-[var(--border)]"
              }`}
            >
              {feature.highlight && (
                <div className="absolute top-6 right-6 bg-[#0FA37F] rounded-full px-3 py-1 text-[0.65rem] font-bold text-white tracking-widest">
                  REAL-TIME
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feature.bg}`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>

              <h3 className={`font-body text-[1.125rem] font-bold mt-6 mb-3 ${
                feature.highlight ? "text-white" : "text-[var(--text-primary)]"
              }`}>
                {feature.title}
              </h3>

              <p className={`font-body text-[0.875rem] leading-relaxed ${
                feature.highlight ? "text-white/60" : "text-[var(--text-secondary)]"
              }`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
