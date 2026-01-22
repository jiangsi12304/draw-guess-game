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
        xl: '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 182, 193, 0.5), 0 0 40px rgba(255, 204, 128, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 182, 193, 0.6), 0 0 80px rgba(255, 204, 128, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'gradient-flow': 'gradientFlow 20s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 400ms ease',
        'slide-in': 'slideIn 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        'message-slide': 'messageSlide 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-pulse': 'scalePulse 2s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '100% 50%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '50% 100%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: '-12px' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(255, 182, 193, 0.5), 0 0 40px rgba(255, 204, 128, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(255, 182, 193, 0.7), 0 0 60px rgba(255, 204, 128, 0.4)',
          },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        messageSlide: {
          'from': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scalePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
 

