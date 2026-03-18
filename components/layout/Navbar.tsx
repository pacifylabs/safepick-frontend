"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { NavLink } from "@/types";

const navLinks: NavLink[] = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "For schools", href: "#schools" },
    { label: "Pricing", href: "#pricing" }
];

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-surface-2)]/90 backdrop-blur-md border-b border-[var(--border-strong)]">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </span>
                    <span className="text-[var(--text-primary)] font-bold text-lg tracking-tight">SafePick</span>
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm text-[var(--text-secondary)]/70 font-medium hover:text-[var(--text-primary)] transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <a href="/login" className="text-sm text-[var(--text-secondary)]/70 font-medium hover:text-[var(--text-primary)] transition-colors">
                        Log in
                    </a>
                    <Button variant="primary" size="sm" href="/signup">
                        Get started
                    </Button>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Toggle menu"
                >
                    <div className="w-5 flex flex-col gap-1">
                        <span className={`block h-0.5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                        <span className={`block h-0.5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                        <span className={`block h-0.5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-[var(--bg-surface-2)] border-t border-[var(--border-strong)] px-6 pb-6 pt-4 flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm text-[var(--text-secondary)]/80 font-medium"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <Button variant="primary" size="sm" href="/signup" fullWidth>
                        Get started
                    </Button>
                </div>
            )}
        </header>
    );
}
