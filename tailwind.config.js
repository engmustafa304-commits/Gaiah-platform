/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sahazm': ['SAHazmVF', 'sans-serif'],
        'cairo': ['Cairo', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'primary': '#212529',
        'primary-dark': '#343A40',
        'primary-medium': '#495057',
        'primary-light': '#6C757D',
        'gray-300': '#CED4DA',
        'gray-200': '#DEE2E6',
        'gray-100': '#E9ECEF',
        'gray-50': '#F8F9FA',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-up': 'scaleUp 0.4s ease-out',
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
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}