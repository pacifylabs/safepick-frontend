// ─── Navigation ────────────────────────────────────────────────────────────
export interface NavLink {
    label: string;
    href: string;
}

// ─── Feature Cards ─────────────────────────────────────────────────────────
export interface FeatureCard {
    id: string;
    icon: string; // emoji or icon identifier
    title: string;
    description: string;
    tag?: string; // optional chip label
}

// ─── How It Works Items ────────────────────────────────────────────────────
export interface HowItWorksItem {
    id: string;
    step: number;
    title: string;
    description: string;
    icon: string;
}

// ─── Stats ─────────────────────────────────────────────────────────────────
export interface Stat {
    id: string;
    value: string;
    suffix?: string;
    label: string;
    description?: string;
}

// ─── Testimonials ──────────────────────────────────────────────────────────
export interface Testimonial {
    id: string;
    name: string;
    role: string;
    rating: number;
    quote: string;
    tag?: string;
    avatarInitials: string;
    avatarColor: string;
}

// ─── CTA ───────────────────────────────────────────────────────────────────
export interface CtaConfig {
    heading: string;
    subtext: string;
    buttonLabel: string;
    buttonHref: string;
}
