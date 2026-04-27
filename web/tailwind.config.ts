import type { Config } from "tailwindcss";

const config: Config = {
 darkMode: ["selector", "[data-theme='dark']"],
 content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
 theme: {
  extend: {
   colors: {
    // Semantic tokens - all backed by CSS variables
    bg: {
     DEFAULT: "rgb(var(--bg) / <alpha-value>)",
     2: "rgb(var(--bg2) / <alpha-value>)",
     3: "rgb(var(--bg3) / <alpha-value>)",
    },
    fg: {
     DEFAULT: "rgb(var(--fg) / <alpha-value>)",
     2: "rgb(var(--fg2) / <alpha-value>)",
     3: "rgb(var(--fg3) / <alpha-value>)",
    },
    brand: {
     DEFAULT: "rgb(var(--brand) / <alpha-value>)",
     light: "rgb(var(--brand-light) / <alpha-value>)",
     dark: "rgb(var(--brand-dark) / <alpha-value>)",
    },
    border: {
     DEFAULT: "rgb(var(--border) / <alpha-value>)",
     subtle: "rgb(var(--border-subtle) / <alpha-value>)",
    },
    // Static accent colors
    amber: "#D9844A",
    rose: "#C85A5A",
    sky: "#5B8FB9",
    // Risk tier colors
    tier: {
     minimal: "#4CAF7D",
     sub:   "#F4C842",
     moderate: "#E8834A",
     severe:  "#D96B6B",
    },
   },
   fontFamily: {
    sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
   },
   keyframes: {
    slideUp: {
     "0%":  { opacity: "0", transform: "translateY(24px)" },
     "100%": { opacity: "1", transform: "translateY(0)" },
    },
    fadeIn: {
     "0%":  { opacity: "0" },
     "100%": { opacity: "1" },
    },
    dotPulse: {
     "0%, 80%, 100%": { transform: "scale(0)" },
     "40%":      { transform: "scale(1)" },
    },
    gradientPan: {
     "0%, 100%": { backgroundPosition: "0% 50%" },
     "50%":   { backgroundPosition: "100% 50%" },
    },
    float: {
     "0%, 100%": { transform: "translateY(0px)" },
     "50%":   { transform: "translateY(-8px)" },
    },
   },
   animation: {
    "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
    "fade-in":  "fadeIn 0.4s ease both",
    "dot-pulse": "dotPulse 1.4s ease-in-out infinite",
    "gradient": "gradientPan 10s ease infinite",
    "float":   "float 6s ease-in-out infinite",
   },
   backdropBlur: {
    xs: "4px",
   },
  },
 },
 plugins: [],
};

export default config;
