/** @type {import('tailwindcss').Config} */
export default {
    // Tailwind genera solo las clases que aparecen escritas en estos archivos.
    // Los colores de unidad viven en src/content, por eso se incluye todo src.
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
                serif: ['Lora', 'Georgia', 'serif']
            }
        }
    },
    plugins: []
};
