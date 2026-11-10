import { defineConfig, devices } from '@playwright/test';

// Las pruebas corren contra el build de produccion (modo e2e: datos en
// localStorage, sin red), para validar exactamente lo que se publica.
const PORT = 4173;

export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: 'http://127.0.0.1:' + PORT,
        serviceWorkers: 'block',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
    },
    projects: [
        { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
        { name: 'celular', use: { ...devices['Pixel 7'] }, grep: /@movil/ }
    ],
    webServer: {
        command: 'npx vite build --mode e2e --outDir dist-e2e && npx vite preview --outDir dist-e2e --port ' + PORT + ' --strictPort --host 127.0.0.1',
        url: 'http://127.0.0.1:' + PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
