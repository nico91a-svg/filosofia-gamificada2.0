import { defineConfig } from 'vitest/config';

// Config separada a proposito: estas pruebas necesitan el emulador de
// Realtime Database corriendo (ver npm run test:rules), asi que no deben
// entrar en el `npm run test`/`npm run check` normal (vite.config.js las
// excluye explicitamente por esta misma razon).
export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/rules/**/*.test.js'],
        testTimeout: 20000,
        hookTimeout: 20000
    }
});
