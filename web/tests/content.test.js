import { describe, expect, it } from 'vitest';
import { CONTENT_PACKS, getContentPack, normalizeUnidades, validatePack } from '../src/content/index.js';

describe('packs de contenido', () => {
    it('todos los packs registrados son validos', () => {
        for (const pack of CONTENT_PACKS) {
            expect(validatePack(pack), pack.id).toEqual([]);
        }
    });

    it('los ids de pack son unicos', () => {
        const ids = CONTENT_PACKS.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('Filosofia III Medio conserva sus 4 unidades y 31 clases', () => {
        const pack = getContentPack('filosofia-3medio');
        expect(pack.unidades.map((u) => u.id)).toEqual(['U1', 'U2', 'U3', 'U4']);
        expect(pack.unidades.reduce((n, u) => n + u.clases.length, 0)).toBe(31);
    });

    it('un id desconocido cae al pack por defecto', () => {
        expect(getContentPack('no-existe').id).toBe('filosofia-3medio');
    });

    it('validatePack explica los errores', () => {
        const roto = {
            id: 'x', nombre: 'X', descripcion: 'd', version: '1',
            unidades: [{ id: 'unidad1', nombre: 'A', emoji: 'a', periodo: 'p', color: 'rojo', objetivos: [],
                evaluacionSumativa: {}, totalClases: 3, clases: [{ num: 2, titulo: 't', descripcion: 'd' }],
                vocabulario: [{ termino: 'a', definicion: 'b' }, { termino: 'a', definicion: 'c' }] }]
        };
        const errores = validatePack(roto).join('\n');
        expect(errores).toMatch(/U1, U2/);
        expect(errores).toMatch(/color no permitido/);
        expect(errores).toMatch(/numerarse/);
        expect(errores).toMatch(/totalClases/);
        expect(errores).toMatch(/repetido/);
    });

    it('normalizeUnidades repone lo que Firebase omite', () => {
        const [u] = normalizeUnidades({ 0: { id: 'U1', nombre: 'A' } });
        expect(u.clases).toEqual([]);
        expect(u.vocabulario).toEqual([]);
        expect(u.objetivos).toEqual([]);
        expect(u.evaluacionSumativa).toEqual({ nombre: '', descripcion: '' });
        expect(u.instrumentosEvaluacion.diagnostica).toEqual([]);
    });
});
