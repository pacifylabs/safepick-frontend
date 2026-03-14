/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1A2C",
          50: "#E8EDF3",
          100: "#C5D1DF",
          200: "#8FA5BE",
          300: "#5A7A9E",
          400: "#2E4F7A",
          500: "#0B1A2C",
          600: "#091624",
          700: "#07121C",
          800: "#040D14",
          900: "#02080C"
        },
        teal: {
          DEFAULT: "#0FA37F",
          50: "#E7F8F3",
          100: "#C2EEE2",
          200: "#83DECB",
          300: "#45CDB4",
          400: "#1BB89A",
          500: "#0FA37F",
          600: "#0C8A6B",
          700: "#087057",
          800: "#055743",
          900: "#033D2F"
        },
        sand: {
          DEFAULT: "#F9F7F2",
          100: "#FDFCFA",
          200: "#F9F7F2",
          300: "#F0EDE3",
          400: "#E5E0D0"
        },
        cream: "#FAEEDA",
        "muted-text": "#6B7A8D"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 2px 20px rgba(11, 26, 44, 0.08)",
        "card-hover": "0 8px 40px rgba(11, 26, 44, 0.14)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem"
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
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
