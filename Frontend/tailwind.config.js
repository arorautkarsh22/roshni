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
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#8B1A4A',
          600: '#7A1642',
          700: '#6B1239',
          800: '#5C0E31',
          900: '#4D0A29',
        },
        gold: {
          50: '#faf6f1',
          100: '#f5ede3',
          200: '#ebdbc7',
          300: '#D4A574',
          400: '#C4945F',
          500: '#B8864E',
          600: '#A07040',
          700: '#825A34',
          800: '#654428',
          900: '#4A311E',
        },
        dark: {
          50: '#1a1a2e',
          100: '#16162a',
          200: '#121226',
          300: '#0e0e22',
          400: '#0a0a1e',
          500: '#0a0a0a',
          600: '#080808',
          700: '#060606',
          800: '#040404',
          900: '#020202',
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #8B1A4A 0%, #D4A574 50%, #8B1A4A 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(139,26,74,0.1) 0%, rgba(212,165,116,0.1) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139,26,74,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139,26,74,0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
