import React from "react";

export interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: { text: "text-[1.1rem]", icon: "w-7 h-7", svg: "14" },
  md: { text: "text-[1.4rem]", icon: "w-8 h-8", svg: "18" },
  lg: { text: "text-[1.8rem]", icon: "w-10 h-10", svg: "22" }
};

export function Logo({ variant = "light", size = "md", className = "", onClick }: LogoProps) {
  const t = sizeMap[size];
  const colorClass = variant === "light" ? "text-white" : "text-navy";

  return (
    <div 
      className={`inline-flex items-center gap-2 ${className}`}
      onClick={onClick}
    >
      <span className={`rounded-lg bg-teal flex items-center justify-center ${t.icon}`}>
        <svg 
          width={t.svg} 
          height={t.svg} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </span>
      <span className={`${colorClass} font-display font-semibold leading-none tracking-tight ${t.text}`}>
        SafePick
      </span>
    </div>
  );
}

export default Logo;
