/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#FDF8F3',
        'cream-dark': '#F5EFE7',
        'cream-light': '#FFFBF7',
        'indigo': '#6366F1',
        'indigo-light': '#818CF8',
        'indigo-dark': '#4F46E5',
        'gold': '#FBBF24',
        'gold-light': '#FCD34D',
        'teal': '#14B8A6',
        'teal-light': '#2DD4BF',
        'charcoal': '#2D3436',
        'charcoal-light': '#636E72',
      },
      fontFamily: {
        'sans': ['Nunito', 'system-ui', 'sans-serif'],
        'handwritten': ['Caveat', 'cursive'],
        'display': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
