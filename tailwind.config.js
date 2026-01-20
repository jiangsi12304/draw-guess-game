/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          pink: '#FFB6C1',
          orange: '#FFCC80',
          yellow: '#FFE082',
          purple: '#E1BEE7',
          blue: '#B3E5FC',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(0, 0, 0, 0.1)',
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 182, 193, 0.5), 0 0 40px rgba(255, 204, 128, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 182, 193, 0.6), 0 0 80px rgba(255, 204, 128, 0.4)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

