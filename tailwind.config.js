/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        petro: {
          bg:     "#08080f",
          card:   "#0f0f1a",
          border: "#1a1a2e",
          verde:  "#00e5b4",
          amarelo:"#f5c842",
          verm:   "#ff5050",
          laranja:"#ff8c42",
          texto:  "#dde4ff",
          sub:    "#7a82a8",
        },
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
