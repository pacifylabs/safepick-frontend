import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { FeatureCard } from "@/types";

const features: FeatureCard[] = [
    {
        id: "qr-verification",
        icon: "📱",
        title: "Dynamic QR Verification",
        description:
            "Delegates present a time-bound QR code at the gate. Expires in seconds — impossible to share or screenshot."
    },
    {
        id: "real-time-auth",
        icon: "🔔",
        title: "Real-Time Parent Approval",
        description:
            "You get an instant push + SMS the moment a delegate arrives. One tap to approve or deny from anywhere."
    },
    {
        id: "delegate-kyc",
        icon: "🪪",
        title: "KYC-Verified Delegates",
        description:
            "Approved once, trusted always. Every delegate is ID-verified before they can ever collect your child."
    },
    {
        id: "secondary-guardian",
        icon: "👥",
        title: "Secondary Guardian Cover",
        description:
            "Can't respond in time? Your secondary guardian automatically steps in — no one is left waiting."
    },
    {
        id: "audit-trail",
        icon: "📋",
        title: "Full Audit Trail",
        description:
            "Every pickup is timestamped, logged, and encrypted. Export the full history any time you need it."
    },
    {
        id: "panic-controls",
        icon: "🚨",
        title: "Emergency Lockdown",
        description:
            "One tap to suspend all delegate access instantly. The school is notified and your child is held safely."
    }
];

function FeatureCardItem({ icon, title, description }: FeatureCard) {
    return (
        <Card hover className="flex flex-col h-full">
            <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-sand-300 flex items-center justify-center text-xl mb-4">
                    {icon}
                </div>
                <h3 className="text-base font-bold text-navy">{title}</h3>
            </CardHeader>
            <CardBody>
                <p className="text-sm text-muted-text leading-relaxed">{description}</p>
            </CardBody>
        </Card>
    );
}

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-sand-200">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="max-w-2xl mb-14">
                    <SectionLabel>What SafePick does</SectionLabel>
                    <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tight mb-4">
                        From shops to cars, the peace of mind every parent deserves
                    </h2>
                    <p className="text-muted-text leading-relaxed">
                        A full verification layer for every school pickup — so you always know who collected your child, when, and how.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <FeatureCardItem key={feature.id} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}
