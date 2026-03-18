"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I used to worry every day at 3pm. SafePick changed that. I get a notification the moment David arrives at the gate and I approve from my office.",
    author: "Amara Osei",
    role: "Parent · Lagos",
    initials: "AO",
  },
  {
    quote: "Our school has completely eliminated unauthorized pickups. The QR system is fast, the parents love it, and our staff feel confident.",
    author: "Mrs. Adeola Bello",
    role: "School Administrator · Abuja",
    initials: "AB",
  },
  {
    quote: "As a driver for three different families, the SafePick app keeps my schedule organized and my QR code always ready. Very professional.",
    author: "David Mensah",
    role: "Authorized Delegate · Accra",
    initials: "DM",
  },
];

export function TestimonialsSection() {
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: true,
  });

  return (
    <section className="py-24 bg-[var(--bg-page)]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-4">
            WHAT PARENTS SAY
          </p>
          <h2 className="font-display text-[3rem] font-semibold text-[var(--text-primary)]">
            Trusted by families
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 transition-shadow duration-300 hover:shadow-xl"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#EF9F27] text-[#EF9F27]" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-body text-[0.9375rem] text-[var(--text-secondary)] leading-relaxed mb-8 italic">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0B1A2C] flex items-center justify-center text-white font-display text-[0.875rem] font-semibold">
                  {t.initials}
                </div>
                <div>
                  <p className="font-body text-[0.875rem] font-bold text-[var(--text-primary)]">
                    {t.author}
                  </p>
                  <p className="font-body text-[0.75rem] text-[var(--text-secondary)]">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
