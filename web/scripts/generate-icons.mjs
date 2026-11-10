// Genera los PNG de la app a partir de public/icon.svg (requiere Playwright).
//   node scripts/generate-icons.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const svg = fs.readFileSync('public/icon.svg', 'utf8');
// Version "maskable": fondo a sangre y dibujo dentro de la zona segura (80%).
const maskable = svg
    .replace('rx="112"', 'rx="0"')
    .replace('<g fill="#fff">', '<g fill="#fff" transform="translate(256 256) scale(.74) translate(-256 -256)">');

const targets = [
    { file: 'public/icons/icon-192.png', size: 192, source: svg },
    { file: 'public/icons/icon-512.png', size: 512, source: svg },
    { file: 'public/icons/icon-maskable-512.png', size: 512, source: maskable },
    { file: 'public/icons/apple-touch-icon.png', size: 180, source: maskable }
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
