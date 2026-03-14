import type { ReactNode } from "react";

type BadgeVariant = "teal" | "navy" | "sand" | "cream";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    teal: "bg-teal-50 text-teal-700 border border-teal-100",
    navy: "bg-navy text-white",
    sand: "bg-sand-300 text-navy",
    cream: "bg-cream text-navy border border-amber-200"
};

export function Badge({ children, variant = "teal", className = "" }: BadgeProps) {
    return (
        <span
            className={[
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase",
                variantStyles[variant],
                className
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {children}
        </span>
    );
}
