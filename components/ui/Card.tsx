import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
    dark?: boolean;
    className?: string;
}

export function Card({
    children,
    hover = false,
    dark = false,
    className = "",
    ...rest
}: CardProps) {
    return (
        <div
            className={[
                "rounded-2xl p-6 transition-all duration-300",
                dark
                    ? "bg-navy-600 border border-navy-400/30 text-white"
                    : "bg-white border border-sand-400 shadow-card",
                hover
                    ? "hover:shadow-card-hover hover:-translate-y-1 cursor-pointer"
                    : "",
                className
            ]
                .filter(Boolean)
                .join(" ")}
            {...rest}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className = ""
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={["mb-3", className].filter(Boolean).join(" ")}>
            {children}
        </div>
    );
}

export function CardBody({
    children,
    className = ""
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={["flex-1", className].filter(Boolean).join(" ")}>
            {children}
        </div>
    );
}
