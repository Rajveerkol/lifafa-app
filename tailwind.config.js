/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1e60d5',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#172554',
          royal: '#175cd3',
          dark: '#0f274a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(0, 0, 0, 0.05), 0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 12px 0 rgba(30, 96, 213, 0.06)',
        'card-hover': '0 8px 24px 0 rgba(30, 96, 213, 0.12)',
        'blue-glow': '0 4px 20px -2px rgba(30, 96, 213, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
