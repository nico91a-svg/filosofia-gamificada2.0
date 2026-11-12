// Previsualiza los 4 avatares pixel (espejo de avatars.ts) en un PNG.
const zlib = require('zlib');
const fs = require('fs');

const BASE_FACE = [
  '................', '................', '................', '................',
  '....ssssssss....', '...ssssssssss...', '...ssEssssEss...', '...ssssssssss...',
  '...sssmmmmsss...', '....ssssssss....', '.....ssssss.....', '......ssss......',
  '....cccccccc....', '...cCttttttCc...', '..cccccccccccc..', '..cccccccccccc..',
];
const HAIR_SPIKY = ['...h.hh.hh.h....', '..hHHHHHHHHHHh..', '.hHHHHHHHHHHHHh.', '.hHHHHHHHHHHHHh.', '.hhh........hhh.', '.hh..........hh.'];
const HAIR_SWEPT = ['....HHHHHHHH....', '..hHHHHHHHHHHh..', '.hHHHHHHHHHHHHh.', '.hHHHHHHHHHHHHh.', '.hhh........hhh.', '.hh..........hhh', '.h............hh', '..............h.'];
const HAIR_LONG = ['....HHHHHHHH....', '..hHHHHHHHHHHh..', '.hHHHHHHHHHHHHh.', '.hHHHHHHHHHHHHh.', '.hhh........hhh.', '.hh..........hh.', '.hh..........hh.', '.hh..........hh.', '.hh..........hh.', '.hh..........hh.', '.hh..........hh.'];
const HAIR_UNDERCUT = ['....hhhhhhhh....', '...hHHHHHHHHh...', '..hHHHHHHHHHHh..', '..hhHHHHHHHHhh..', '....hhhhhhhh....'];

const AVATARS = [
  { nombre: 'Nova', hair: HAIR_SPIKY, skin: '#f0c8a0', h: '#e0379a', H: '#ff6fc0', E: '#ff6fc0', t: '#ff6fc0' },
  { nombre: 'Zeph', hair: HAIR_SWEPT, skin: '#d49a6a', h: '#18b6c8', H: '#6ff0ff', E: '#6ff0ff', t: '#6ff0ff' },
  { nombre: 'Lux', hair: HAIR_LONG, skin: '#a86b4a', h: '#8a3fd8', H: '#c08fff', E: '#c08fff', t: '#c08fff' },
  { nombre: 'Vex', hair: HAIR_UNDERCUT, skin: '#8a5a3c', h: '#5fb830', H: '#aee84f', E: '#aee84f', t: '#aee84f' },
];
function merge(base, hair) {
  const rows = Math.max(base.length, hair.length); const out = [];
  for (let y = 0; y < rows; y++) {
    const b = base[y] || '', a = hair[y] || ''; const w = Math.max(b.length, a.length, 16); let row = '';
    for (let x = 0; x < w; x++) { const ac = a[x] || ' ', bc = b[x] || ' '; row += ac !== ' ' && ac !== '.' ? ac : bc; }
    out.push(row);
  }
  return out;
}
const pal = (av) => ({ s: av.skin, h: av.h, H: av.H, E: av.E, m: '#6e3f3f', c: '#161a2e', C: '#2a3350', t: av.t });

const W = 900, H = 340; const buf = Buffer.alloc(W * H * 4);
const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
function px(x, y, c) { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; }
function rect(x, y, w, h, color) { const c = hex(color); for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) px(xx, yy, c); }
function sprite(grid, p, ox, oy, s) {
  for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[y].length; x++) {
    const ch = grid[y][x]; if (ch === '.' || ch === ' ' || !p[ch]) continue; rect(ox + x * s, oy + y * s, s, s, p[ch]);
  }
}
rect(0, 0, W, H, '#0e0b1e');
AVATARS.forEach((av, i) => {
  const x = 30 + i * 218;
  rect(x, 30, 190, 280, '#1c1538');
  rect(x + 3, 33, 184, 274, '#6b5fa3');
  rect(x + 4, 34, 182, 272, '#221a45');
  sprite(merge(BASE_FACE, av.hair), pal(av), x + 19, 50, 10);
  rect(x + 30, 268, 130, 6, av.H); // barra de color del pelo
});

function crc32(b) { let c = ~0; for (let i = 0; i < b.length; i++) { c ^= b[i]; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, cr]); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; buf.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4); }
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync(process.argv[2] || '/tmp/avatars.png', png);
console.log('ok', process.argv[2] || '/tmp/avatars.png');
