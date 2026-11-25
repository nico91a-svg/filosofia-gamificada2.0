// Rulesets: las "reglas de progresión" de un curso. Un ruleset agrupa las
// habilidades que se entrenan, sus niveles, y los tipos de actividad con sus
// rúbricas de XP y de habilidad. Cada curso elige un ruleset igual que elige
// un pack de contenido (ver data/cursos.js), de modo que cursos de distinto
// grupo etario puedan tener su propia progresión.
//
// Lo que NO depende del ruleset (común a todos): niveles de XP, cofres,
// artefactos y misiones.
//
// IMPORTANTE: los puntos de habilidad que gana una actividad quedan GUARDADOS
// en la propia actividad al registrarla, así que cambiar el ruleset de un
// curso no reescribe su historial.
import {
    HABILIDADES, HABILIDAD_NIVELES, makeGetHabilidadNivel
} from './habilidades.js';
import {
    CATEGORIAS_ACTIVIDAD, RUBRICS_HABILIDADES, RUBRICS_XP, TIPOS_ACTIVIDAD
} from './tipos-actividad.js';

// ---- Preset 1: Filosofía III Medio (el de siempre; comportamiento idéntico) ----
const FILOSOFIA = {
    id: 'filosofia-3medio',
    nombre: 'Filosofía 3° medio',
    descripcion: '6 habilidades filosóficas y el repertorio completo de actividades (plan común chileno).',
    grupoEtario: 'Media (15-18 años)',
    habilidades: HABILIDADES,
    habilidadNiveles: HABILIDAD_NIVELES,
    categorias: CATEGORIAS_ACTIVIDAD,
    tipos: TIPOS_ACTIVIDAD,
    rubricsXP: RUBRICS_XP,
    rubricsHabilidades: RUBRICS_HABILIDADES
};

// ---- Preset 2: Filosofía para básica (grupo etario menor, más simple) ----
const BASICA_HABILIDADES = [
    { id: 'B1', nombre: 'Observar', shortName: 'Observar', emoji: '👀', color: '#3B82F6',
      descripcion: 'Mirar con atención y describir lo que se ve, se lee o se escucha.',
      comoMejora: 'Rutinas de observación, descripción de imágenes, lectura de cuentos' },
    { id: 'B2', nombre: 'Preguntar', shortName: 'Preguntar', emoji: '❓', color: '#F59E0B',
      descripcion: 'Tener curiosidad y formular buenas preguntas sobre el mundo.',
      comoMejora: 'Pregunta del día, lluvia de preguntas, juegos de "¿por qué?"' },
    { id: 'B3', nombre: 'Argumentar', shortName: 'Argumentar', emoji: '⚖️', color: '#EC4899',
      descripcion: 'Dar razones y ejemplos para apoyar una idea propia.',
      comoMejora: 'Mini-debates, "yo pienso que... porque...", trabajos creativos' },
    { id: 'B4', nombre: 'Dialogar', shortName: 'Dialogar', emoji: '🤝', color: '#10B981',
      descripcion: 'Escuchar a los demás, respetar turnos y construir ideas en grupo.',
      comoMejora: 'Diálogos en círculo, trabajo en equipo, respeto de turnos' }
];

const BASICA_NIVELES = [
    { nivel: 1, nombre: 'Explorador/a', min: 0, max: 9 },
    { nivel: 2, nombre: 'Aprendiz', min: 10, max: 24 },
    { nivel: 3, nombre: 'Pensador/a', min: 25, max: 49 },
    { nivel: 4, nombre: 'Sabio/a', min: 50, max: 9999 }
];

