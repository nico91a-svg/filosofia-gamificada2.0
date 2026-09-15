// Motor de XP: registrar una actividad y calcular sus efectos.
// Consolida la lógica que estaba dispersa en RegistroMasivo/ProfesorDashboard.
import {
  RUBRICS_XP, RUBRICS_HABILIDADES, TIPOS_ACTIVIDAD, BADGES,
} from './index';
import { getNivel } from './niveles';
import { cofrePorCategoria } from './cofres';
import type {
  Estudiante, Actividad, NivelDesempeno, TipoCofre, HabilidadId, Habilidades,
} from './types';

export interface ResultadoRegistro {
  estudiante: Estudiante;       // estudiante actualizado (inmutable)
  actividad: Actividad;         // registro de la actividad
  xpGanado: number;
  subioNivel: boolean;
  nivelAnterior: number;
  nivelNuevo: number;
  cofreOtorgado: TipoCofre | null;
  badgesNuevos: string[];
}

function nuevoId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
}

/**
 * Registra una actividad para un estudiante y devuelve el estado resultante.
 * Función PURA: no muta el estudiante de entrada (apto para Zustand/undo).
 */
export function registrarActividad(params: {
  estudiante: Estudiante;
  tipoActividad: string;
  nivelDesempeno: NivelDesempeno;
  unidadId: string;
  claseNum: number;
}): ResultadoRegistro {
  const { estudiante, tipoActividad, nivelDesempeno, unidadId, claseNum } = params;

  const tipoDef = TIPOS_ACTIVIDAD.find((t) => t.id === tipoActividad);
  const rubrica = RUBRICS_XP[tipoActividad];
  const xpGanado = rubrica ? rubrica[nivelDesempeno] : 0;

  const xpAnterior = estudiante.xp ?? 0;
  const xpNuevo = xpAnterior + xpGanado;
  const nivelAnterior = getNivel(xpAnterior).nivel;
  const nivelNuevo = getNivel(xpNuevo).nivel;
  const subioNivel = nivelNuevo > nivelAnterior;

  // Sumar puntos de habilidad según la rúbrica de la actividad
  const incHab = RUBRICS_HABILIDADES[tipoActividad] ?? {};
  const habilidades: Habilidades = { ...estudiante.habilidades };
  (Object.keys(incHab) as HabilidadId[]).forEach((h) => {
    habilidades[h] = (habilidades[h] ?? 0) + (incHab[h] ?? 0);
  });

  // Badges automáticos por nivel
  const badges = [...(estudiante.badges ?? [])];
  const badgesNuevos: string[] = [];
  const otorgar = (id: string) => {
    if (!badges.includes(id) && BADGES.some((b) => b.id === id)) {
      badges.push(id);
      badgesNuevos.push(id);
    }
  };
  if (nivelNuevo >= 5) otorgar('nivel5');
  if (nivelNuevo >= 10) otorgar('nivel10');
  if ((estudiante.badges ?? []).length <= 1 && xpGanado > 0) otorgar('participante');

  // Cofre según categoría de la actividad
  const categoria = tipoDef?.categoria ?? 'cotidiana';
  const cofreOtorgado = cofrePorCategoria(categoria, nivelDesempeno);

  const artefactos = [...(estudiante.artefactos ?? [])];
  if (cofreOtorgado) {
    artefactos.push({
      id: `cofre_${cofreOtorgado}`,
      obtenido: new Date().toISOString(),
      usado: false,
      deCofre: cofreOtorgado,
    });
  }

  const actividad: Actividad = {
    id: nuevoId('act'),
    studentId: estudiante.id,
    tipo: tipoActividad,
    nivel: nivelDesempeno,
    xp: xpGanado,
    unidadId,
    claseNum,
    fecha: new Date().toISOString(),
  };

  const actualizado: Estudiante = {
    ...estudiante,
    xp: xpNuevo,
    habilidades,
    badges,
    artefactos,
  };

  return {
    estudiante: actualizado,
    actividad,
    xpGanado,
    subioNivel,
    nivelAnterior,
    nivelNuevo,
    cofreOtorgado,
    badgesNuevos,
  };
}

// Lista plana de niveles de desempeño (para selectores de UI)
export const NIVELES_DESEMPENO: { id: NivelDesempeno; label: string; color: string }[] = [
  { id: 'basico', label: 'Básico', color: '#94a3b8' },
  { id: 'competente', label: 'Competente', color: '#38bdf8' },
  { id: 'avanzado', label: 'Avanzado', color: '#a78bfa' },
  { id: 'excepcional', label: 'Excepcional', color: '#fbbf24' },
];
