/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070A0B',
          900: '#0B1111',
          800: '#0E1718',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.55)',
        glass: '0 0 0 1px rgba(255,255,255,0.10), 0 20px 60px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

