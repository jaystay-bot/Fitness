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
        // Base canvas — deep, slightly cool near-black for a premium dark feel.
        ink: "#0A0B0D",
        // Elevated card / panel surface. Cards used to be flat (border only),
        // which read as cheap; a subtle fill creates depth and hierarchy.
        surface: "#14161A",
        // Inputs, hovers, and the next elevation step above surface.
        elevate: "#1C1F25",
        // Primary text — warm-cool off white, softer than pure white.
        paper: "#F4F4F1",
        // Signal accent — toned down from the old acid neon (#D4FF3A) so it
        // reads as a confident highlight on CTAs instead of energy-drink slop.
        lime: "#B6F24A",
        // Warning / clinical accent — refined coral, calmer than the old
        // neon orange that clashed with the lime.
        clinical: "#F2774E",
      },
      boxShadow: {
        // Soft elevation for cards and the result surface.
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 30px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(182,242,74,0.25), 0 8px 30px -8px rgba(182,242,74,0.25)",
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
