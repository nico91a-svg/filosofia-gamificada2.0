/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta heredada de la web (indigo/purple/pink)
        brand: {
          900: '#312e81',
          800: '#3730a3',
          purple: '#581c87',
          pink: '#831843',
        },
        rareza: {
          comun: '#9ca3af',
          raro: '#60a5fa',
          epico: '#c084fc',
          legendario: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
};
