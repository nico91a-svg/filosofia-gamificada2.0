import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// `base: './'` produce rutas relativas: el mismo build sirve en la raiz de un
// dominio, en una subcarpeta (GitHub Pages) y dentro del APK (Capacitor).
//
// Modos de compilacion:
//   (por defecto)  sitio web + PWA instalable
//   e2e            pruebas de navegador (datos locales, ver .env.e2e)
//   capacitor      contenido del APK: sin service worker, porque los archivos
//                  ya viajan dentro de la aplicacion
export default defineConfig(({ mode }) => ({
    base: './',
    plugins: [
        react(),
        VitePWA({
            disable: mode === 'capacitor',
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg', 'icons/apple-touch-icon.png'],
            manifest: {
                name: 'Filósofo en Formación',
                short_name: 'Filósofo',
                description: 'Sistema gamificado para clases de Filosofía.',
                lang: 'es-CL',
                start_url: './',
                scope: './',
                display: 'standalone',
                orientation: 'portrait',
                background_color: '#1c1538',
                theme_color: '#1c1538',
                icons: [
                    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
                cleanupOutdatedCaches: true
            }
        })
    ],
    build: { target: 'es2020', sourcemap: false },
    server: { host: true },
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        // tests/rules/ necesita el emulador de Realtime Database corriendo:
        // se corre aparte con `npm run test:rules` (ver vitest.rules.config.js).
        exclude: [...configDefaults.exclude, 'tests/rules/**']
    }
}));
