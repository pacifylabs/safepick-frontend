"use client";

import { useUIStore } from "@/stores/ui.store";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();
  const [showTooltip, setShowTooltip] = useState(false);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getIcon = () => {
    if (theme === "light") return <Sun className="w-4 h-4 text-[var(--text-secondary)]" />;
    if (theme === "dark") return <Moon className="w-4 h-4 text-[var(--text-secondary)]" />;
    return <Monitor className="w-4 h-4 text-[var(--text-secondary)]" />;
  };

  const getLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={cycleTheme}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg-muted)] hover:bg-[var(--border-strong)] transition-colors duration-200 cursor-pointer"
        aria-label={`Current theme: ${getLabel()}. Click to change.`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getIcon()}
          </motion.div>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-8 bg-[#0B1A2C] text-white text-[0.68rem] font-body rounded-lg px-2 py-1 whitespace-nowrap z-50 pointer-events-none"
          >
            {getLabel()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
