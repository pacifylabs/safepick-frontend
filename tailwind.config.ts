import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1A2C",
        "navy-mid": "#152740",
        teal: "#0FA37F",
        "teal-mid": "#1D9E75",
        "teal-light": "#E1F5EE",
        amber: "#EF9F27",
        "amber-light": "#FAEEDA",
        coral: "#D85A30",
        "off-white": "#FAFAF8",
        surface: "#F2F0EB",
        muted: "#6B7280"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 2px 20px rgba(11, 26, 44, 0.08)",
        "card-hover": "0 12px 32px rgba(11, 26, 44, 0.08)",
        "phone-modal": "0 40px 80px rgba(11, 26, 44, 0.25)",
        floating: "0 6px 18px rgba(11, 26, 44, 0.10)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem"
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};

export default config;
