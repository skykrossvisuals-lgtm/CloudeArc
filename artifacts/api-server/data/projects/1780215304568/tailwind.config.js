/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          dark: '#0f172a',
          deeper: '#0a0f1e',
          card: '#1e293b',
          green: '#00ff88',
          'green-dim': '#00cc6a',
          'green-glow': 'rgba(0, 255, 136, 0.15)',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};