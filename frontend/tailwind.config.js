/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atm: {
          dark: '#0f172a',
          panel: '#1e293b',
          screen: '#0f172a',
          neon: '#22c55e',
          'neon-dim': '#16a34a',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        atm: '0 0 30px rgba(34, 197, 94, 0.15), inset 0 0 60px rgba(0,0,0,0.3)',
        'atm-glow': '0 0 20px rgba(34, 197, 94, 0.3)',
        keypad: 'inset 0 4px 8px rgba(0,0,0,0.4)',
      },
      animation: {
        'press': 'press 0.1s ease-out',
      },
      keyframes: {
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
