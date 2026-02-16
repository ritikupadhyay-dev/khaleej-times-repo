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
          golden: '#e1b250',
          navy: '#1e293b',
          accent: '#e1b250',
          dark: '#0f172a',
        },
        sidebar: {
          bg: '#f8fafc',
          text: '#64748b',
          active: '#e1b250',
        }
      },
    },
  },
  plugins: [],
}
