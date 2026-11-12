// Tipos del dominio del juego (heredados del sistema web)

export type Rareza = 'comun' | 'raro' | 'epico' | 'legendario';
export type TipoCofre = 'bronce' | 'plata' | 'oro';
export type Genero = 'femenino' | 'masculino' | 'no-binario';
export type NivelDesempeno = 'basico' | 'competente' | 'avanzado' | 'excepcional';
export type HabilidadId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6';
export type CategoriaActividad = 'cotidiana' | 'proceso' | 'evaluacion';

export type Habilidades = Record<HabilidadId, number>;

export interface Nivel {
  nivel: number;
  titulo: string;
  xp_min: number;
  xp_max: number;
}

export interface Habilidad {
  id: HabilidadId;
  nombre: string;
  shortName: string;
  emoji: string;
  color: string;
  descripcion: string;
  comoMejora: string;
}

export interface Badge {
  id: string;
  nombre: string;
  icon: string;
  descripcion: string;
}

export interface Artefacto {
  id: string;
  nombre: string;
  emoji: string;
  rareza: Rareza;
  efecto: string;
  esDecorativo: boolean;
}

export interface CofreDef {
  nombre: string;
  emoji: string;
  probabilidades: Record<Rareza, number>;
}

export interface TipoActividad {
  id: string;
  nombre: string;
  icon: string;
  categoria: CategoriaActividad;
}

// Artefacto en el inventario del estudiante (instancia)
export interface ArtefactoInstancia {
  id: string; // id del artefacto, o 'cofre_bronce' | 'cofre_plata' | 'cofre_oro'
  obtenido: string; // ISO date
  usado: boolean;
  deCofre?: TipoCofre;
}

export interface Estudiante {
  id: string;
  nombre: string; // usuario para login
  nombreSocial: string;
  nombreLegal: string;
  genero: Genero;
  clase: string;
  password: string;
  avatar?: string; // id del avatar elegido (ver components/pixel/avatars.ts)
  xp: number;
  habilidades: Habilidades;
  badges: string[];
  vocabularioDescubierto: string[];
  artefactos: (string | ArtefactoInstancia)[];
  misionesCompletadas?: Record<string, boolean>;
  creado?: string;
}

export interface Actividad {
  id: string;
  studentId: string;
  tipo: string;
  nivel: NivelDesempeno;
  xp: number;
  unidadId: string;
  claseNum: number;
  fecha: string; // ISO
}

export interface Posicion {
  unidad: string;
  clase: number;
}

export interface Mision {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'clase' | 'entre-clases';
  emoji: string;
  recompensa: { xp: number };
  verificacion: 'auto' | 'manual';
}
