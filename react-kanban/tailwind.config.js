/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        priority: {
          low: '#10b981',    // green-500
          medium: '#f59e0b', // amber-500
          high: '#ef4444',   // red-500
        }
      }
    },
  },
  plugins: [],
}

