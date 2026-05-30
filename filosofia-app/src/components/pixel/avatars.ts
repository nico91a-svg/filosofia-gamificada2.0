// Avatares pixel-art: personajes futuristas con pelo teñido (neón).
// Una cara/cuello base + 4 peinados distintos que se combinan por capas.
import type { SpriteDef } from './PixelSprite';

// Cara + traje futurista (cuello con visera de neón). Las zonas de pelo van vacías.
const BASE_FACE = [
  '................',
  '................',
  '................',
  '................',
  '....ssssssss....',
  '...ssssssssss...',
  '...ssEssssEss...', // ojos neón (col 5 y 10)
  '...ssssssssss...',
  '...sssmmmmsss...', // boca
  '....ssssssss....',
  '.....ssssss.....',
  '......ssss......', // cuello
  '....cccccccc....', // cuello del traje
  '...cCttttttCc...', // panel + trim de neón
  '..cccccccccccc..', // hombros
  '..cccccccccccc..',
];

// --- Peinados (h = tinte medio, H = tinte brillo) ---
const HAIR_SPIKY = [
  '...h.hh.hh.h....',
  '..hHHHHHHHHHHh..',
  '.hHHHHHHHHHHHHh.',
  '.hHHHHHHHHHHHHh.',
  '.hhh........hhh.',
  '.hh..........hh.',
];

const HAIR_SWEPT = [
  '....HHHHHHHH....',
  '..hHHHHHHHHHHh..',
  '.hHHHHHHHHHHHHh.',
  '.hHHHHHHHHHHHHh.',
  '.hhh........hhh.',
  '.hh..........hhh',
  '.h............hh',
  '..............h.',
];

const HAIR_LONG = [
  '....HHHHHHHH....',
  '..hHHHHHHHHHHh..',
  '.hHHHHHHHHHHHHh.',
  '.hHHHHHHHHHHHHh.',
  '.hhh........hhh.',
  '.hh..........hh.',
  '.hh..........hh.',
  '.hh..........hh.',
  '.hh..........hh.',
  '.hh..........hh.',
  '.hh..........hh.',
];

const HAIR_UNDERCUT = [
  '....hhhhhhhh....',
  '...hHHHHHHHHh...',
  '..hHHHHHHHHHHh..',
  '..hhHHHHHHHHhh..',
  '....hhhhhhhh....',
];

export interface AvatarDef {
  id: string;
  nombre: string;
  hair: string[];
  skin: string;
  hairMid: string;
  hairLight: string;
  eye: string;
  trim: string;
}

// 4 personajes: peinado, pelo teñido y tono de piel distintos.
export const AVATARS: AvatarDef[] = [
  { id: 'nova', nombre: 'Nova', hair: HAIR_SPIKY, skin: '#f0c8a0', hairMid: '#e0379a', hairLight: '#ff6fc0', eye: '#ff6fc0', trim: '#ff6fc0' },
  { id: 'zeph', nombre: 'Zeph', hair: HAIR_SWEPT, skin: '#d49a6a', hairMid: '#18b6c8', hairLight: '#6ff0ff', eye: '#6ff0ff', trim: '#6ff0ff' },
  { id: 'lux', nombre: 'Lux', hair: HAIR_LONG, skin: '#a86b4a', hairMid: '#8a3fd8', hairLight: '#c08fff', eye: '#c08fff', trim: '#c08fff' },
  { id: 'vex', nombre: 'Vex', hair: HAIR_UNDERCUT, skin: '#8a5a3c', hairMid: '#5fb830', hairLight: '#aee84f', eye: '#aee84f', trim: '#aee84f' },
];

export const DEFAULT_AVATAR = AVATARS[0].id;

// Combina cara base + peinado (el pelo tiene prioridad donde exista).
function merge(base: string[], hair: string[]): string[] {
  const rows = Math.max(base.length, hair.length);
  const out: string[] = [];
  for (let y = 0; y < rows; y++) {
    const b = base[y] ?? '';
    const a = hair[y] ?? '';
    const w = Math.max(b.length, a.length, 16);
    let row = '';
    for (let x = 0; x < w; x++) {
      const ac = a[x] ?? ' ';
      const bc = b[x] ?? ' ';
      row += ac !== ' ' && ac !== '.' ? ac : bc;
    }
    out.push(row);
  }
  return out;
}

export function getAvatarSprite(id: string | undefined): SpriteDef {
  const av = AVATARS.find((a) => a.id === id) ?? AVATARS[0];
  return {
    grid: merge(BASE_FACE, av.hair),
    palette: {
      s: av.skin,
      S: '#ffffff',
      h: av.hairMid,
      H: av.hairLight,
      E: av.eye,
      m: '#6e3f3f',
      c: '#161a2e',
      C: '#2a3350',
      t: av.trim,
      o: '#0b0a14',
    },
  };
}

export function avatarNombre(id: string | undefined): string {
  return AVATARS.find((a) => a.id === id)?.nombre ?? 'Nova';
}
