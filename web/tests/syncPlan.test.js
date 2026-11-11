import { describe, expect, it } from 'vitest';
import { planCollectionWrite, planValueWrite } from '../src/services/syncPlan.js';

const base = (items) => items.map((item, i) => ({ key: String(i), item }));

describe('planCollectionWrite', () => {
    const remoto = [
        { id: 1, nombre: 'Ana', xp: 10, badges: ['iniciado'], artefactos: [] },
        { id: 2, nombre: 'Beto', xp: 20, badges: ['iniciado'], artefactos: [] }
    ];

    it('no escribe nada si no hay cambios', () => {
        expect(planCollectionWrite(base(remoto), remoto.map((s) => ({ ...s })))).toEqual({ type: 'none' });
    });

    it('un cambio de XP escribe solo ese campo de ese estudiante', () => {
        const local = [remoto[0], { ...remoto[1], xp: 35 }];
        expect(planCollectionWrite(base(remoto), local)).toEqual({ type: 'update', patch: { '1/xp': 35 } });
    });

    it('usa la clave real del servidor, no la posicion', () => {
        const conClaves = [{ key: 'a', item: remoto[0] }, { key: 'b', item: remoto[1] }];
        const local = [{ ...remoto[0], xp: 11 }, remoto[1]];
        expect(planCollectionWrite(conClaves, local).patch).toEqual({ 'a/xp': 11 });
    });

    it('un campo eliminado se escribe como null', () => {
        const local = [{ id: 1, nombre: 'Ana', xp: 10, badges: ['iniciado'] }, remoto[1]];
        // artefactos: [] equivale a no tener el campo -> sin cambios
        expect(planCollectionWrite(base(remoto), local)).toEqual({ type: 'none' });
        const sinNombre = [{ id: 1, xp: 10, badges: ['iniciado'] }, remoto[1]];
        expect(planCollectionWrite(base(remoto), sinNombre).patch).toEqual({ '0/nombre': null });
    });

    it('altas, bajas y reordenamientos reescriben la coleccion', () => {
        const alta = [...remoto, { id: 3, nombre: 'Caro' }];
        expect(planCollectionWrite(base(remoto), alta)).toEqual({ type: 'set', value: alta });
        expect(planCollectionWrite(base(remoto), [remoto[1]]).type).toBe('set');
        expect(planCollectionWrite(base(remoto), [remoto[1], remoto[0]]).type).toBe('set');
    });

    it('coleccion vacia contra vacia no escribe', () => {
        expect(planCollectionWrite([], [])).toEqual({ type: 'none' });
    });
});

describe('planValueWrite', () => {
    it('compara con la semantica de Firebase', () => {
        expect(planValueWrite({ unidad: 'U1', clase: 1 }, { unidad: 'U1', clase: 1 }).type).toBe('none');
        expect(planValueWrite({ unidad: 'U1', clase: 1 }, { unidad: 'U1', clase: 2 }).type).toBe('set');
    });
});
