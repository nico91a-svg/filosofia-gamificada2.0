/** @type {import('tailwindcss').Config} */
export default {
    // Tailwind genera solo las clases que aparecen escritas en estos archivos.
    // Los colores de unidad viven en src/content, por eso se incluye todo src.
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            // Las familias se remapean en vez de editar cada componente:
            // `font-serif` (titulares) pasa a la pixel chunky y `font-sans`
            // (default) a la pixel legible. Ver docs/design/estetica-pixel-web.md.
            fontFamily: {
                sans: ['Silkscreen', 'monospace'],
                serif: ['"Press Start 2P"', 'monospace']
            },
            // Paleta "mazmorra" portada de la app movil
            // (filosofia-app/tailwind.config.js, rama claude/web-to-mobile-app-3J0Il).
            colors: {
                dungeon: {
                    950: '#0e0b1e', // fondo profundo
                    900: '#161232', // fondo
                    800: '#221a45', // panel oscuro
                    700: '#2e2458', // panel
                    600: '#3b2f6e'  // panel claro / hover
                },
                stone: {
                    light: '#6b5fa3', // bisel claro de marco
                    DEFAULT: '#4a3f7a',
                    dark: '#1c1538'   // bisel oscuro / sombra dura
                },
                gold: {
                    light: '#ffe79a',
                    DEFAULT: '#f2c33d',
                    dark: '#b07d18'
                },
                parchment: '#e8d9a0',
                ruby: '#e0506a',
                emerald: '#3fb27f',
                arcane: '#9d6bd8',
                rareza: {
                    comun: '#9ca3af',
                    raro: '#5aa9f2',
                    epico: '#b06bf2',
                    legendario: '#f2c33d'
                }
            }
        }
    },
    plugins: []
};
