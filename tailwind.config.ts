import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        g0:"#0d0c0b", g1:"#111010", g2:"#171615", g3:"#1e1d1c", g4:"#252422",
        acc:"#f2ede6", acc2:"#d6d0c8", acc3:"#9a9590",
        green:"#22c55e", green2:"#4ade80", green3:"#86efac",
      },
      fontFamily: { mono: ["Space Mono", "monospace"] },
    },
  },
  plugins: [],
};
export default config;
