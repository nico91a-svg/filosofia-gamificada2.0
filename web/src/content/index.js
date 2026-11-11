// Registro de packs de contenido.
//
// Para agregar contenido de un curso nuevo:
//   1. Copiar packs/etica-introduccion.js con otro nombre y editarlo.
//   2. Importarlo aqui y agregarlo a CONTENT_PACKS.
//   3. `npm test` valida su estructura (ver validatePack mas abajo).
// El pack queda disponible al crear o editar un curso en el panel docente.
import filosofia3Medio from './packs/filosofia-3medio.js';
import eticaIntroduccion from './packs/etica-introduccion.js';

export const CONTENT_PACKS = [filosofia3Medio, eticaIntroduccion];

export const DEFAULT_PACK_ID = filosofia3Medio.id;

export function getContentPack(id) {
    return CONTENT_PACKS.find((pack) => pack.id === id) || filosofia3Medio;
}

// Deja una unidad en forma segura para la interfaz. Firebase no guarda arreglos
// vacios, asi que una unidad editada puede volver sin `vocabulario` o `clases`.
export function normalizeUnidad(u) {
    const instrumentos = u.instrumentosEvaluacion || {};
    return {
        ...u,
        objetivos: toList(u.objetivos),
        clases: toList(u.clases),
        vocabulario: toList(u.vocabulario),
        evaluacionSumativa: { nombre: '', descripcion: '', ...(u.evaluacionSumativa || {}) },
        instrumentosEvaluacion: {
            sumativa: toList(instrumentos.sumativa),
            formativa: toList(instrumentos.formativa),
            diagnostica: toList(instrumentos.diagnostica)
        }
    };
}

export function normalizeUnidades(raw) {
    return toList(raw).map(normalizeUnidad);
}

function toList(value) {
    if (!value) return [];
    return (Array.isArray(value) ? value : Object.values(value)).filter(Boolean);
}

// Colores de unidad permitidos. Tailwind genera solo las clases que encuentra
// escritas en el codigo, por eso un color fuera de esta lista no se veria.
export const COLORES_UNIDAD = [
    'from-blue-500 to-indigo-600',
    'from-green-500 to-emerald-600',
    'from-purple-500 to-violet-600',
    'from-orange-500 to-red-600',
    'from-amber-500 to-orange-600',
    'from-teal-500 to-cyan-600',
    'from-pink-500 to-rose-600',
    'from-sky-500 to-blue-600'
];

// Devuelve la lista de problemas de un pack (vacia si esta correcto).
export function validatePack(pack) {
    const errors = [];
    const fail = (msg) => errors.push('[' + (pack && pack.id ? pack.id : 'pack') + '] ' + msg);

    if (!pack || typeof pack !== 'object') return ['pack invalido'];
    for (const field of ['id', 'nombre', 'descripcion', 'version']) {
        if (!pack[field] || typeof pack[field] !== 'string') fail('falta el campo "' + field + '"');
    }
    if (!Array.isArray(pack.unidades) || pack.unidades.length === 0) {
        fail('debe tener al menos una unidad');
        return errors;
    }

    const unitIds = new Set();
    pack.unidades.forEach((u, index) => {
        const where = 'unidad ' + (u.id || '#' + (index + 1));
        if (!/^U\d+$/.test(u.id || '')) fail(where + ': el id debe tener la forma U1, U2, ...');
        if (unitIds.has(u.id)) fail(where + ': id repetido');
        unitIds.add(u.id);
        for (const field of ['nombre', 'emoji', 'periodo']) {
            if (!u[field]) fail(where + ': falta "' + field + '"');
        }
        if (!COLORES_UNIDAD.includes(u.color)) fail(where + ': color no permitido "' + u.color + '"');
        if (!Array.isArray(u.objetivos) || u.objetivos.length === 0) fail(where + ': faltan objetivos');
        if (!u.evaluacionSumativa || !u.evaluacionSumativa.nombre) fail(where + ': falta evaluacionSumativa.nombre');

        if (!Array.isArray(u.clases) || u.clases.length === 0) {
            fail(where + ': debe tener clases');
        } else {
            u.clases.forEach((c, i) => {
                if (c.num !== i + 1) fail(where + ': las clases deben numerarse 1..n en orden (clase ' + (i + 1) + ')');
                if (!c.titulo || !c.descripcion) fail(where + ' clase ' + c.num + ': falta titulo o descripcion');
            });
            if (u.totalClases !== u.clases.length) fail(where + ': totalClases no coincide con la cantidad de clases');
        }

        const terms = new Set();
        (u.vocabulario || []).forEach((v) => {
            if (!v.termino || !v.definicion) fail(where + ': termino de vocabulario incompleto');
            if (terms.has(v.termino)) fail(where + ': termino repetido "' + v.termino + '"');
            terms.add(v.termino);
        });
    });

    return errors;
}
