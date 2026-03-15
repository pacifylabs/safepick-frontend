"use client";

import { useState } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

export interface InputFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  error?: string;
  register: UseFormRegister<T>;
  className?: string;
}

export function InputField<T extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  error,
  register,
  className = ""
}: InputFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={name} className="font-body text-[0.875rem] font-medium text-navy">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          {...register(name)}
          className={[
            "w-full px-4 py-3",
            "bg-surface border border-black/10",
            "rounded-xl",
            "text-navy text-[0.875rem] font-body",
            "placeholder:text-muted/50",
            "outline-none transition-all duration-200",
            "focus:border-teal focus:ring-2 focus:ring-teal/20",
            "aria-[invalid=true]:border-coral aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-coral/20",
            isPassword ? "pr-12" : ""
          ].join(" ")}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy/70 transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.78-1.84 2-3.41 3.49-4.62" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a10.95 10.95 0 0 1-1.66 2.75" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      <p className="min-h-[1.25rem] text-[0.75rem] text-coral font-body">
        {error ?? ""}
      </p>
    </div>
  );
}

export default InputField;
