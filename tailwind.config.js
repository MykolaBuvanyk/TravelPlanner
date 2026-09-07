/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        app: {
          background: '#F7F8FA',
          surface: '#FFFFFF',
          text: '#101828',
          muted: '#667085',
          primary: '#246BFD',
          primaryPressed: '#175CD3',
          secondary: '#EAF0FF',
          border: '#E4E7EC',
          success: '#12B76A',
          danger: '#F04438',
        },
      },
    },
  },
  plugins: [],
};
