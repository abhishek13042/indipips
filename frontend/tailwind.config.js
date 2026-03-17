/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        midnight: 'rgb(var(--color-midnight) / <alpha-value>)',
        'midnight-light': 'rgb(var(--color-midnight-light) / <alpha-value>)',
        'indigo-glow': 'rgb(var(--color-indigo-glow) / <alpha-value>)',
        'emerald-accent': 'rgb(var(--color-emerald-accent) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}