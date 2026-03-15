import type { ReactNode } from "react";

interface SectionLabelProps {
    children: ReactNode;
    light?: boolean;
    className?: string;
}

export function SectionLabel({ children, className = "" }: SectionLabelProps) {
    return (
        <p
            className={[
                "section-label mb-3",
                className
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {children}
        </p>
    );
}
