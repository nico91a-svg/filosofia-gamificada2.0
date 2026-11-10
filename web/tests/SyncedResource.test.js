import { describe, expect, it } from 'vitest';
import { SyncedResource } from '../src/services/SyncedResource.js';
import { normalizeStudent } from '../src/domain/estudiantes.js';
import { createMemoryServer, memoryStorage, settle } from './helpers/memoryServer.js';

const alumnos = () => [
    { id: 1, nombre: 'Ana', password: 'a', xp: 10, badges: ['iniciado'] },
    { id: 2, nombre: 'Beto', password: 'b', xp: 20, badges: ['iniciado'] }
];

function abrir(server, nombre, extra = {}) {
    const resource = new SyncedResource({
        backend: server.connect(nombre), path: 'students', kind: 'collection',
        normalize: normalizeStudent, storage: memoryStorage(), loadTimeoutMs: 20, ...extra
    });
    resource.start();
    return resource;
}

describe('SyncedResource (coleccion)', () => {
    it('cargar datos no provoca ninguna escritura', async () => {
        const server = createMemoryServer({ students: alumnos() });
        const r = abrir(server, 'profe');
        await settle();
        expect(r.getSnapshot().status).toBe('live');
        expect(r.getSnapshot().value).toHaveLength(2);
        // normalizeStudent agrega campos por defecto, pero eso no debe guardarse
        expect(r.getSnapshot().value[0].habilidades.H1).toBe(0);
        expect(server.log).toEqual([]);
    });

    it('escribe solo el campo modificado', async () => {
        const server = createMemoryServer({ students: alumnos() });
        const r = abrir(server, 'profe');
        await settle();
        r.set((prev) => prev.map((s) => (s.id === 2 ? { ...s, xp: s.xp + 15 } : s)));
        await settle();
        expect(server.log).toEqual([{ client: 'profe', op: 'update', path: 'students', payload: { '1/xp': 35 } }]);
        expect(server.read('students')[1].xp).toBe(35);
        expect(server.read('students')[0]).toEqual(alumnos()[0]);
    });

    it('agrupa varias modificaciones seguidas en una sola escritura', async () => {
        const server = createMemoryServer({ students: alumnos() });
        const r = abrir(server, 'profe');
        await settle();
        for (let i = 0; i < 5; i++) {
            r.set((prev) => prev.map((s) => ({ ...s, xp: s.xp + 1 })));
        }
        await settle();
        expect(server.log).toHaveLength(1);
        expect(server.log[0].payload).toEqual({ '0/xp': 15, '1/xp': 25 });
    });

    it('detecta cambios hechos mutando objetos anidados del estado anterior', async () => {
        const server = createMemoryServer({
            students: [{ id: 1, nombre: 'Ana', xp: 0, misionesCompletadas: { U1_C1: { M06: 'x' } } }]
        });
        const r = abrir(server, 'profe');
        await settle();
        r.set((prev) => prev.map((s) => {
            const mc = Object.assign({}, s.misionesCompletadas);
            mc.U1_C1.M07 = 'y'; // mutacion del objeto compartido, como hace el panel
            return Object.assign({}, s, { misionesCompletadas: mc });
        }));
        await settle();
        expect(server.read('students')[0].misionesCompletadas.U1_C1).toEqual({ M06: 'x', M07: 'y' });
    });

    it('dos clientes que editan campos distintos no se pisan', async () => {
        const server = createMemoryServer({ students: alumnos() });
        const profe = abrir(server, 'profe');
        const ana = abrir(server, 'ana');
        await settle();

        // El docente suma XP a Ana y, a la vez, Ana abre un cofre.
        profe.set((prev) => prev.map((s) => (s.id === 1 ? { ...s, xp: 60 } : s)));
        ana.set((prev) => prev.map((s) => (s.id === 1 ? { ...s, artefactos: [{ id: 'A3', usado: false }] } : s)));
        await settle();

        const final = server.read('students')[0];
        expect(final.xp).toBe(60);
        expect(final.artefactos).toEqual([{ id: 'A3', usado: false }]);
        expect(profe.getSnapshot().value[0].artefactos).toHaveLength(1);
        expect(ana.getSnapshot().value[0].xp).toBe(60);
    });

    it('un cliente con datos viejos que no edita nada jamas escribe', async () => {
        const server = createMemoryServer({ students: alumnos() });
        const viejo = abrir(server, 'viejo');
        const profe = abrir(server, 'profe');
        await settle();
        profe.set((prev) => prev.map((s) => ({ ...s, xp: s.xp + 100 })));
        await settle();
        expect(server.log.filter((w) => w.client === 'viejo')).toEqual([]);
        expect(viejo.getSnapshot().value.map((s) => s.xp)).toEqual([110, 120]);
    });

    it('agregar un estudiante reescribe la coleccion y luego vuelve a escribir por campo', async () => {
        const server = createMemoryServer({ students: alumnos() });
        const r = abrir(server, 'profe');
        await settle();
        r.set((prev) => [...prev, normalizeStudent({ id: 3, nombre: 'Caro', password: 'c' })]);
        await settle();
        expect(server.log[0].op).toBe('set');
        expect(server.read('students')).toHaveLength(3);
        r.set((prev) => prev.map((s) => (s.id === 3 ? { ...s, xp: 5 } : s)));
        await settle();
        expect(server.log[1]).toMatchObject({ op: 'update', payload: { '2/xp': 5 } });
    });

    it('sin conexion al abrir: solo lectura con la ultima copia guardada', async () => {
        const server = createMemoryServer({ students: alumnos() });
        const storage = memoryStorage();
        storage.setItem('filosofo_cache_students', JSON.stringify(alumnos()));
        const backend = server.connect('sin-red');
        backend.goOffline();
        const r = new SyncedResource({
            backend, path: 'students', kind: 'collection', normalize: normalizeStudent, storage, loadTimeoutMs: 10
        });
        r.start();
        await settle(30);
        expect(r.getSnapshot().status).toBe('offline');
        expect(r.getSnapshot().value).toHaveLength(2);

        const aceptado = r.set((prev) => prev.map((s) => ({ ...s, xp: 0 })));
        await settle();
        expect(aceptado).toBe(false);
        expect(r.getSnapshot().blockedWrites).toBe(1);
        expect(r.getSnapshot().value[0].xp).toBe(10);
        expect(server.log).toEqual([]);
    });

    it('guarda una copia local despues de recibir datos', async () => {
        const server = createMemoryServer({ students: alumnos() });
        const storage = memoryStorage();
        const r = abrir(server, 'profe', { storage });
        await settle(450);
        expect(JSON.parse(storage.getItem('filosofo_cache_students'))).toHaveLength(2);
        r.stop();
    });
});

