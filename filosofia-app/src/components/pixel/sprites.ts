// Sprites pixel-art dibujados a mano. Cada char = 1 pixel; '.'/' ' = transparente.
import type { SpriteDef } from './PixelSprite';
import type { TipoCofre, Rareza } from '../../domain/types';

// ---------------- COFRE ----------------
// Grilla base; las bandas metálicas (g/G) se recolorean según el tipo de cofre.
const CHEST_GRID = [
  '....oooooooo....',
  '..oohhhhhhhhoo..',
  '.ohhwwwwwwwwhho.',
  '.ohwGgwwwwgGwho.',
  '.ohwGgwwwwgGwho.',
  '.oooooooooooooo.',
  '.owwGgwwwwgGwwo.',
  '.owwGgwllwgGwwo.',
  '.owwGgwlpwgGwwo.',
  '.owwGgwllwgGwwo.',
  '.owwGgwwwwgGwwo.',
  '.owwGgwwwwgGwwo.',
  '.oooooooooooooo.',
  '..xxxxxxxxxxxx..',
];

const METAL: Record<TipoCofre, { g: string; G: string }> = {
  bronce: { g: '#cd7f32', G: '#f0b27a' },
  plata: { g: '#b8c0cc', G: '#eef2f7' },
  oro: { g: '#f2c33d', G: '#ffe79a' },
};

export function chestSprite(tipo: TipoCofre): SpriteDef {
  const m = METAL[tipo];
  return {
    grid: CHEST_GRID,
    palette: {
      o: '#20140a', // contorno madera
      h: '#c5904c', // madera clara
      w: '#9c6b34', // madera media
      g: m.g, // banda metálica
      G: m.G, // banda metálica brillo
      l: '#ece3c6', // placa cerradura
      p: '#4a3a16', // ojo cerradura
      x: '#0e0b1e', // sombra inferior
    },
  };
}

// ---------------- GEMA (artefactos / rareza) ----------------
// 'c' es tintable según rareza; 'L' es el brillo.
export const GEM_SPRITE: SpriteDef = {
  grid: [
    '...oooooo...',
    '..oLLcccco..',
    '.oLccccccco.',
    'occcccccccco',
    'occcccccccco',
    '.occcccccco.',
    '.occcccccco.',
    '..occcccco..',
    '..occcccco..',
    '...occcco...',
    '....occo....',
    '.....oo.....',
  ],
  palette: {
    o: '#1c1538',
    c: '#b06bf2', // por defecto épico (se sobreescribe con tint)
    L: '#ffffff',
  },
};

export function gemColor(rareza: Rareza): string {
  return { comun: '#9ca3af', raro: '#5aa9f2', epico: '#b06bf2', legendario: '#f2c33d' }[rareza];
}

// ---------------- CRISTAL DE XP ----------------
export const CRYSTAL_SPRITE: SpriteDef = {
  grid: [
    '....oo....',
    '...oLco...',
    '..oLccco..',
    '..oLccco..',
    '.oLccccco.',
    '.oLccccco.',
    '.occcccco.',
    '.occcccco.',
    '..occcco..',
    '..occcco..',
    '...occo...',
    '...occo...',
    '....oo....',
  ],
  palette: {
    o: '#1c1538',
    c: '#5aa9f2',
    L: '#cfe8ff',
  },
};

// ---------------- CORAZÓN ----------------
export const HEART_SPRITE: SpriteDef = {
  grid: [
    '.oo..oo...',
    'oLLrooorro',
    'oLrrrrrrro',
    'oLrrrrrrro',
    '.orrrrrro.',
    '..orrrro..',
    '...orro...',
    '....oo....',
  ],
  palette: {
    o: '#1c1538',
    r: '#e0506a',
    L: '#ff9fb0',
  },
};
