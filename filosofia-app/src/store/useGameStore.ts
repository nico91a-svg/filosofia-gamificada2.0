// Estado global con Zustand: sesión, estudiantes, actividades y posición.
// Persistencia: Firebase (si hay) o AsyncStorage, con debounce en escrituras.
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseService } from '../services/database';
import {
  registrarActividad, abrirCofre, getNivel, UNIDADES_DEFAULT,
} from '../domain';
import type {
  Estudiante, Actividad, Posicion, NivelDesempeno, Artefacto,
  ArtefactoInstancia, TipoCofre, Genero,
} from '../domain/types';

export type Sesion =
  | { tipo: 'gm'; nombre: string }
  | { tipo: 'estudiante'; id: string }
  | null;

const SESSION_KEY = 'filosofo_sesion';

// --- debounce helper para no martillar la red ---
function debounce<T extends (...a: any[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
const saveStudents = debounce((s: Estudiante[]) => DatabaseService.save('students', s), 600);
const saveActivities = debounce((a: Actividad[]) => DatabaseService.save('activities', a), 600);

interface GameState {
  loading: boolean;
  sesion: Sesion;
  students: Estudiante[];
  activities: Actividad[];
  position: Posicion;
  unidades: any[];

  // ciclo de vida
  init: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // auth
  loginGM: (password: string) => boolean;
  loginEstudiante: (usuario: string, password: string) => boolean;
  logout: () => void;
  currentStudent: () => Estudiante | null;

  // GM: gestión de estudiantes
  crearEstudiante: (data: { nombreSocial: string; nombreLegal?: string; genero: Genero; password: string }) => void;
  eliminarEstudiante: (id: string) => void;

  // GM: registrar actividad (devuelve resultado para feedback/animación)
  registrar: (p: { studentId: string; tipo: string; nivel: NivelDesempeno }) =>
    ReturnType<typeof registrarActividad> | null;
  setPosition: (p: Posicion) => void;

  // Estudiante: abrir cofre
  abrirCofreEstudiante: (studentId: string, indiceArtefacto: number) => Artefacto | null;
}

const GM_PASSWORD = process.env.EXPO_PUBLIC_GM_PASSWORD || 'filosofia2026';

export const useGameStore = create<GameState>((set, getState) => ({
  loading: true,
  sesion: null,
  students: [],
  activities: [],
  position: { unidad: 'U1', clase: 1 },
  unidades: UNIDADES_DEFAULT,

  init: async () => {
    // Suscripción a estudiantes y actividades (tiempo real si hay Firebase)
    DatabaseService.load('students', (data) => {
      const arr = toArray<Estudiante>(data);
      set({ students: arr });
    });
    DatabaseService.load('activities', (data) => {
      set({ activities: toArray<Actividad>(data) });
    });
    const pos = (await DatabaseService.loadOnce('position')) as Posicion | null;
    if (pos) set({ position: pos });
    await getState().restoreSession();
    set({ loading: false });
  },

  restoreSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) set({ sesion: JSON.parse(raw) });
    } catch {
      /* sin sesión previa */
    }
  },

  loginGM: (password) => {
    if (password === GM_PASSWORD) {
      const sesion: Sesion = { tipo: 'gm', nombre: 'Game Master' };
      set({ sesion });
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
      return true;
    }
    return false;
  },

  loginEstudiante: (usuario, password) => {
    const u = usuario.trim().toLowerCase();
    const student = getState().students.find(
      (s) =>
        (s.nombreSocial?.toLowerCase() === u || s.nombre?.toLowerCase() === u) &&
        s.password === password,
    );
    if (student) {
      const sesion: Sesion = { tipo: 'estudiante', id: student.id };
      set({ sesion });
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
      return true;
    }
    return false;
  },

  logout: () => {
    set({ sesion: null });
    AsyncStorage.removeItem(SESSION_KEY);
  },

  currentStudent: () => {
    const { sesion, students } = getState();
    if (sesion?.tipo !== 'estudiante') return null;
    return students.find((s) => s.id === sesion.id) ?? null;
  },

  crearEstudiante: ({ nombreSocial, nombreLegal, genero, password }) => {
    const nuevo: Estudiante = {
      id: `s_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      nombre: nombreSocial,
      nombreSocial,
      nombreLegal: nombreLegal || nombreSocial,
      genero,
      clase: 'GM',
      password,
      xp: 0,
      habilidades: { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0 },
      badges: ['iniciado'],
      vocabularioDescubierto: [],
      artefactos: [],
      misionesCompletadas: {},
      creado: new Date().toISOString(),
    };
    const students = [...getState().students, nuevo];
    set({ students });
    saveStudents(students);
  },

  eliminarEstudiante: (id) => {
    const students = getState().students.filter((s) => s.id !== id);
    set({ students });
    saveStudents(students);
  },

  registrar: ({ studentId, tipo, nivel }) => {
    const { students, activities, position } = getState();
    const estudiante = students.find((s) => s.id === studentId);
    if (!estudiante) return null;

    const res = registrarActividad({
      estudiante,
      tipoActividad: tipo,
      nivelDesempeno: nivel,
      unidadId: position.unidad,
      claseNum: position.clase,
    });

    const nuevosStudents = students.map((s) => (s.id === studentId ? res.estudiante : s));
    const nuevasActs = [...activities, res.actividad];
    set({ students: nuevosStudents, activities: nuevasActs });
    saveStudents(nuevosStudents);
    saveActivities(nuevasActs);
    return res;
  },

  setPosition: (p) => {
    set({ position: p });
    DatabaseService.save('position', p);
  },

  abrirCofreEstudiante: (studentId, indiceArtefacto) => {
    const { students } = getState();
    const estudiante = students.find((s) => s.id === studentId);
    if (!estudiante) return null;

    const item = estudiante.artefactos[indiceArtefacto];
    const cofreId = typeof item === 'string' ? item : item?.id;
    if (!cofreId || !cofreId.startsWith('cofre_')) return null;

    const tipo = cofreId.replace('cofre_', '') as TipoCofre;
    const premio = abrirCofre(tipo);

    // Reemplazar el cofre por el artefacto obtenido (idempotente por índice)
    const artefactos = [...estudiante.artefactos];
    const instancia: ArtefactoInstancia = {
      id: premio.id,
      obtenido: new Date().toISOString(),
      usado: false,
      deCofre: tipo,
    };
    artefactos[indiceArtefacto] = instancia;

    const actualizado = { ...estudiante, artefactos };
    const nuevos = students.map((s) => (s.id === studentId ? actualizado : s));
    set({ students: nuevos });
    saveStudents(nuevos);
    return premio;
  },
}));

function toArray<T>(data: unknown): T[] {
  if (!data) return [];
  const arr = Array.isArray(data) ? data : Object.values(data as object);
  return arr.filter(Boolean) as T[];
}

// Helpers de presentación reutilizables
export function nivelDe(estudiante: Estudiante) {
  return getNivel(estudiante.xp ?? 0);
}
