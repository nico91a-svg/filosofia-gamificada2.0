/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // Titulares y números: chunky retro. Texto/etiquetas: legible pixel.
        pixel: ['PressStart2P_400Regular'],
        body: ['Silkscreen_400Regular'],
        bodybold: ['Silkscreen_700Bold'],
      },
      colors: {
        // --- Mazmorra / Zelda ---
        dungeon: {
          950: '#0e0b1e', // fondo profundo
          900: '#161232', // fondo
          800: '#221a45', // panel oscuro
          700: '#2e2458', // panel
          600: '#3b2f6e', // panel claro / hover
        },
        stone: {
          light: '#6b5fa3', // bisel claro de marco
          DEFAULT: '#4a3f7a',
          dark: '#1c1538', // bisel oscuro / sombra dura
        },
        gold: {
          light: '#ffe79a',
          DEFAULT: '#f2c33d',
          dark: '#b07d18',
        },
        parchment: '#e8d9a0',
        ruby: '#e0506a',
        emerald: '#3fb27f',
        arcane: '#9d6bd8',
        rareza: {
          comun: '#9ca3af',
          raro: '#5aa9f2',
          epico: '#b06bf2',
          legendario: '#f2c33d',
        },
      },
    },
  },
  plugins: [],
};
