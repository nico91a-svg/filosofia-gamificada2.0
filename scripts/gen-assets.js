// Genera assets PNG (sin dependencias): tile de fondo, icono y splash.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'filosofia-app', 'assets');
fs.mkdirSync(ASSETS, { recursive: true });

// ---- sprites mínimos (espejo de sprites.ts) ----
const CHEST = [
  '....oooooooo....', '..oohhhhhhhhoo..', '.ohhwwwwwwwwhho.', '.ohwGgwwwwgGwho.',
  '.ohwGgwwwwgGwho.', '.oooooooooooooo.', '.owwGgwwwwgGwwo.', '.owwGgwllwgGwwo.',
  '.owwGgwlpwgGwwo.', '.owwGgwllwgGwwo.', '.owwGgwwwwgGwwo.', '.owwGgwwwwgGwwo.',
  '.oooooooooooooo.', '..xxxxxxxxxxxx..',
];
const chestPal = { o: '#20140a', h: '#c5904c', w: '#9c6b34', g: '#f2c33d', G: '#ffe79a', l: '#ece3c6', p: '#4a3a16', x: '#0e0b1e' };
const OWL = [
  '...o........o...', '..oBo......oBo..', '.oBBBBBBBBBBBBo.', 'oBBBBBBBBBBBBBBo',
  'oBgggBBBBBBgggBo', 'oBgegBBBBBBgegBo', 'oBgpgBBBBBBgpgBo', 'oBgggBBkkBBgggBo',
  'oBBBBBBkkBBBBBBo', 'oBffffffffffffBo', 'oBffFFffffFFffBo', '.oBffffffffffBo.',
  '.oBBffffffffBBo.', '..oBBBBBBBBBBo..', '...oBBBBBBBBo...', '....kk..kk.....',
];
const owlPal = { o: '#0b0a14', B: '#6a5aa6', f: '#cfc4ea', F: '#9d8fd0', g: '#f2c33d', e: '#f5f0ff', p: '#0b0a14', k: '#f2a93d' };

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];

function Canvas(W, H) {
  const buf = Buffer.alloc(W * H * 4);
  return {
    W, H, buf,
    px(x, y, c, a = 255) { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = a; },
    rect(x, y, w, h, color, a = 255) { const c = hex(color); for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.px(xx, yy, c, a); },
    sprite(grid, pal, ox, oy, s) {
      for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[y].length; x++) {
        const ch = grid[y][x]; if (ch === '.' || ch === ' ' || !pal[ch]) continue;
        this.rect(ox + x * s, oy + y * s, s, s, pal[ch]);
      }
    },
  };
}

function crc32(b) { let c = ~0; for (let i = 0; i < b.length; i++) { c ^= b[i]; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, cr]); }
function writePNG(cv, file) {
  const { W, H, buf } = cv;
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; buf.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4); }
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(path.join(ASSETS, file), png);
  console.log('  →', file, `${W}x${H}`);
}

// ---------- 1) Tile de fondo (32x32, ladrillos running-bond, seamless) ----------
(function tile() {
  const cv = Canvas(32, 32);
  cv.rect(0, 0, 32, 32, '#14112e');
  // mortero horizontal
  cv.rect(0, 0, 32, 1, '#0e0b1e');
  cv.rect(0, 16, 32, 1, '#0e0b1e');
  // mortero vertical (running bond: x=0 arriba, x=16 abajo)
  cv.rect(0, 0, 1, 16, '#0e0b1e');
  cv.rect(16, 16, 1, 16, '#0e0b1e');
  // brillo sutil en ladrillos
  cv.rect(2, 2, 12, 1, '#1b1640');
  cv.rect(18, 18, 12, 1, '#1b1640');
  // chispa arcana ocasional
  cv.px(24, 8, hex('#2e2458'));
  writePNG(cv, 'tile-dungeon.png');
})();

// ---------- 2) Icono (1024, fondo + cofre) ----------
(function icon() {
  const cv = Canvas(1024, 1024);
  cv.rect(0, 0, 1024, 1024, '#161232');
  // marco de piedra
  cv.rect(40, 40, 944, 944, '#1c1538');
  cv.rect(64, 64, 896, 896, '#6b5fa3');
  cv.rect(70, 70, 884, 884, '#221a45');
  // resplandor
  cv.rect(312, 332, 400, 360, '#2e2458');
  // cofre grande centrado (16x14 -> escala 48 = 768x672)
  cv.sprite(CHEST, chestPal, 128, 196, 48);
  writePNG(cv, 'icon.png');
})();

// ---------- 3) Adaptive icon (1024, fondo transparente + cofre) ----------
(function adaptive() {
  const cv = Canvas(1024, 1024);
  // fondo transparente; cofre centrado y algo más chico (safe zone)
  cv.sprite(CHEST, chestPal, 208, 276, 40);
  writePNG(cv, 'adaptive-icon.png');
})();

// ---------- 4) Splash (1284x1284, cofre + lechuza) ----------
(function splash() {
  const cv = Canvas(1284, 1284);
  cv.rect(0, 0, 1284, 1284, '#0e0b1e');
  cv.sprite(CHEST, chestPal, 386, 360, 32); // 512x448
  cv.sprite(OWL, owlPal, 540, 820, 13);      // mascota debajo
  writePNG(cv, 'splash.png');
})();

console.log('Assets generados en filosofia-app/assets/');
