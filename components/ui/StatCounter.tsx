import type { Stat } from "@/types";

interface StatCounterProps extends Stat {
    light?: boolean;
}

export function StatCounter({ value, suffix, label, description, light = false }: StatCounterProps) {
    return (
        <div className="flex flex-col items-start">
            <div className="flex items-baseline gap-1">
                <span
                    className={[
                        "text-5xl font-black tracking-tight leading-none",
                        light ? "text-white" : "text-navy"
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {value}
                </span>
                {suffix && (
                    <span
                        className={[
                            "text-2xl font-bold",
                            light ? "text-teal-300" : "text-teal"
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        {suffix}
                    </span>
                )}
            </div>
            <p
                className={[
                    "text-sm font-semibold mt-1",
                    light ? "text-sand-300" : "text-navy"
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {label}
            </p>
            {description && (
                <p
                    className={[
                        "text-xs mt-0.5",
                        light ? "text-navy-200" : "text-muted-text"
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {description}
                </p>
            )}
        </div>
    );
}
