// Cursos: cada curso es una "edicion" independiente del juego.
//
// Un curso combina tres cosas:
//   - sus datos (estudiantes, actividades, posicion): viven en la base de datos
//     bajo `cursos/<id>/...`;
//   - un pack de contenido (`contentPackId`, ver src/content);
//   - su identidad visual (emoji y paleta).
//
// El curso original (III Medio B 2026) conserva las rutas planas historicas
// (`students`, `activities`, ...) para no mover los datos que ya existen.
import { DEFAULT_PACK_ID } from '../content/index.js';
import { nextId } from '../domain/ids.js';

// Gradientes re-tonados a la gama "mazmorra" (mas oscuros y menos saturados)
// para que la personalizacion por curso no rompa la atmosfera pixel.
export const PALETAS = [
    { id: 'violeta', label: 'Violeta filosófico', card: 'linear-gradient(90deg,#3b2f6e,#6b5fa3,#9d6bd8)', navbar: 'linear-gradient(90deg,#221a45,#2e2458,#4a3f7a)' },
    { id: 'esmeralda', label: 'Verde epistémico', card: 'linear-gradient(90deg,#123a2e,#1c5a44,#3fb27f)', navbar: 'linear-gradient(90deg,#0b241c,#123a2e,#1c5a44)' },
    { id: 'ambar', label: 'Ámbar retórico', card: 'linear-gradient(90deg,#7a4f24,#b07d18,#f2c33d)', navbar: 'linear-gradient(90deg,#3a2a06,#5c3d12,#8a6214)' },
    { id: 'azul', label: 'Azul dialógico', card: 'linear-gradient(90deg,#1b2a5e,#2e4a8a,#5aa9f2)', navbar: 'linear-gradient(90deg,#0e1838,#1b2a5e,#2e4a8a)' }
];

export function getPaleta(id) {
    return PALETAS.find((p) => p.id === id) || PALETAS[0];
}

export const CURSO_ORIGINAL_ID = '3B-2026';

export const CURSOS_BASE = [
    {
        id: CURSO_ORIGINAL_ID,
        nombre: 'III Medio B',
        anio: 2026,
        colegio: '',
        emoji: '🏛️',
        paleta: 'violeta',
        contentPackId: DEFAULT_PACK_ID,
        activo: true,
        esDefault: true
    }
];

export function normalizeCurso(c) {
    return {
        colegio: '',
        emoji: '🎓',
        paleta: 'violeta',
        contentPackId: DEFAULT_PACK_ID,
        activo: true,
        esDefault: false,
        ...c,
        anio: Number(c.anio) || new Date().getFullYear()
    };
}

// Lista de cursos lista para usar. El curso original nunca puede faltar.
export function normalizeCursos(raw) {
    const list = (Array.isArray(raw) ? raw : Object.values(raw || {}))
        .filter((c) => c && c.id)
        .map(normalizeCurso);
    if (!list.some((c) => c.id === CURSO_ORIGINAL_ID)) list.unshift(...CURSOS_BASE);
    return list.map((c) => (c.id === CURSO_ORIGINAL_ID ? { ...c, esDefault: true } : { ...c, esDefault: false }));
}

export function getCurso(cursos, cursoId) {
    return cursos.find((c) => c.id === cursoId) || cursos[0] || CURSOS_BASE[0];
}

// Ruta en la base de datos de un recurso ('students', 'activities', ...) del curso.
export function cursoPath(curso, resource) {
    return curso.esDefault ? resource : 'cursos/' + curso.id + '/' + resource;
}

export function crearCurso(overrides = {}) {
    return normalizeCurso({
        id: 'curso-' + nextId(),
        nombre: 'Curso nuevo',
        anio: new Date().getFullYear(),
        paleta: 'esmeralda',
        ...overrides,
        esDefault: false
    });
}

// ---- seleccion recordada en el dispositivo ----
const SELECTION_KEY = 'filosofo_curso_actual';

export function saveCursoSelection(cursoId) {
    try { localStorage.setItem(SELECTION_KEY, cursoId); } catch { /* sin almacenamiento */ }
}

export function loadCursoSelection() {
    try { return localStorage.getItem(SELECTION_KEY); } catch { return null; }
}
