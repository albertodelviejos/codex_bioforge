import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b1020",
        card: "#121933",
        accent: "#7c3aed",
        accentAlt: "#06b6d4"
      }
    }
  },
  plugins: []
};

export default config;
