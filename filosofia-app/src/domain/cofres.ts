// Lógica de cofres — portada 1:1 desde js/data/artefactos.js (window.abrirCofre)
import { ARTEFACTOS, COFRES } from './index';
import type { Artefacto, Rareza, TipoCofre } from './types';

// Color de glow/destello por rareza (para la animación de apertura)
export const RAREZA_GLOW: Record<Rareza, string> = {
  comun: '#9ca3af',
  raro: '#60a5fa',
  epico: '#c084fc',
  legendario: '#fbbf24',
};

// Clases Tailwind de borde/fondo (heredado de getRarezaColor de la web)
export function getRarezaColor(rareza: Rareza): string {
  const colores: Record<Rareza, string> = {
    comun: 'border-gray-400',
    raro: 'border-blue-400',
    epico: 'border-purple-400',
    legendario: 'border-amber-400',
  };
  return colores[rareza] ?? 'border-gray-400';
}

export const RAREZA_LABEL: Record<Rareza, string> = {
  comun: 'Común',
  raro: 'Raro',
  epico: 'Épico',
  legendario: 'Legendario',
};

/**
 * Abre un cofre y devuelve un artefacto según las probabilidades de su tipo.
 * Lógica pura → funciona offline y es testeable.
 */
export function abrirCofre(tipoCofre: TipoCofre): Artefacto {
  const cofre = COFRES[tipoCofre];
  const prob = cofre.probabilidades;
  const roll = Math.random() * 100;

  let rareza: Rareza;
  if (roll < prob.legendario) rareza = 'legendario';
  else if (roll < prob.legendario + prob.epico) rareza = 'epico';
  else if (roll < prob.legendario + prob.epico + prob.raro) rareza = 'raro';
  else rareza = 'comun';

  const candidatos = ARTEFACTOS.filter((a) => a.rareza === rareza);
  return candidatos[Math.floor(Math.random() * candidatos.length)];
}

// Qué cofre otorga cada categoría de actividad (regla de negocio de la web)
export function cofrePorCategoria(
  categoria: 'cotidiana' | 'proceso' | 'evaluacion',
  nivel: 'basico' | 'competente' | 'avanzado' | 'excepcional',
): TipoCofre | null {
  if (categoria === 'cotidiana') return null;
  if (categoria === 'proceso') return 'bronce';
  // evaluacion: plata por defecto, oro si fue excepcional
  return nivel === 'excepcional' || nivel === 'avanzado' ? 'oro' : 'plata';
}
