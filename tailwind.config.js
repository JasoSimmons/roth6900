/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11120f",
        paper: "#ffffff",
        cream: "#fff8e7",
        greenpaper: "#e9ffd8",
        rh: "#96D002",
        rh2: "#96D002",
        red: "#c7352b",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      maxWidth: {
        page: "78rem",
      },
      boxShadow: {
        sheet: "0 18px 44px -24px rgba(17,18,15,.35)",
      },
    },
  },
  plugins: [],
};
