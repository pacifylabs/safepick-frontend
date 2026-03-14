"use client";

import { Button } from "@/components/ui/Button";

export function CtaSection() {
    return (
        <section id="waitlist" className="py-24 bg-navy relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[300px] rounded-full bg-teal/15 blur-[120px]" />
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal/10 blur-[80px] pointer-events-none" />

            <div className="relative max-w-3xl mx-auto px-6 text-center">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 bg-teal/15 border border-teal/30 rounded-full px-4 py-1.5 mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                    <span className="text-xs font-semibold text-teal tracking-widest uppercase">Early access open</span>
                </div>

                {/* Headline */}
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                    Be the first to register your child with{" "}
                    <span className="text-teal">SafePick</span>
                </h2>

                {/* Sub-copy */}
                <p className="text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                    Join thousands of parents and schools on the waitlist. We'll notify you the moment SafePick launches at your child's school.
                </p>

                {/* Email form */}
                <form
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-teal focus:bg-white/15 transition-all"
                    />
                    <Button variant="primary" size="md" type="submit" className="whitespace-nowrap">
                        Join waitlist →
                    </Button>
                </form>

                {/* Social proof */}
                <p className="mt-6 text-xs text-white/40">
                    No spam. No credit card. Unsubscribe any time.
                </p>

                {/* Floating trust badges */}
                <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
                    {[
                        { icon: "🔒", label: "End-to-end encrypted" },
                        { icon: "🏫", label: "School-first design" },
                        { icon: "✅", label: "KYC-verified delegates" }
                    ].map((badge) => (
                        <div key={badge.label} className="flex items-center gap-2">
                            <span className="text-base">{badge.icon}</span>
                            <span className="text-xs text-white/50 font-medium">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
