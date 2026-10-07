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
        farm: {
          50: '#F4F9F4',
          100: '#E7F2E7',
          200: '#CFE6D0',
          300: '#A4D1A7',
          400: '#72B577',
          500: '#4D9653',
          600: '#3A7940',
          700: '#2D5A3E',
          800: '#264E36',
          900: '#1B3B2B',
          950: '#0F2318',
        },
        card: {
          moisture: '#EAF5ED',
          temp: '#FFF7ED',
          rain: '#EFF6FF',
          watering: '#F5F3FF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 12px -1px rgba(27, 59, 43, 0.06)',
        'hover': '0 10px 25px -3px rgba(45, 90, 62, 0.12)',
      }
    },
  },
  plugins: [],
}
