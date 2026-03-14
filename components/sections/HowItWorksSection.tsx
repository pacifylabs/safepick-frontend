import { SectionLabel } from "@/components/ui/SectionLabel";
import type { HowItWorksItem } from "@/types";

const steps: HowItWorksItem[] = [
    {
        id: "register",
        step: 1,
        icon: "👨‍👩‍👧",
        title: "Register your child",
        description:
            "Create a profile, link to your school, and add a mandatory secondary guardian. Takes less than 3 minutes."
    },
    {
        id: "invite",
        step: 2,
        icon: "🔗",
        title: "Invite & verify delegates",
        description:
            "Send a secure link to anyone who may ever collect your child. They complete a one-time KYC — you approve per child."
    },
    {
        id: "pickup",
        step: 3,
        icon: "📲",
        title: "Pickup day — you're in control",
        description:
            "The delegate scans in at the gate. You get a real-time notification and approve with one tap. Logged and done."
    },
    {
        id: "audit",
        step: 4,
        icon: "📊",
        title: "Review the full history",
        description:
            "Every pickup is in your timeline — who, when, how verified. Always visible, always downloadable."
    }
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 bg-navy relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-teal/5 blur-[60px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="max-w-2xl mb-16">
                    <SectionLabel light>How it works</SectionLabel>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                        Everything a parent actually needs
                    </h2>
                    <p className="text-white/60 leading-relaxed">
                        SafePick is designed around the reality of school life — not just ideal conditions. Four simple steps. Zero gaps.
                    </p>
                </div>

                {/* Steps grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-teal/30 transition-all duration-300"
                        >
                            {/* Step number */}
                            <div className="absolute top-6 right-6 text-xs font-bold text-white/20 group-hover:text-teal/40 transition-colors">
                                {String(step.step).padStart(2, "0")}
                            </div>

                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl bg-teal/15 border border-teal/20 flex items-center justify-center text-2xl mb-5">
                                {step.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-sm text-white/60 leading-relaxed">{step.description}</p>

                            {/* Teal accent line on hover */}
                            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-teal scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Bottom connector hint */}
                <div className="mt-16 flex items-center justify-center gap-3">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal/20 border border-teal/30 flex items-center justify-center text-xs font-bold text-teal">
                                {step.step}
                            </div>
                            {i < steps.length - 1 && (
                                <div className="w-10 h-0.5 bg-white/10" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
