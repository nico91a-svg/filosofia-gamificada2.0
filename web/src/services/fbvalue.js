// Utilidades para comparar y recorrer valores con la semantica de Firebase
// Realtime Database:
//  - null, undefined, [] y {} son lo mismo (el nodo no existe);
//  - un arreglo es un objeto con claves numericas ("0", "1", ...).
// Todo aqui es puro (sin red, sin React) para poder probarlo con tests unitarios.

const isObject = (v) => v !== null && typeof v === 'object';

// Forma canonica: sin vacios y con los arreglos convertidos a objetos indexados.
export function canon(value) {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number' && Number.isNaN(value)) return undefined;
    if (!isObject(value)) return value;
    const out = {};
    for (const key of Object.keys(value)) {
        const child = canon(value[key]);
        if (child !== undefined) out[key] = child;
    }
    return Object.keys(out).length === 0 ? undefined : out;
}

function deepEqualCanon(a, b) {
    if (a === b) return true;
    if (!isObject(a) || !isObject(b)) return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqualCanon(a[k], b[k]));
}

// Igualdad "segun Firebase": dos valores que se guardarian igual son iguales.
export function fbEqual(a, b) {
    return deepEqualCanon(canon(a), canon(b));
}

// Entradas [clave, item] de un nodo coleccion (arreglo u objeto), sin huecos.
export function entriesOf(raw) {
    if (!isObject(raw)) return [];
    return Object.keys(raw)
        .filter((key) => raw[key] !== null && raw[key] !== undefined)
        .map((key) => [key, raw[key]]);
}

// Aplica un parche multi-ruta ({ "3/xp": 120, "3/badges": null }) sobre un valor,
// igual que `ref.update()`. Devuelve un valor nuevo; no muta el original.
export function applyPatch(value, patch) {
    let root = isObject(value) ? clone(value) : {};
    for (const [route, next] of Object.entries(patch)) {
        const parts = route.split('/').filter(Boolean);
        let node = root;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!isObject(node[parts[i]])) node[parts[i]] = {};
            node = node[parts[i]];
        }
        const last = parts[parts.length - 1];
        if (next === null || next === undefined) {
            if (Array.isArray(node)) node[last] = null;
            else delete node[last];
        } else {
            node[last] = clone(next);
        }
    }
    return root;
}

export function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}
