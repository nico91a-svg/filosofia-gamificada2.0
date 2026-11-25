// Arcade: biblioteca de enlaces a juegos y recursos externos que el docente
// cura por curso. Los estudiantes solo los ven y los abren; el docente los
// agrega, edita y borra.
//
// Un enlace del arcade combina:
//   - titulo, descripcion: texto libre;
//   - url: SIEMPRE validada (solo http/https) antes de guardarse o abrirse,
//     para que un enlace malicioso (javascript:, data:) no pueda colarse;
//   - habilidadId / unidadId: opcionales, para relacionar el juego con una
//     habilidad filosofica o una unidad del curso.
import { nextId } from './ids.js';

export const ARCADE_MAX_TITULO = 80;
export const ARCADE_MAX_DESCRIPCION = 240;

// Devuelve la URL normalizada si es segura (http/https), o '' si no lo es.
// Acepta una url sin esquema anteponiendo https:// (el caso tipico de pegar
// "ejemplo.com/juego").
export function urlSegura(raw) {
    if (typeof raw !== 'string') return '';
    let texto = raw.trim();
    if (!texto) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(texto)) texto = 'https://' + texto;
    let url;
    try {
        url = new URL(texto);
    } catch {
        return '';
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    if (!url.hostname || !url.hostname.includes('.')) return '';
    return url.href;
}

export function esUrlSegura(raw) {
    return urlSegura(raw) !== '';
}

// Recorta un texto a un maximo de caracteres, sin romper nada si no es string.
function recorta(valor, max) {
    if (typeof valor !== 'string') return '';
    const limpio = valor.trim();
    return limpio.length > max ? limpio.slice(0, max) : limpio;
}

// Deja un enlace en forma segura para guardar o mostrar. Un enlace sin url
// valida queda con url '' (la interfaz no lo abre y el docente lo ve marcado).
export function normalizeEnlace(raw) {
    const e = raw || {};
    return {
        id: e.id != null ? e.id : nextId(),
        titulo: recorta(e.titulo, ARCADE_MAX_TITULO) || 'Juego sin título',
        url: urlSegura(e.url),
        descripcion: recorta(e.descripcion, ARCADE_MAX_DESCRIPCION),
        habilidadId: typeof e.habilidadId === 'string' && e.habilidadId ? e.habilidadId : null,
        unidadId: typeof e.unidadId === 'string' && e.unidadId ? e.unidadId : null
    };
}

export function crearEnlace(overrides = {}) {
    return normalizeEnlace({ id: nextId(), titulo: '', url: '', descripcion: '', ...overrides });
}
