// Punto único de acceso a los datos de dominio (JSON migrados de la web)
import niveles from './data/niveles.json';
import habilidades from './data/habilidades.json';
import habilidadNiveles from './data/habilidad-niveles.json';
import badges from './data/badges.json';
import artefactos from './data/artefactos.json';
import cofres from './data/cofres.json';
import clasesFilosoficas from './data/clases-filosoficas.json';
import categoriasActividad from './data/categorias-actividad.json';
import tiposActividad from './data/tipos-actividad.json';
import rubricsXp from './data/rubrics-xp.json';
import rubricsHabilidades from './data/rubrics-habilidades.json';
import misiones from './data/misiones.json';
import unidades from './data/unidades.json';

import type {
  Nivel, Habilidad, Badge, Artefacto, CofreDef, TipoActividad,
  Mision, NivelDesempeno, HabilidadId,
} from './types';

export const NIVELES = niveles as Nivel[];
export const HABILIDADES = habilidades as Habilidad[];
export const HABILIDAD_NIVELES = habilidadNiveles as { nivel: number; nombre: string; min: number; max: number }[];
export const BADGES = badges as Badge[];
export const ARTEFACTOS = artefactos as Artefacto[];
export const COFRES = cofres as Record<'bronce' | 'plata' | 'oro', CofreDef>;
export const CLASES_FILOSOFICAS = clasesFilosoficas as any[];
export const CATEGORIAS_ACTIVIDAD = categoriasActividad as any[];
export const TIPOS_ACTIVIDAD = tiposActividad as TipoActividad[];
export const RUBRICS_XP = rubricsXp as Record<string, Record<NivelDesempeno, number>>;
export const RUBRICS_HABILIDADES = rubricsHabilidades as Record<string, Partial<Record<HabilidadId, number>>>;
export const MISIONES_DB = misiones as Mision[];
export const UNIDADES_DEFAULT = unidades as any[];

export * from './types';
export * from './cofres';
export * from './niveles';
export * from './habilidades';
export * from './xp';
export * from './misiones';
