// Cálculo de nivel a partir de XP — portado de window.getNivel
import { NIVELES } from './index';
import type { Nivel } from './types';

export function getNivel(xp: number): Nivel {
  return NIVELES.find((n) => xp >= n.xp_min && xp <= n.xp_max) ?? NIVELES[0];
}

// Progreso (0..1) dentro del nivel actual, para la barra de XP
export function getProgresoNivel(xp: number): {
  nivel: Nivel;
  progreso: number;
  faltante: number;
} {
  const nivel = getNivel(xp);
  const rango = nivel.xp_max - nivel.xp_min;
  const dentro = xp - nivel.xp_min;
  const progreso = rango > 0 ? Math.min(1, dentro / rango) : 1;
  return { nivel, progreso, faltante: Math.max(0, nivel.xp_max - xp) };
}
