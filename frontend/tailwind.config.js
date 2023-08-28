/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          turquoise: "#51B7AF",
          red: "#F25C5C",
          yellow: "#F2C85C",
        },
      },
    },
  },
  plugins: [],
};