const BASICA_TIPOS = [
    // cotidianas
    { id: 'participacion', nombre: 'Participación', icon: '💬', categoria: 'cotidiana' },
    { id: 'pregunta_del_dia', nombre: 'Pregunta del Día', icon: '❓', categoria: 'cotidiana' },
    { id: 'juego', nombre: 'Juego Filosófico', icon: '🎲', categoria: 'cotidiana' },
    // proceso
    { id: 'lectura_cuento', nombre: 'Lectura de Cuento', icon: '📖', categoria: 'proceso' },
    { id: 'rutina', nombre: 'Rutina de Pensamiento', icon: '🧩', categoria: 'proceso' },
    { id: 'dibujo', nombre: 'Dibujo Filosófico', icon: '🎨', categoria: 'proceso' },
    { id: 'mini_debate', nombre: 'Mini-Debate', icon: '🗣️', categoria: 'proceso' },
    // evaluacion
    { id: 'trabajo_creativo', nombre: 'Trabajo Creativo', icon: '✨', categoria: 'evaluacion' },
    { id: 'control_simple', nombre: 'Control', icon: '📝', categoria: 'evaluacion' }
];

const BASICA_XP = {
    participacion: { basico: 5, competente: 8, avanzado: 12, excepcional: 16 },
    pregunta_del_dia: { basico: 5, competente: 10, avanzado: 15, excepcional: 20 },
    juego: { basico: 8, competente: 12, avanzado: 18, excepcional: 24 },
    lectura_cuento: { basico: 10, competente: 18, avanzado: 26, excepcional: 34 },
    rutina: { basico: 10, competente: 18, avanzado: 28, excepcional: 38 },
    dibujo: { basico: 10, competente: 16, avanzado: 24, excepcional: 32 },
    mini_debate: { basico: 15, competente: 25, avanzado: 38, excepcional: 50 },
    trabajo_creativo: { basico: 20, competente: 35, avanzado: 50, excepcional: 65 },
    control_simple: { basico: 20, competente: 32, avanzado: 46, excepcional: 60 }
};

const BASICA_HAB = {
    participacion: { B4: 1, B2: 1 },
    pregunta_del_dia: { B2: 3 },
    juego: { B1: 1, B2: 1, B4: 1 },
    lectura_cuento: { B1: 3, B2: 1 },
    rutina: { B1: 2, B2: 2 },
    dibujo: { B1: 2, B3: 1 },
    mini_debate: { B3: 3, B4: 2 },
    trabajo_creativo: { B3: 2, B1: 2 },
    control_simple: { B1: 2, B3: 2 }
};

const BASICA = {
    id: 'basica-introduccion',
    nombre: 'Filosofía para básica',
    descripcion: '4 habilidades sencillas (observar, preguntar, argumentar, dialogar) y actividades para los más pequeños.',
    grupoEtario: 'Básica (10-14 años)',
    habilidades: BASICA_HABILIDADES,
    habilidadNiveles: BASICA_NIVELES,
    categorias: CATEGORIAS_ACTIVIDAD,
    tipos: BASICA_TIPOS,
    rubricsXP: BASICA_XP,
    rubricsHabilidades: BASICA_HAB
};

// Cada ruleset expone su propia función puntos -> nivel ya derivada.
function conNivel(ruleset) {
    return { ...ruleset, getHabilidadNivel: makeGetHabilidadNivel(ruleset.habilidadNiveles) };
}

export const RULESETS = [FILOSOFIA, BASICA].map(conNivel);
export const DEFAULT_RULESET_ID = FILOSOFIA.id;

export function getRuleset(id) {
    return RULESETS.find((r) => r.id === id) || RULESETS[0];
}

// ---- Rulesets personalizados (editados por el docente, guardados por curso) ----
//
// El docente puede partir de un preset y editarlo en la app. El resultado se
// guarda como dato del curso (ver useCourseData / database.rules.json) y pasa a
// ser la progresión efectiva de ese curso. Nunca cambia los ids de habilidades
// ni de tipos ya usados (el historial de actividades los referencia).

function _lista(v) {
    if (!v) return [];
    return (Array.isArray(v) ? v : Object.values(v)).filter(Boolean);
}

