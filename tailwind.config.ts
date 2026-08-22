import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dayflow: {
          primary: "#0077FF",
          secondary: "#0084FF",
          sky: "#00B7FE",
          warning: "#F9911E",
          light: "#EAF3FF",
          bg: "#F4F7FB",
          border: "#E5ECF2",
          card: "#FFFFFF",
          text: "#1A1D24",
          muted: "#8F9CAE",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
