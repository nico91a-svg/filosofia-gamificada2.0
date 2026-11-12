// Niveles de habilidad — portado de window.getHabilidadNivel
import { HABILIDAD_NIVELES } from './index';

export function getHabilidadNivel(puntos: number): number {
  if (puntos >= 100) return 5;
  if (puntos >= 60) return 4;
  if (puntos >= 30) return 3;
  if (puntos >= 10) return 2;
  return 1;
}

export function getHabilidadNivelNombre(puntos: number): string {
  const nivel = getHabilidadNivel(puntos);
  return HABILIDAD_NIVELES.find((n) => n.nivel === nivel)?.nombre ?? 'Aprendiz';
}
