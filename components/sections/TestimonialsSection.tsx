import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import type { Testimonial } from "@/types";

const testimonials: Testimonial[] = [
    {
        id: "t1",
        name: "Rachel O.",
        role: "Mum of two, Lagos",
        rating: 5,
        tag: "Parent",
        quote:
            "I can't describe the relief. I got a notification the moment my brother-in-law arrived, approved it from my desk, and got a confirmation when Temi walked out. It's exactly what I needed.",
        avatarInitials: "RO",
        avatarColor: "bg-teal"
    },
    {
        id: "t2",
        name: "James A.",
        role: "Dad, Abuja",
        rating: 5,
        tag: "Parent",
        quote:
            "Before SafePick, I was calling the school twice a week just to check. Now I get the notification before I even think to worry. The audit log is brilliant — I can see everything.",
        avatarInitials: "JA",
        avatarColor: "bg-navy"
    },
    {
        id: "t3",
        name: "Amaka E.",
        role: "Primary caregiver, Port Harcourt",
        rating: 5,
        tag: "Guardian",
        quote:
            "We have four different people who collect the kids depending on the day. Keeping track was a nightmare. SafePick just handles it — everyone is verified, everything is logged.",
        avatarInitials: "AE",
        avatarColor: "bg-teal-700"
    },
    {
        id: "t4",
        name: "Chidi N.",
        role: "Father, Enugu",
        rating: 5,
        tag: "Parent",
        quote:
            "The secondary guardian feature saved us when my phone ran out of battery once. The school didn't need to call anyone in a panic — my wife automatically got the notification. Seamless.",
        avatarInitials: "CN",
        avatarColor: "bg-navy-400"
    }
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    className={`w-4 h-4 ${i < rating ? "text-teal" : "text-sand-400"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function TestimonialCard({ name, role, rating, tag, quote, avatarInitials, avatarColor }: Testimonial) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-sand-400 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col">
            {/* Tag */}
            {tag && <Badge variant="teal" className="self-start mb-4">{tag}</Badge>}

            {/* Stars */}
            <StarRating rating={rating} />

            {/* Quote */}
            <blockquote className="text-sm text-navy/80 leading-relaxed flex-1 mb-5">
                "{quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-sand-300">
                <div
                    className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                >
                    {avatarInitials}
                </div>
                <div>
                    <p className="text-sm font-semibold text-navy">{name}</p>
                    <p className="text-xs text-muted-text">{role}</p>
                </div>
            </div>
        </div>
    );
}

export function TestimonialsSection() {
    return (
        <section className="py-24 bg-sand-200">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="max-w-xl mb-14">
                    <SectionLabel>Parent stories</SectionLabel>
                    <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tight mb-3">
                        Calm. Trusty.
                    </h2>
                    <p className="text-muted-text leading-relaxed">
                        Real parents sharing what it feels like to know exactly who collected their child — every single time.
                    </p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((t) => (
                        <TestimonialCard key={t.id} {...t} />
                    ))}
                </div>
            </div>
        </section>
    );
}
