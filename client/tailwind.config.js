/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          light:   '#6366F1', // Indigo 500
          dark:    '#3730A3', // Indigo 800
          50:      '#EEF2FF',
          100:     '#E0E7FF',
        },
        secondary: {
          DEFAULT: '#7C3AED', // Violet 600
          light:   '#8B5CF6', // Violet 500
          dark:    '#5B21B6', // Violet 800
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber 500 – India saffron
          light:   '#FCD34D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          light:   '#F8FAFC',
          muted:   '#F1F5F9',
          border:  '#E2E8F0',
        },
        darktext: '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'card':   '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-lg':'0 4px 16px -2px rgb(79 70 229 / 0.12), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
        'glow':   '0 0 0 3px rgb(79 70 229 / 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'shimmer':    'shimmer 1.6s linear infinite',
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0'  },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'   },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
      },
    },
  },
  plugins: [],
}
