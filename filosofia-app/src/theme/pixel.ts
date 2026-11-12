// Sistema de diseño pixel-art "mazmorra / Zelda"
// Paleta y constantes centralizadas (espejo de tailwind.config.js)

export const FONTS = {
  pixel: 'PressStart2P_400Regular',
  body: 'Silkscreen_400Regular',
  bodyBold: 'Silkscreen_700Bold',
};

export const PALETTE = {
  bgDeep: '#0e0b1e',
  bg: '#161232',
  panelDark: '#221a45',
  panel: '#2e2458',
  panelLight: '#3b2f6e',
  stoneLight: '#6b5fa3',
  stone: '#4a3f7a',
  stoneDark: '#1c1538',
  goldLight: '#ffe79a',
  gold: '#f2c33d',
  goldDark: '#b07d18',
  parchment: '#e8d9a0',
  ruby: '#e0506a',
  emerald: '#3fb27f',
  arcane: '#9d6bd8',
  text: '#efeaff',
  textMuted: '#a99fd6',
} as const;

import type { Rareza } from '../domain/types';

export const RAREZA_PIXEL: Record<Rareza, { color: string; glow: string; label: string }> = {
  comun: { color: '#9ca3af', glow: '#c7ccd6', label: 'COMÚN' },
  raro: { color: '#5aa9f2', glow: '#a8d3ff', label: 'RARO' },
  epico: { color: '#b06bf2', glow: '#e0bdff', label: 'ÉPICO' },
  legendario: { color: '#f2c33d', glow: '#ffe79a', label: 'LEGENDARIO' },
};

// Avatares de nivel temáticos (mientras se integran sprites propios)
export const NIVEL_TITULOS_EMOJI = ['🗡️', '🛡️', '📜', '🔮', '🦉', '⚗️', '🏛️', '👑', '🌟', '💎'];
