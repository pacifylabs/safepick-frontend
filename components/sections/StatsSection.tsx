"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const stats = [
  { target: 12000, suffix: "+", label: "Children protected", decimal: false },
  { target: 340, suffix: "+", label: "Schools onboarded", decimal: false },
  { target: 98, suffix: "%", label: "Pickup accuracy", decimal: false },
  { target: 2.4, suffix: "s", label: "Avg verify time", decimal: true },
];

function Counter({ target, duration, inView, decimal }: { target: number; duration: number; inView: boolean; decimal: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(easedProgress * target);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, target, duration]);

  return (
    <span className="font-display text-[3rem] md:text-[4rem] font-semibold text-white leading-none tabular-nums">
      {decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}
    </span>
  );
}

export function StatsSection() {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section className="py-24 bg-[#0B1A2C]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-4">
            BY THE NUMBERS
          </p>
          <h2 className="font-display text-[3rem] text-white font-semibold leading-tight">
            SafePick by the numbers
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-baseline justify-center">
                <Counter 
                  target={stat.target} 
                  duration={2000} 
                  inView={inView} 
                  decimal={stat.decimal} 
                />
                <span className="font-display text-[2rem] md:text-[2.5rem] font-semibold text-[#0FA37F] ml-1">
                  {stat.suffix}
                </span>
              </div>
              <p className="font-body text-[0.875rem] text-white/50 mt-2 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
