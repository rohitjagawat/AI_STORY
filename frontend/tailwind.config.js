/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brandPurple: "#7C3AED",
        brandPink: "#EC4899",
        brandBg: "#FBF8FF",
        brandText: "#334155",
        brandMuted: "#64748B",
        brandYellow: "#FDE68A",
        brandBlue: "#3B82F6",
        brandOrange: "#F97316",
        brandRed: "#E11D2E",
        brandRedSoft: "#FEE2E2",
        brandBlack: "#111111",
        brandWhite: "#FFFFFF",
      },
    }
  },
  plugins: []
};
