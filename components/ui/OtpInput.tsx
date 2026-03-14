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
    <motion.div animate={controls} className="flex items-center gap-3">
      {values.map((value, index) => (
        <input
          key={`${index}`}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e.key)}
          onPaste={(e) => {
            e.preventDefault();
            handlePaste(e.clipboardData.getData("text"));
          }}
          className={[
            "w-[52px] h-[60px]",
            "bg-white/[0.07]",
            "border border-white/[0.15]",
            "rounded-[14px]",
            "text-white font-display text-[1.5rem] font-semibold text-center",
            "outline-none transition-all duration-200",
            "caret-transparent",
            "focus:border-teal focus:ring-[3px] focus:ring-teal/30",
            value ? "border-white/30" : "",
            error ? "border-coral" : "",
            disabled ? "opacity-60" : ""
          ].join(" ")}
        />
      ))}
    </motion.div>
  );
}

export default OtpInput;
