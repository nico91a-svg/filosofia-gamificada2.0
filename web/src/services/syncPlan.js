// Decide QUE escribir en la base de datos a partir de la diferencia entre lo
// ultimo que se sabe del servidor (base) y el estado local. Funciones puras.
//
// La regla central: nunca reescribir mas de lo que cambio. Antes cada cliente
// guardaba el arreglo completo de estudiantes ante cualquier cambio, asi que un
// celular con datos viejos podia pisar el progreso de todo el curso. Ahora un
// cambio de XP escribe solo `students/<clave>/xp`.

import { fbEqual } from './fbvalue.js';

// base: [{ key, item }] en el orden del servidor (item ya normalizado).
// local: arreglo de items.
// Devuelve { type: 'none' } | { type: 'update', patch } | { type: 'set', value }.
export function planCollectionWrite(base, local) {
    const sameShape = base.length === local.length &&
        local.every((item, i) => sameId(item, base[i].item));

    // Alta, baja o reordenamiento: se reescribe la coleccion completa. Son
    // acciones poco frecuentes y exclusivas del docente.
    if (!sameShape) {
        return local.length === 0 && base.length === 0
            ? { type: 'none' }
            : { type: 'set', value: local };
    }

    const patch = {};
    local.forEach((item, i) => {
        const { key, item: remote } = base[i];
        const fields = new Set([...Object.keys(remote || {}), ...Object.keys(item || {})]);
        for (const field of fields) {
            if (!fbEqual(remote ? remote[field] : undefined, item ? item[field] : undefined)) {
                const next = item ? item[field] : undefined;
                patch[key + '/' + field] = next === undefined ? null : next;
            }
        }
    });

    return Object.keys(patch).length === 0 ? { type: 'none' } : { type: 'update', patch };
}

export function planValueWrite(base, local) {
    return fbEqual(base, local) ? { type: 'none' } : { type: 'set', value: local };
}

function sameId(a, b) {
    return !!a && !!b && a.id !== undefined && a.id === b.id;
}
