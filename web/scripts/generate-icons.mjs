// Genera los PNG de la app a partir de public/icon.svg (requiere Playwright).
//   node scripts/generate-icons.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const svg = fs.readFileSync('public/icon.svg', 'utf8');
// Version "maskable": fondo a sangre y dibujo dentro de la zona segura (80%).
const maskable = svg
    .replace('rx="112"', 'rx="0"')
    .replace('<g fill="#fff">', '<g fill="#fff" transform="translate(256 256) scale(.74) translate(-256 -256)">');

// Piezas para los iconos adaptables y la pantalla de inicio de Android
// (las consume @capacitor/assets desde la carpeta assets/).
const square = svg.replace('rx="112"', 'rx="0"');
const backgroundOnly = square.replace(/<g fill="#fff">[\s\S]*<\/g>/, '');
const foregroundOnly = svg
    .replace(/<rect width="512"[^>]*\/>/, '')
    .replace('<g fill="#fff">', '<g fill="#fff" transform="translate(256 256) scale(.6) translate(-256 -256)">');
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#0f172a"/>
  <svg x="1116" y="1116" width="500" height="500" viewBox="0 0 512 512">${svg.replace(/<\/?svg[^>]*>/g, '')}</svg>
</svg>`;

const targets = [
    { file: 'public/icons/icon-192.png', size: 192, source: svg },
    { file: 'public/icons/icon-512.png', size: 512, source: svg },
    { file: 'public/icons/icon-maskable-512.png', size: 512, source: maskable },
    { file: 'public/icons/apple-touch-icon.png', size: 180, source: maskable },
    { file: 'assets/icon-only.png', size: 1024, source: square },
    { file: 'assets/icon-foreground.png', size: 1024, source: foregroundOnly },
    { file: 'assets/icon-background.png', size: 1024, source: backgroundOnly },
    { file: 'assets/splash.png', size: 2732, source: splash },
    { file: 'assets/splash-dark.png', size: 2732, source: splash }
];

const browser = await chromium.launch();
for (const { file, size, source } of targets) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent('<style>*{margin:0}svg{display:block;width:100vw;height:100vh}</style>' + source);
    await page.screenshot({ path: file, omitBackground: true });
    await page.close();
    console.log('ok', file);
}
await browser.close();
