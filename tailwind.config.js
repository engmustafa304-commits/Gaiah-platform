/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
      },
      colors: {
        'primary': '#212529',
        'primary-dark': '#343A40',
        'primary-medium': '#495057',
        'primary-light': '#6C757D',
      },
    },
  },
  plugins: [],
}