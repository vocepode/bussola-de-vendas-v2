import type { Config } from "tailwindcss";

// Tailwind v4 + PostCSS: precisamos dizer onde estão as classes
// para o build gerar `.text-4xl`, `.container`, etc.
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

