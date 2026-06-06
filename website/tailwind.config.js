/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          void: "#050505",
          grey: "#121214",
          cyan: "#00F2FF",
          violet: "#BC00FF",
          pink: "#FF00E5",
          white: "#FFFFFF",
          slate: "#A0A0AA",
          smoke: "#27272A",
        }
      },
      fontFamily: {
        display: ["Michroma", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        display: "0.1em",
      }
    },
  },
  plugins: [],
}
