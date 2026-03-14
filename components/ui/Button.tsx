import type { ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  href?: string;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-navy text-white hover:bg-teal-mid transition-colors duration-200",
  danger: "bg-coral/10 text-coral border border-coral/30 hover:bg-coral/20",
  ghost: "bg-transparent text-navy opacity-70 hover:opacity-100",
  outline: "border border-navy/20 text-navy hover:bg-navy hover:text-white"
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-[0.85rem]",
  md: "px-8 py-3.5 text-[0.95rem]",
  lg: "px-10 py-4 text-[1rem]"
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  href
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center",
    "rounded-full font-body font-medium",
    "transition-all duration-200",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    loading || disabled ? "opacity-70 cursor-not-allowed" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const content = loading ? (
    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  ) : (
    children
  );

  if (href) {
    return (
      <a href={href} className={classes} aria-disabled={loading || disabled ? "true" : "false"}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={classes}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
