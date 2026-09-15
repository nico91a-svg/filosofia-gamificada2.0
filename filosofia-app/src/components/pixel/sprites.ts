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

// Cofre ABIERTO (tapa levantada + resplandor interior) para el frame final.
const CHEST_OPEN_GRID = [
  '................',
  '.Y............Y.',
  '.oooooooooooooo.',
  '.oWWWWWWWWWWWWo.',
  '.oYYYYYYYYYYYYo.',
  '.oYYYYYYYYYYYYo.',
  '.owwGgwwwwgGwwo.',
  '.owwGgwwwwgGwwo.',
  '.owwGgwwwwgGwwo.',
  '.owwGgwwwwgGwwo.',
  '.owwGgwwwwgGwwo.',
  '.owwGgwwwwgGwwo.',
  '.oooooooooooooo.',
  '..xxxxxxxxxxxx..',
];

function chestPalette(tipo: TipoCofre) {
  const m = METAL[tipo];
  return {
    o: '#20140a', h: '#c5904c', w: '#9c6b34', g: m.g, G: m.G,
    l: '#ece3c6', p: '#4a3a16', x: '#0e0b1e',
    W: '#7a4f24', Y: '#fff3b0', // tapa interior + resplandor
  };
}

export function chestSprite(tipo: TipoCofre): SpriteDef {
  return { grid: CHEST_GRID, palette: chestPalette(tipo) };
}

export function chestOpenSprite(tipo: TipoCofre): SpriteDef {
  return { grid: CHEST_OPEN_GRID, palette: chestPalette(tipo) };
}

// ---------------- LECHUZA DE ATENEA (mascota / guía) ----------------
export const OWL_SPRITE: SpriteDef = {
  grid: [
    '...o........o...',
    '..oBo......oBo..',
    '.oBBBBBBBBBBBBo.',
    'oBBBBBBBBBBBBBBo',
    'oBgggBBBBBBgggBo',
    'oBgegBBBBBBgegBo',
    'oBgpgBBBBBBgpgBo',
    'oBgggBBkkBBgggBo',
    'oBBBBBBkkBBBBBBo',
    'oBffffffffffffBo',
    'oBffFFffffFFffBo',
    '.oBffffffffffBo.',
    '.oBBffffffffBBo.',
    '..oBBBBBBBBBBo..',
    '...oBBBBBBBBo...',
    '....kk..kk.....',
  ],
  palette: {
    o: '#0b0a14', // contorno
    B: '#6a5aa6', // plumas
    f: '#cfc4ea', // pecho
    F: '#9d8fd0', // patrón pecho
    g: '#f2c33d', // anillo dorado del ojo
    e: '#f5f0ff', // blanco del ojo
    p: '#0b0a14', // pupila
    k: '#f2a93d', // pico / patas
  },
};

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

// ---------------- CORONA (accesorio nivel alto) ----------------
export const CROWN_SPRITE: SpriteDef = {
  grid: [
    '.g..g..g..g.',
    '.gGgGgGgGGg.',
    '.gggggggggg.',
    '.grgggggrg..',
  ],
  palette: { g: '#f2c33d', G: '#ffe79a', r: '#e0506a' },
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
