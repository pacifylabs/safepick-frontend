import type { ReactNode } from "react";

interface SectionLabelProps {
    children: ReactNode;
    light?: boolean;
    className?: string;
}

export function SectionLabel({ children, light = false, className = "" }: SectionLabelProps) {
    return (
        <p
            className={[
                "text-xs font-bold tracking-[0.2em] uppercase mb-3",
                light ? "text-teal-300" : "text-teal",
                className
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {children}
        </p>
    );
}
