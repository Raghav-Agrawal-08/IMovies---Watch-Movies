/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#080c15',
          card: '#0f172a',
          cardLight: '#1e293b',
          accent: '#e50914',
          accentHover: '#b80710',
          gold: '#f59e0b',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          phonepe: '#5f259f'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px rgba(229, 9, 20, 0.35)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.25)',
        'glow-phonepe': '0 0 25px rgba(95, 37, 159, 0.4)',
        'cinema-screen': '0 10px 40px rgba(56, 189, 248, 0.3)',
      }
    },
  },
  plugins: [],
}
