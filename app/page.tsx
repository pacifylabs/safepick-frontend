"use client";

import React from "react";
import { LandingNav } from "@/components/sections/LandingNav";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustedBySection } from "@/components/sections/TrustedBySection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { LandingFooter } from "@/components/sections/LandingFooter";

export default function LandingPage() {
  return (
    <div className="bg-[var(--bg-page)] overflow-x-hidden min-h-screen selection:bg-[#0FA37F]/30 selection:text-[var(--text-primary)]">
      <LandingNav />
      
      <main>
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
