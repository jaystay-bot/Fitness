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
        // "Daylight" colorway (N=035). Clean white canvas, vivid blue primary,
        // emerald secondary, deep-navy text — light, vibrant, premium.
        // Page background (light) — also serves as text-on-accent (light text on
        // the vivid-blue CTA reads as white-on-blue).
        ink: "#F7F9FC",
        // Elevated card / panel surface — pure white.
        surface: "#FFFFFF",
        // Inputs, hovers, the next elevation step.
        elevate: "#EEF2F8",
        // Primary text — deep navy ink (not pure black; premium).
        paper: "#0F1B2D",
        // Primary accent (token kept so it cascades) — vivid blue.
        lime: "#2563EB",
        // Secondary accent — emerald green, readable on white.
        gold: "#047857",
        // Warning / clinical accent — rose red.
        clinical: "#E11D48",
      },
      boxShadow: {
        // Soft, light elevation for cards on a white canvas.
        card: "0 1px 2px 0 rgba(15,27,45,0.04), 0 12px 32px -16px rgba(15,27,45,0.18)",
        glow: "0 0 0 1px rgba(37,99,235,0.25), 0 12px 32px -10px rgba(37,99,235,0.30)",
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
