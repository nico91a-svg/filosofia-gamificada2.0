// Renderiza los sprites pixel-art a un PNG (sin dependencias) para previsualizar.
const zlib = require('zlib');
const fs = require('fs');

// ---- sprites (espejo de filosofia-app/src/components/pixel/sprites.ts) ----
const CHEST = [
  '....oooooooo....', '..oohhhhhhhhoo..', '.ohhwwwwwwwwhho.', '.ohwGgwwwwgGwho.',
  '.ohwGgwwwwgGwho.', '.oooooooooooooo.', '.owwGgwwwwgGwwo.', '.owwGgwllwgGwwo.',
  '.owwGgwlpwgGwwo.', '.owwGgwllwgGwwo.', '.owwGgwwwwgGwwo.', '.owwGgwwwwgGwwo.',
  '.oooooooooooooo.', '..xxxxxxxxxxxx..',
];
const METAL = {
  bronce: { g: '#cd7f32', G: '#f0b27a' },
  plata: { g: '#b8c0cc', G: '#eef2f7' },
  oro: { g: '#f2c33d', G: '#ffe79a' },
};
const chestPalette = (t) => ({
  o: '#20140a', h: '#c5904c', w: '#9c6b34', g: METAL[t].g, G: METAL[t].G,
  l: '#ece3c6', p: '#4a3a16', x: '#0e0b1e',
});

const GEM = [
  '...oooooo...', '..oLLcccco..', '.oLccccccco.', 'occcccccccco', 'occcccccccco',
  '.occcccccco.', '.occcccccco.', '..occcccco..', '..occcccco..', '...occcco...',
  '....occo....', '.....oo.....',
];
const gemPalette = (c) => ({ o: '#1c1538', c, L: '#ffffff' });
const RAREZA = { comun: '#9ca3af', raro: '#5aa9f2', epico: '#b06bf2', legendario: '#f2c33d' };

const CRYSTAL = [
  '....oo....', '...oLco...', '..oLccco..', '..oLccco..', '.oLccccco.', '.oLccccco.',
  '.occcccco.', '.occcccco.', '..occcco..', '..occcco..', '...occo...', '...occo...', '....oo....',
];
const crystalPalette = { o: '#1c1538', c: '#5aa9f2', L: '#cfe8ff' };

const HEART = [
  '.oo..oo...', 'oLLrooorro', 'oLrrrrrrro', 'oLrrrrrrro', '.orrrrrro.', '..orrrro..', '...orro...', '....oo....',
];
const heartPalette = { o: '#1c1538', r: '#e0506a', L: '#ff9fb0' };

// ---- mini canvas RGBA ----
const W = 900, H = 600;
const buf = Buffer.alloc(W * H * 4);
const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
function px(x, y, [r, g, b], a = 255) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}
function rect(x, y, w, h, color, a = 255) {
  const c = hex(color);
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) px(xx, yy, c, a);
}
function sprite(grid, pal, ox, oy, scale) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const ch = grid[y][x];
      if (ch === '.' || ch === ' ' || !pal[ch]) continue;
      rect(ox + x * scale, oy + y * scale, scale, scale, pal[ch]);
    }
  }
}

// marco de panel con bisel (piedra)
function panel(x, y, w, h) {
  rect(x, y, w, h, '#1c1538');          // borde exterior
  rect(x + 3, y + 3, w - 6, h - 6, '#6b5fa3'); // bisel claro
  rect(x + 3, y + 3, w - 7, h - 7, '#221a45'); // cara
}

// fondo mazmorra
rect(0, 0, W, H, '#0e0b1e');
panel(24, 24, W - 48, 200);
panel(24, 248, W - 48, 180);
panel(24, 452, W - 48, 124);

// fila cofres
const S = 11;
['bronce', 'plata', 'oro'].forEach((t, i) => {
  sprite(CHEST, chestPalette(t), 70 + i * 280, 40, S);
});
// fila gemas
['comun', 'raro', 'epico', 'legendario'].forEach((r, i) => {
  sprite(GEM, gemPalette(RAREZA[r]), 70 + i * 200, 270, S + 2);
});
// cristal + corazon
sprite(CRYSTAL, crystalPalette, 120, 462, S);
sprite(HEART, heartPalette, 420, 470, S + 2);

// ---- PNG encoder ----
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 6; // depth 8, color type 6 (RGBA)
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0;
  buf.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);
const out = process.argv[2] || '/tmp/sprites-preview.png';
fs.writeFileSync(out, png);
console.log('PNG escrito en', out, `(${W}x${H})`);
