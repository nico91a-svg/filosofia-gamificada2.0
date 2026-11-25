import { describe, expect, it } from 'vitest';
import { DEFAULT_RULESET_ID, RULESETS, getRuleset, validateRuleset } from '../src/domain/rulesets.js';
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
