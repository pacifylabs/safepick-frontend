"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "FAQ", href: "#faq" },
  { name: "Pricing", href: "#pricing" },
];

export function LandingNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--border)]"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/">
          <Logo variant="dark" className="dark:!text-[var(--text-primary)]" />
        </Link>

        {/* Center: Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[0.875rem] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: ThemeToggle + Get Started */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/signup"
            className="bg-[#0FA37F] text-white rounded-full px-6 py-2.5 text-[0.875rem] font-medium hover:bg-[#1D9E75] transition-colors duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[var(--text-primary)]"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--border)] overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[1rem] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="bg-[#0FA37F] text-white rounded-full px-6 py-3 text-[1rem] font-medium text-center hover:bg-[#1D9E75] mt-2"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
