// Valida (16x16) y renderiza los íconos de icons.json en una hoja de contacto.
const zlib = require('zlib'); const fs = require('fs'); const path = require('path');
const data = require(path.join(__dirname, '..', 'filosofia-app', 'src', 'components', 'pixel', 'icons.json'));

// --- validación ---
let errs = 0;
for (const [k, def] of Object.entries(data)) {
  def.grid.forEach((r, i) => { if (r.length !== 16) { console.error(`✗ ${k} fila ${i} tiene ${r.length} (≠16)`); errs++; } });
  if (def.grid.length !== 16) { console.error(`✗ ${k} tiene ${def.grid.length} filas (≠16)`); errs++; }
}
console.log(errs ? `${errs} errores de tamaño` : 'Todos los íconos son 16x16 ✓');

// --- render ---
const keys = Object.keys(data);
const cols = 5, S = 9, cell = 16 * S + 30;
const W = cols * cell + 20, H = Math.ceil(keys.length / cols) * cell + 20;
const buf = Buffer.alloc(W * H * 4);
const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const px = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; };
const rect = (x, y, w, h, col) => { const c = hex(col); for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) px(xx, yy, c); };
rect(0, 0, W, H, '#161232');
keys.forEach((k, idx) => {
  const cx = 10 + (idx % cols) * cell, cy = 10 + Math.floor(idx / cols) * cell;
  rect(cx, cy, 16 * S + 20, 16 * S + 20, '#1c1538');
  rect(cx + 4, cy + 4, 16 * S + 12, 16 * S + 12, '#221a45');
  const g = data[k].grid, p = data[k].palette;
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[y].length; x++) {
    const ch = g[y][x]; if (ch === '.' || ch === ' ' || !p[ch]) continue;
    rect(cx + 10 + x * S, cy + 10 + y * S, S, S, p[ch]);
  }
});
function crc32(b) { let c = ~0; for (let i = 0; i < b.length; i++) { c ^= b[i]; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, cr]); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; buf.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4); }
fs.writeFileSync(process.argv[2] || '/tmp/icons.png', Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('ok', process.argv[2] || '/tmp/icons.png');
