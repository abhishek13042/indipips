/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0F1E',
        card: '#111827',
        border: '#1F2937',
        accent: '#10B981',
        gold: '#F59E0B',
        success: '#10B981',
        danger: '#EF4444',
        muted: '#6B7280',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
