/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        slate: {
          750: '#283548',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#070b14',
        }
      },
      animation: {
        'tile-flip': 'tileFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        tileFlip: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