describe('SyncedResource (valor con respaldo)', () => {
    const fallback = [{ id: 'U1', nombre: 'Unidad del pack' }];
    const abrirValor = (server) => {
        const r = new SyncedResource({
            backend: server.connect('profe'), path: 'unidades', kind: 'value', fallback,
            storage: memoryStorage(), loadTimeoutMs: 20
        });
        r.start();
        return r;
    };

    it('usa el respaldo sin guardarlo en el servidor', async () => {
        const server = createMemoryServer();
        const r = abrirValor(server);
        await settle();
        expect(r.getSnapshot().value).toEqual(fallback);
        expect(r.getSnapshot().usingFallback).toBe(true);
        expect(server.log).toEqual([]);
    });

    it('guarda al editar y reset() vuelve al respaldo', async () => {
        const server = createMemoryServer();
        const r = abrirValor(server);
        await settle();
        r.set([{ id: 'U1', nombre: 'Editada' }]);
        await settle();
        expect(server.read('unidades')).toEqual([{ id: 'U1', nombre: 'Editada' }]);
        expect(r.getSnapshot().usingFallback).toBe(false);
        r.reset();
        await settle();
        expect(server.read('unidades')).toBe(null);
        expect(r.getSnapshot().value).toEqual(fallback);
        expect(r.getSnapshot().usingFallback).toBe(true);
    });
});
