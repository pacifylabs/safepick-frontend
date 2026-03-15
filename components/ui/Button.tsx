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
  primary: "bg-navy text-white hover:bg-teal-mid",
  danger: "bg-coral/10 text-coral border border-coral/30 hover:bg-coral/20",
  ghost: "bg-transparent text-navy/70 hover:text-navy",
  outline: "border border-black/10 text-navy hover:border-black/20"
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-6 py-2 text-[0.8rem]",
  md: "px-8 py-3 text-[0.875rem]",
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
    loading || disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const content = loading ? (
    <div className="flex items-center justify-center">
      <div className={`w-5 h-5 border-2 rounded-full animate-spin ${variant === 'primary' ? 'border-white/30 border-t-white' : 'border-navy/30 border-t-navy'}`} />
    </div>
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
