/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',   // deep blue
        secondary: '#FACC15', // bright yellow
        accent: '#EF4444',    // red for warnings
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 12px rgba(30, 64, 175, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
