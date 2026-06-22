import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Elite Apothecary" colorway (N=026). Deep evergreen-obsidian canvas,
        // vital mint-emerald primary, champagne-gold luxe accent, warm bone text.
        // Canvas — deep evergreen-tinted near-black; organic + premium.
        ink: "#0B0E0C",
        // Elevated card / panel surface.
        surface: "#131815",
        // Inputs, hovers, the next elevation step above surface.
        elevate: "#1C231E",
        // Primary text — warm bone/cream, softer than pure white.
        paper: "#EFEDE4",
        // Primary accent (token name kept so it cascades app-wide) — a vital
        // mint-emerald that reads "healthy / active", not energy-drink neon.
        lime: "#5FE3A1",
        // Champagne gold — luxe secondary for numerals, dividers, fine accents.
        gold: "#E4C896",
        // Warning / clinical accent — warm coral.
        clinical: "#EF8A63",
      },
      boxShadow: {
        // Soft elevation for cards and the result surface.
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 34px -14px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(95,227,161,0.3), 0 10px 34px -8px rgba(95,227,161,0.28)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "aurora-drift": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-3%,0) scale(1.06)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "250% 0" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "aurora-drift": "aurora-drift 18s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
