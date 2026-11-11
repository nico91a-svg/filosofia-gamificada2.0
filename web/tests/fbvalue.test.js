import { describe, expect, it } from 'vitest';
import { applyPatch, canon, entriesOf, fbEqual } from '../src/services/fbvalue.js';

describe('fbEqual (igualdad segun Firebase)', () => {
    it('trata null, undefined, [] y {} como el mismo valor', () => {
        expect(fbEqual(null, undefined)).toBe(true);
        expect(fbEqual([], null)).toBe(true);
        expect(fbEqual({}, [])).toBe(true);
        expect(fbEqual({ a: [] }, {})).toBe(true);
        expect(fbEqual({ a: { b: {} } }, null)).toBe(true);
    });

    it('trata un arreglo como objeto de claves numericas', () => {
        expect(fbEqual(['a', 'b'], { 0: 'a', 1: 'b' })).toBe(true);
        expect(fbEqual(['a', null, 'c'], { 0: 'a', 2: 'c' })).toBe(true);
    });

    it('distingue valores realmente distintos', () => {
        expect(fbEqual({ xp: 10 }, { xp: 11 })).toBe(false);
        expect(fbEqual({ xp: 0 }, {})).toBe(false);
        expect(fbEqual(false, null)).toBe(false);
        expect(fbEqual('', null)).toBe(false);
        expect(fbEqual(['a'], ['a', 'b'])).toBe(false);
    });

    it('canon elimina los vacios anidados', () => {
        expect(canon({ a: 1, b: [], c: { d: null } })).toEqual({ a: 1 });
    });
});

describe('entriesOf', () => {
    it('conserva las claves reales y salta los huecos', () => {
        expect(entriesOf(['a', null, 'c'])).toEqual([['0', 'a'], ['2', 'c']]);
        expect(entriesOf({ x: 1, y: null })).toEqual([['x', 1]]);
        expect(entriesOf(null)).toEqual([]);
    });
});

describe('applyPatch', () => {
    it('escribe solo las rutas indicadas sin mutar el original', () => {
        const original = [{ id: 1, xp: 5, badges: ['a'] }, { id: 2, xp: 0 }];
        const next = applyPatch(original, { '0/xp': 15, '1/badges': ['b'] });
        expect(next[0]).toEqual({ id: 1, xp: 15, badges: ['a'] });
        expect(next[1]).toEqual({ id: 2, xp: 0, badges: ['b'] });
        expect(original[0].xp).toBe(5);
    });

    it('null borra el campo', () => {
        expect(applyPatch({ a: { x: 1, y: 2 } }, { 'a/x': null })).toEqual({ a: { y: 2 } });
    });
});
