/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        bingo: {
          bg: '#0b0f19',
          card: '#151c2e',
          accent: '#f59e0b',
          glow: '#fbbf24',
          crossed: '#ef4444',
          active: '#10b981',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'stamp': 'stamp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'pop': 'pop 0.2s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(245, 158, 11, 0.4), inset 0 0 15px rgba(245, 158, 11, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(245, 158, 11, 0.8), inset 0 0 25px rgba(245, 158, 11, 0.5)' },
        },
        stamp: {
          '0%': { transform: 'scale(2) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
