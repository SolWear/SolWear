import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#ededE8",
          dim: "rgba(237,237,232,0.55)",
          faint: "rgba(237,237,232,0.5)",
        },
        line: {
          DEFAULT: "rgba(237,237,232,0.12)",
          strong: "rgba(237,237,232,0.28)",
        },
        ground: { DEFAULT: "#050505", raised: "#0b0b0b" },
        red: { sw: "#e0000f" },
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { shell: "82rem" },
    },
  },
  plugins: [],
};

export default config;
