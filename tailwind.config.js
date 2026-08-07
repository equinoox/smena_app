// Tailwind theme for Smena — all app colors/radii/fonts live here as tokens.
// Colors reference CSS variables from global.css so they auto-switch light/dark.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-canvas": "rgb(var(--bg-canvas) / <alpha-value>)",
        "bg-screen": "rgb(var(--bg-screen) / <alpha-value>)",
        "bg-surface": "rgb(var(--bg-surface) / <alpha-value>)",
        "bg-surface-alt": "rgb(var(--bg-surface-alt) / <alpha-value>)",
        "bg-icon-tint": "rgb(var(--bg-icon-tint) / <alpha-value>)",
        "border-default": "rgb(var(--border-default) / <alpha-value>)",
        "border-muted": "rgb(var(--border-muted) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        "brand-dark": "rgb(var(--brand-dark) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-tertiary": "rgb(var(--text-tertiary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "text-faint": "rgb(var(--text-faint) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        "success-bg": "rgb(var(--success-bg) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        "warning-bg": "rgb(var(--warning-bg) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        "danger-bg": "rgb(var(--danger-bg) / <alpha-value>)",
        "accent-badge": "rgb(var(--accent-badge) / <alpha-value>)",
        star: "rgb(var(--star) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        "on-brand": "rgb(var(--on-brand) / <alpha-value>)",
        "on-accent": "rgb(var(--on-accent) / <alpha-value>)",
      },
      borderRadius: {
        chip: "10px",
        input: "14px",
        button: "16px",
        card: "20px",
        "card-lg": "22px",
      },
      fontFamily: {
        // Named Plus Jakarta Sans weights (loaded via expo-font in the root layout).
        sans: ["PlusJakartaSans_400Regular"],
        "sans-medium": ["PlusJakartaSans_500Medium"],
        "sans-semibold": ["PlusJakartaSans_600SemiBold"],
        "sans-bold": ["PlusJakartaSans_700Bold"],
        "sans-extrabold": ["PlusJakartaSans_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
