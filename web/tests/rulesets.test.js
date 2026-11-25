import { describe, expect, it } from 'vitest';
import { DEFAULT_RULESET_ID, RULESETS, getRuleset, normalizeRuleset, rulesetEditable, validateRuleset } from '../src/domain/rulesets.js';
import { makeGetHabilidadNivel } from '../src/domain/habilidades.js';

describe('rulesets', () => {
    it('todos los rulesets registrados son válidos', () => {
        for (const r of RULESETS) {
            expect(validateRuleset(r), r.id).toEqual([]);
        }
    });

    it('los ids de ruleset son únicos', () => {
        const ids = RULESETS.map((r) => r.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('el ruleset por defecto existe y es el de 3° medio', () => {
        expect(getRuleset(DEFAULT_RULESET_ID).id).toBe(DEFAULT_RULESET_ID);
        expect(getRuleset(DEFAULT_RULESET_ID).habilidades).toHaveLength(6);
    });

    it('un id desconocido cae al primer ruleset', () => {
        expect(getRuleset('no-existe').id).toBe(RULESETS[0].id);
    });

    it('cada ruleset trae su propia función puntos -> nivel', () => {
        for (const r of RULESETS) {
            expect(typeof r.getHabilidadNivel).toBe('function');
            expect(r.getHabilidadNivel(0)).toBe(1);
        }
    });

    it('validateRuleset detecta una actividad que apunta a una habilidad inexistente', () => {
        const roto = {
            id: 'x', nombre: 'X',
            habilidades: [{ id: 'H1' }],
            tipos: [{ id: 't1', categoria: 'cotidiana' }],
            rubricsXP: { t1: { basico: 1 } },
            rubricsHabilidades: { t1: { H9: 2 } }
        };
        expect(validateRuleset(roto)).toContain('la actividad t1 apunta a una habilidad inexistente: H9');
    });
});

describe('rulesets personalizados', () => {
    it('rulesetEditable copia los datos sin la función puntos->nivel', () => {
        const editable = rulesetEditable(getRuleset(DEFAULT_RULESET_ID));
        expect(editable.getHabilidadNivel).toBeUndefined();
        expect(editable.habilidades.length).toBe(6);
        expect(Array.isArray(editable.tipos)).toBe(true);
    });

    it('normalizeRuleset acepta datos de Firebase (objetos en vez de arreglos) y deriva la función', () => {
        const raw = {
            id: 'custom', nombre: 'Mi curso', grupoEtario: '8° básico',
            habilidades: { 0: { id: 'X1', nombre: 'Observar' }, 1: { id: 'X2', nombre: 'Preguntar' } },
            habilidadNiveles: { 0: { nivel: 1, min: 0 }, 1: { nivel: 2, min: 8 } },
            tipos: { 0: { id: 'juego', nombre: 'Juego', categoria: 'cotidiana' } },
            rubricsXP: { juego: { basico: 5, competente: 10, avanzado: 15, excepcional: 20 } },
            rubricsHabilidades: { juego: { X1: 2 } }
        };
        const r = normalizeRuleset(raw);
        expect(r.habilidades.map((h) => h.id)).toEqual(['X1', 'X2']);
        expect(r.tipos.map((t) => t.id)).toEqual(['juego']);
        expect(typeof r.getHabilidadNivel).toBe('function');
        expect(r.getHabilidadNivel(0)).toBe(1);
        expect(r.getHabilidadNivel(8)).toBe(2);
        expect(r.personalizado).toBe(true);
        expect(validateRuleset(r)).toEqual([]);
    });

    it('normalizeRuleset tolera datos vacíos cayendo al preset por defecto', () => {
        const r = normalizeRuleset({});
        expect(r.habilidades.length).toBeGreaterThan(0);
        expect(r.tipos.length).toBeGreaterThan(0);
        expect(typeof r.getHabilidadNivel).toBe('function');
    });

    it('un ruleset editable, al re-normalizarse, sigue siendo válido', () => {
        const editable = rulesetEditable(getRuleset('basica-introduccion'));
        expect(validateRuleset(normalizeRuleset(editable))).toEqual([]);
    });
});

describe('makeGetHabilidadNivel', () => {
    it('respeta los umbrales dados', () => {
        const getNivel = makeGetHabilidadNivel([
            { nivel: 1, min: 0 }, { nivel: 2, min: 10 }, { nivel: 3, min: 25 }
        ]);
        expect(getNivel(0)).toBe(1);
        expect(getNivel(9)).toBe(1);
        expect(getNivel(10)).toBe(2);
        expect(getNivel(24)).toBe(2);
        expect(getNivel(25)).toBe(3);
        expect(getNivel(999)).toBe(3);
    });

    it('tolera entradas raras', () => {
        const getNivel = makeGetHabilidadNivel([{ nivel: 1, min: 0 }, { nivel: 2, min: 10 }]);
        expect(getNivel(undefined)).toBe(1);
        expect(getNivel(null)).toBe(1);
        expect(getNivel('abc')).toBe(1);
    });
});
