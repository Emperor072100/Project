module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'rubik': ['Rubik', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.65rem',
        'xs': '0.75rem',
        'sm': '0.8rem',
        'base': '0.9rem',
        'lg': '1rem',
        'xl': '1.125rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      }
    },
  },
  plugins: [],
}