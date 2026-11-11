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

export const PALETAS = [
    { id: 'violeta', label: 'Violeta filosófico', card: 'linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef)', navbar: 'linear-gradient(90deg,#4338ca,#7c3aed,#c026d3)' },
    { id: 'esmeralda', label: 'Verde epistémico', card: 'linear-gradient(90deg,#10b981,#14b8a6,#06b6d4)', navbar: 'linear-gradient(90deg,#047857,#0f766e,#0891b2)' },
    { id: 'ambar', label: 'Ámbar retórico', card: 'linear-gradient(90deg,#f59e0b,#f97316,#f43f5e)', navbar: 'linear-gradient(90deg,#b45309,#c2410c,#be123c)' },
    { id: 'azul', label: 'Azul dialógico', card: 'linear-gradient(90deg,#0ea5e9,#3b82f6,#6366f1)', navbar: 'linear-gradient(90deg,#0369a1,#1d4ed8,#4338ca)' }
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
