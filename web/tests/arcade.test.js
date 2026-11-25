import { describe, expect, it } from 'vitest';
import { crearEnlace, esUrlSegura, normalizeEnlace, urlSegura } from '../src/domain/arcade.js';

describe('arcade: urlSegura', () => {
    it('acepta http y https', () => {
        expect(urlSegura('https://ejemplo.com/juego')).toBe('https://ejemplo.com/juego');
        expect(urlSegura('http://ejemplo.com')).toBe('http://ejemplo.com/');
    });

    it('antepone https:// a una url sin esquema', () => {
        expect(urlSegura('ejemplo.com/juego')).toBe('https://ejemplo.com/juego');
    });

    it('rechaza esquemas peligrosos', () => {
        expect(urlSegura('javascript:alert(1)')).toBe('');
        expect(urlSegura('data:text/html,<script>')).toBe('');
        expect(urlSegura('file:///etc/passwd')).toBe('');
    });

    it('rechaza basura y hosts sin punto', () => {
        expect(urlSegura('')).toBe('');
        expect(urlSegura('   ')).toBe('');
        expect(urlSegura('no es una url')).toBe('');
        expect(urlSegura('localhost')).toBe('');
        expect(urlSegura(null)).toBe('');
        expect(urlSegura(42)).toBe('');
    });

    it('esUrlSegura refleja urlSegura', () => {
        expect(esUrlSegura('https://ok.com')).toBe(true);
        expect(esUrlSegura('javascript:1')).toBe(false);
    });
});

describe('arcade: normalizeEnlace', () => {
    it('completa campos faltantes con valores seguros', () => {
        const e = normalizeEnlace({ url: 'https://ok.com' });
        expect(e.titulo).toBe('Juego sin título');
        expect(e.url).toBe('https://ok.com/');
        expect(e.descripcion).toBe('');
        expect(e.habilidadId).toBe(null);
        expect(e.unidadId).toBe(null);
        expect(typeof e.id).toBe('number');
    });

    it('conserva un enlace completo y valida la url', () => {
        const e = normalizeEnlace({
            id: 7, titulo: 'Tranvía', url: 'tranvia.cl/jugar',
            descripcion: 'Dilema', habilidadId: 'H2', unidadId: 'U1'
        });
        expect(e).toEqual({
            id: 7, titulo: 'Tranvía', url: 'https://tranvia.cl/jugar',
            descripcion: 'Dilema', habilidadId: 'H2', unidadId: 'U1'
        });
    });

    it('vacía la url cuando no es segura', () => {
        expect(normalizeEnlace({ titulo: 'X', url: 'javascript:1' }).url).toBe('');
    });

    it('recorta títulos y descripciones demasiado largos', () => {
        const e = normalizeEnlace({ titulo: 'a'.repeat(200), descripcion: 'b'.repeat(500), url: 'https://ok.com' });
        expect(e.titulo.length).toBe(80);
        expect(e.descripcion.length).toBe(240);
    });

    it('crearEnlace produce un enlace normalizable con id propio', () => {
        const a = crearEnlace();
        const b = crearEnlace();
        expect(a.id).not.toBe(b.id);
    });
});
