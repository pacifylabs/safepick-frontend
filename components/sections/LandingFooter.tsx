"use client";

import React from "react";
import { Logo } from "@/components/ui/Logo";
import { Twitter, Instagram, Linkedin, Facebook } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Download", href: "#" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Contact", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "Security", href: "#" },
  ],
};

const socialIcons = [
  { icon: Twitter, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Facebook, href: "#" },
];

export function LandingFooter() {
  return (
    <footer className="bg-[var(--bg-sidebar)] py-16 px-[5%] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-10 mb-16">
          {/* Col 1 — Brand */}
          <div className="flex flex-col items-start">
            <Logo variant="light" className="mb-6" />
            <p className="font-body text-[0.875rem] text-white/40 max-w-[220px] leading-relaxed">
              Real-time child pickup verification for parents, schools, and delegates.
            </p>
            <div className="flex gap-3 mt-8">
              {socialIcons.map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-white/40 hover:text-white"
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Col 2 — Product */}
          <div>
            <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-white/30 mb-6">
              PRODUCT
            </p>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-white font-body text-[0.875rem] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-white/30 mb-6">
              COMPANY
            </p>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-white font-body text-[0.875rem] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal */}
          <div>
            <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-white/30 mb-6">
              LEGAL
            </p>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-white font-body text-[0.875rem] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 gap-4">
          <p className="font-body text-[0.75rem] text-white/25">
            © 2025 SafePick. All rights reserved.
          </p>
          <p className="font-body text-[0.75rem] text-white/25">
            Built for African families.
          </p>
        </div>
      </div>
    </footer>
  );
}
