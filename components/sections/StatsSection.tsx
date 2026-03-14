import { StatCounter } from "@/components/ui/StatCounter";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Stat } from "@/types";

const stats: Stat[] = [
    {
        id: "verification-time",
        value: "3",
        suffix: "sec",
        label: "Average verification time",
        description: "From QR scan to parent approval"
    },
    {
        id: "accuracy",
        value: "99",
        suffix: "%",
        label: "Pickup accuracy rate",
        description: "Across all pilot schools"
    },
    {
        id: "reduction",
        value: "3",
        suffix: "%",
        label: "Admin overhead reduction",
        description: "Compared to manual sign-out"
    },
    {
        id: "unauthorised",
        value: "0",
        label: "Unauthorised releases",
        description: "Since launch in pilot schools"
    }
];

export function StatsSection() {
    return (
        <section className="py-20 bg-white border-y border-sand-400">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12">
                    <SectionLabel>By the numbers</SectionLabel>
                    <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight">
                        Numbers parents trust SafePick for
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {stats.map((stat) => (
                        <StatCounter key={stat.id} {...stat} />
                    ))}
                </div>
            </div>
        </section>
    );
}
