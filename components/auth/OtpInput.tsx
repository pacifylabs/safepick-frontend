"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error: boolean;
  disabled: boolean;
}

export function OtpInput(props: OtpInputProps) {
  const length = props.length ?? 6;
  const [values, setValues] = useState<string[]>(Array.from({ length }, () => ""));
  const inputs = useRef<Array<HTMLInputElement | null>>(Array.from({ length }, () => null));
  const controls = useAnimation();

  useEffect(() => {
    if (props.error) {
      controls.start({ x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.4 } }).then(() => {
        setValues(Array.from({ length }, () => ""));
        inputs.current[0]?.focus();
      });
    }
  }, [props.error, controls, length]);

  const isComplete = useMemo(() => values.every((v) => v && v.length === 1), [values]);

  useEffect(() => {
    if (isComplete && !props.error) {
      props.onComplete(values.join(""));
    }
  }, [isComplete, props, values]);

  const setAt = (idx: number, v: string) => {
    const next = [...values];
    next[idx] = v;
    setValues(next);
  };

  const onChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setAt(idx, "");
      return;
    }
    const char = raw.slice(-1);
    setAt(idx, char);
    if (idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    const next = Array.from({ length }, (_, i) => text[i] ?? "");
    setValues(next);
    const lastFilled = next.findLastIndex((c) => c);
    const focusIdx = Math.min(Math.max(lastFilled, 0) + 1, length - 1);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <motion.div animate={controls} className="flex items-center gap-3">
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={props.disabled}
          onChange={(e) => onChange(idx, e)}
          onKeyDown={(e) => onKeyDown(idx, e)}
          onPaste={onPaste}
          className={[
            "w-[52px] h-[60px] text-center",
            "rounded-[14px]",
            "bg-white/10 border border-white/15",
            "text-white font-display text-[1.5rem] font-semibold",
            "focus:outline-none focus:border-teal focus:ring-4 focus:ring-teal/30",
            props.error ? "border-coral" : val ? "border-white/30" : "",
            props.disabled ? "opacity-60" : ""
          ].join(" ")}
        />
      ))}
    </motion.div>
  );
}

export default OtpInput;
