"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export function OtpInput({
  length = 6,
  onComplete,
  error = false,
  disabled = false
}: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array.from({ length }, () => ""));
  const refs = useRef<Array<HTMLInputElement | null>>(Array.from({ length }, () => null));
  const controls = useAnimation();

  const complete = useMemo(() => values.every((v) => v.length === 1), [values]);

  useEffect(() => {
    if (complete && !disabled && !error) {
      onComplete(values.join(""));
    }
  }, [complete, disabled, error, onComplete, values]);

  useEffect(() => {
    if (!error) return;
    controls
      .start({
        x: [0, -8, 8, -8, 8, -4, 4, 0],
        transition: { duration: 0.4 }
      })
      .then(() => {
        setValues(Array.from({ length }, () => ""));
        refs.current[0]?.focus();
      });
  }, [controls, error, length]);

  const updateAt = (index: number, value: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      updateAt(index, "");
      return;
    }
    updateAt(index, digit);
    if (index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key !== "Backspace") return;
    if (values[index]) {
      updateAt(index, "");
      return;
    }
    if (index > 0) {
      updateAt(index - 1, "");
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, length).split("");
    if (digits.length === 0) return;
    const next = Array.from({ length }, (_, i) => digits[i] ?? "");
    setValues(next);
    const last = Math.min(digits.length, length) - 1;
    refs.current[last]?.focus();
  };

  return (
    <motion.div animate={controls} className="w-full flex justify-center gap-1.5 sm:gap-2 px-2">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length > 1) {
              handlePaste(val);
            } else {
              handleChange(index, val);
            }
          }}
          onKeyDown={(e) => handleKeyDown(index, e.key)}
          onPaste={(e) => {
            e.preventDefault();
            handlePaste(e.clipboardData.getData("text"));
          }}
          className={[
            "flex-1 max-w-[52px] min-w-0 aspect-square",
            "bg-white/[0.07]",
            "border rounded-[14px]",
            "text-white font-display text-[1.25rem] sm:text-[1.5rem] font-semibold text-center",
            "outline-none transition-all duration-200",
            "caret-transparent",
            "focus:ring-[3px]",
            error
              ? "border-coral focus:border-coral focus:ring-coral/30"
              : "border-white/[0.15] focus:border-teal focus:ring-teal/30",
            value && !error ? "border-white/30" : "",
            disabled ? "opacity-60" : ""
          ].filter(Boolean).join(" ")}
        />
      ))}
    </motion.div>
  );
}

export default OtpInput;
