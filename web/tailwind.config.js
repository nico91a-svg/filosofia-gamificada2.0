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
            // Estética moderna: Inter para todo. `font-serif` (titulares) y
            // `font-sans` (texto) comparten familia; la jerarquía la da el peso.
            fontFamily: {
                sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
                serif: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif']
            },
            // Paleta "mazmorra" portada de la app movil
            // (filosofia-app/tailwind.config.js, rama claude/web-to-mobile-app-3J0Il).
            // Cada color referencia una variable CSS (ver :root / [data-theme='dark']
            // en src/index.css) para soportar el tema claro/oscuro sin tocar las
            // clases ya usadas en los componentes. El placeholder <alpha-value> lo
            // resuelve Tailwind al generar utilidades como bg-dungeon-700/50.
            colors: {
                dungeon: {
                    950: 'rgb(var(--c-dungeon-950) / <alpha-value>)',
                    900: 'rgb(var(--c-dungeon-900) / <alpha-value>)',
                    800: 'rgb(var(--c-dungeon-800) / <alpha-value>)',
                    700: 'rgb(var(--c-dungeon-700) / <alpha-value>)',
                    600: 'rgb(var(--c-dungeon-600) / <alpha-value>)'
                },
                stone: {
                    light: 'rgb(var(--c-stone-light) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--c-stone) / <alpha-value>)',
                    dark: 'rgb(var(--c-stone-dark) / <alpha-value>)'
                },
                gold: {
                    light: 'rgb(var(--c-gold-light) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--c-gold) / <alpha-value>)',
                    dark: 'rgb(var(--c-gold-dark) / <alpha-value>)'
                },
                parchment: 'rgb(var(--c-parchment) / <alpha-value>)',
                ruby: 'rgb(var(--c-ruby) / <alpha-value>)',
                emerald: 'rgb(var(--c-emerald) / <alpha-value>)',
                arcane: 'rgb(var(--c-arcane) / <alpha-value>)',
                // Semanticos de rareza: no cambian con el tema.
                rareza: {
                    comun: '#94A3B8',
                    raro: '#3B9EE5',
                    epico: '#A855F7',
                    legendario: '#F6B13C'
                },
                // Marca (violeta): acento moderno disponible como text-violet, etc.
                violet: {
                    light: '#8B7BF0',
                    DEFAULT: '#6D5AE6',
                    dark: '#5848C4'
                }
            }
        }
    },
    plugins: []
};
