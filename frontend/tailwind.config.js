module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6faf5',
          100: '#ccf5eb',
          200: '#99ebd7',
          300: '#66e1c3',
          400: '#33d7af',
          500: '#00D4AA',
          600: '#00aa88',
          700: '#008066',
          800: '#005544',
          900: '#002b22'
        },
        whatsapp: '#25D366',
        messenger: '#0084FF',
        instagram: '#E4405F',
        telegram: '#0088cc',
        dark: {
          50: '#f7f7f8',
          100: '#ececf1',
          200: '#d9d9e3',
          300: '#c5c5d2',
          400: '#acacbe',
          500: '#8e8ea0',
          600: '#565869',
          700: '#40414f',
          800: '#343541',
          900: '#202123',
          950: '#0a0a1a'
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
        sans: ['Inter', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}