// Paleta heredada del sistema web
export const colors = {
  bg: '#1e1b4b', // indigo-950 aprox
  gradient: ['#312e81', '#581c87', '#831843'] as const, // indigo → purple → pink
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.12)',
  textMuted: '#c4b5fd', // purple-300
  accent: '#fbbf24', // amber-400
};

export const NIVEL_AVATARES = [
  '👧', '👩‍🎓', '👩‍🏫', '🧐', '🦉', '⚗️', '🏛️', '🔮', '👑', '🌟',
];

export function avatarPorNivel(nivel: number): string {
  return NIVEL_AVATARES[Math.min(nivel, NIVEL_AVATARES.length) - 1] ?? '👧';
}