// Copia de datos de un ruleset lista para editar y guardar (sin la función).
export function rulesetEditable(ruleset) {
    const r = ruleset || getRuleset(DEFAULT_RULESET_ID);
    return {
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion || '',
        grupoEtario: r.grupoEtario || '',
        basadoEn: r.basadoEn || r.id,
        habilidades: _lista(r.habilidades).map((h) => ({ ...h })),
        habilidadNiveles: _lista(r.habilidadNiveles).map((n) => ({ ...n })),
        categorias: _lista(r.categorias).map((c) => ({ ...c })),
        tipos: _lista(r.tipos).map((t) => ({ ...t })),
        rubricsXP: { ...(r.rubricsXP || {}) },
        rubricsHabilidades: { ...(r.rubricsHabilidades || {}) }
    };
}

// Deja un ruleset guardado (que vuelve de la base de datos, quizá incompleto)
// en forma segura y usable, con su función puntos->nivel ya derivada.
export function normalizeRuleset(raw) {
    const r = raw || {};
    const habilidades = _lista(r.habilidades).map((h) => ({
        id: h.id, nombre: h.nombre || h.id, shortName: h.shortName || h.nombre || h.id,
        emoji: h.emoji || '⭐', color: h.color || '#9d6bd8',
        descripcion: h.descripcion || '', comoMejora: h.comoMejora || ''
    })).filter((h) => h.id);
    let niveles = _lista(r.habilidadNiveles).map((n) => ({
        nivel: Number(n.nivel) || 0, nombre: n.nombre || ('Nivel ' + n.nivel),
        min: Number(n.min) || 0, max: n.max != null ? Number(n.max) : 9999
    })).sort((a, b) => a.min - b.min);
    if (!niveles.length) niveles = HABILIDAD_NIVELES;
    const categorias = _lista(r.categorias).length ? _lista(r.categorias) : CATEGORIAS_ACTIVIDAD;
    const tipos = _lista(r.tipos).map((t) => ({
        id: t.id, nombre: t.nombre || t.id, icon: t.icon || '📌', categoria: t.categoria || 'cotidiana'
    })).filter((t) => t.id);
    return {
        id: r.id || 'personalizado',
        nombre: r.nombre || 'Progresión personalizada',
        descripcion: r.descripcion || '',
        grupoEtario: r.grupoEtario || '',
        basadoEn: r.basadoEn || null,
        habilidades: habilidades.length ? habilidades : getRuleset(DEFAULT_RULESET_ID).habilidades,
        habilidadNiveles: niveles,
        categorias,
        tipos: tipos.length ? tipos : getRuleset(DEFAULT_RULESET_ID).tipos,
        rubricsXP: { ...(r.rubricsXP || {}) },
        rubricsHabilidades: { ...(r.rubricsHabilidades || {}) },
        getHabilidadNivel: makeGetHabilidadNivel(niveles),
        personalizado: true
    };
}

// Lista de problemas de un ruleset (vacía si está correcto). La usan las pruebas.
export function validateRuleset(ruleset) {
    const problemas = [];
    const r = ruleset || {};
    if (!r.id) problemas.push('falta id');
    if (!Array.isArray(r.habilidades) || r.habilidades.length === 0) problemas.push('sin habilidades');
    if (!Array.isArray(r.tipos) || r.tipos.length === 0) problemas.push('sin tipos de actividad');
    const habIds = new Set((r.habilidades || []).map((h) => h.id));
    if (habIds.size !== (r.habilidades || []).length) problemas.push('ids de habilidad repetidos');
    const tipoIds = new Set((r.tipos || []).map((t) => t.id));
    if (tipoIds.size !== (r.tipos || []).length) problemas.push('ids de tipo repetidos');
    for (const t of r.tipos || []) {
        if (!r.rubricsXP || !r.rubricsXP[t.id]) problemas.push('falta rúbrica de XP para ' + t.id);
        const hab = r.rubricsHabilidades && r.rubricsHabilidades[t.id];
        for (const habId of Object.keys(hab || {})) {
            if (!habIds.has(habId)) problemas.push('la actividad ' + t.id + ' apunta a una habilidad inexistente: ' + habId);
        }
    }
    return problemas;
}
