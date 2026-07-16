import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    /* PRD 8.4 반응형 구간: ~380 / 381~680 / 681~960 / 961~ */
    screens: {
      sm: "381px",
      md: "681px",
      lg: "961px",
    },
    extend: {
      colors: {
        navy: "var(--color-navy)",
        "navy-deep": "var(--color-navy-deep)",
        blue: "var(--color-blue)",
        "blue-soft": "var(--color-blue-soft)",
        gold: "var(--color-gold)",
        "gold-soft": "var(--color-gold-soft)",
        paper: "var(--color-paper)",
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
