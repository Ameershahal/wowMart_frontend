/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: '#EAB308',
          dark: '#0f172a',
          light: '#fafafa',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#FDFBCF',
          muted: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      },
      keyframes: {
        'testimonial-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
      },
      animation: {
        'testimonial-scroll': 'testimonial-scroll 35s linear infinite',
      },
    },
  },
  plugins: [],
}
