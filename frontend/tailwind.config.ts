import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: ["var(--font-label)", { lineHeight: "1.25rem" }],
      },
      colors: {
        slate: { 500: "#5F6F85" },
        brand: {
          DEFAULT: "#004B9B",
          dark: "#003B7A",
          sky: "#00A6D6",
          ink: "#007A9E",
          pale: "#E6F7FC",
          bg: "#F5F8FC",
          text: "#475569",
        },
      },
      boxShadow: {
        panel: "0 18px 45px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
