export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        script: ["Snell Roundhand", "Brush Script MT", "cursive"]
      },
      colors: {
        ivory: "#F7F2EA",
        navy: "#06141B",
        gold: "#C89B5A",
        beige: "#E8DDCC",
        brown: "#3A2A1F"
      },
      boxShadow: {
        glow: "0 0 48px rgba(200, 155, 90, 0.35)"
      }
    }
  },
  plugins: []
};
