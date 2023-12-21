/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./site/**/*.{js,ts,jsx,tsx,md,mdx}'],
  darkMode: 'class',
  important: true,
  theme: {
    extend: {
      screens: {
        md: '848px',
      },
    },
  },
  plugins: [],
}
