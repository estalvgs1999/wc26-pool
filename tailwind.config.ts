import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        wc: {
          navy:  '#010915',
          blue:  '#0055B8',
          green: '#006847',
          red:   '#CE1126',
          gold:  '#F5A623',
        },
      },
    },
  },
  plugins: [],
};
export default config;
