"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui.store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useUIStore((state: any) => state.setTheme);
  const theme = useUIStore((state: any) => state.theme);

  useEffect(() => {
    const savedTheme = localStorage.getItem("safepick-theme") as "light" | "dark" | "system" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("system");
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (useUIStore.getState().theme === "system") {
        setTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setTheme]);

  return <>{children}</>;
}
