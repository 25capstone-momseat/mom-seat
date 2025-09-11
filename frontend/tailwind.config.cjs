/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "index.html"
  ],
  theme: {
    extend: {
      colors: {
        'mom-bg': '#FFF7F3',
        'mom-dark': '#7D6073',
        'mom-light': '#C599B6',
        'mom-accent': '#F4A09C',
      }
    }
  },
  plugins: [],
}