const defaultTheme = require('tailwindcss/defaultTheme')

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // https://www.tailwindshades.com/
      colors: {
        primary: {
          DEFAULT: '#00c2df',
          50: '#32f4ff',
          100: '#28eaff',
          200: '#1ee0fd',
          300: '#14d6f3',
          400: '#0acce9',
          500: '#00c2df',
          600: '#00b8d5',
          700: '#00aecb',
          800: '#00a4c1',
          900: '#009ab7',
        },
        secondary: {
          DEFAULT: '#72a951',
          50: '#a4db83',
          100: '#9ad179',
          200: '#90c76f',
          300: '#86bd65',
          400: '#7cb35b',
          500: '#72a951',
          600: '#689f47',
          700: '#5e953d',
          800: '#548b33',
          900: '#4a8129',
        },
        accent: {
          DEFAULT: '#d25f15',
          50: '#ff9147',
          100: '#fa873d',
          200: '#f07d33',
          300: '#e67329',
          400: '#dc691f',
          500: '#d25f15',
          600: '#c8550b',
          700: '#be4b01',
          800: '#b44100',
          900: '#aa3700',
        },
      },
      fontFamily: {
        poppins: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // ...
  ],
}

module.exports = config
