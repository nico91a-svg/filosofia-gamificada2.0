// Servidor en memoria con la semantica de Firebase Realtime Database que usa la
// app: varios clientes, aviso local inmediato al escribir y aviso a los demas.
import { applyPatch, clone } from '../../src/services/fbvalue.js';

export function createMemoryServer(initial = {}) {
    const data = new Map(Object.entries(clone(initial)));
    const clients = [];
    const log = []; // escrituras recibidas: { client, op, path, payload }

    const notify = (path) => {
        clients.forEach((client) => {
            if (!client.online) return;
            (client.listeners.get(path) || []).forEach((fn) => fn(clone(data.get(path) ?? null)));
        });
    };

    return {
        data,
        log,
        read: (path) => clone(data.get(path) ?? null),
        connect(name = 'cliente' + (clients.length + 1)) {
            const client = { name, online: true, listeners: new Map() };
            clients.push(client);
            return {
                kind: 'memory',
                goOffline() { client.online = false; },
                subscribe(path, onValue) {
                    if (!client.listeners.has(path)) client.listeners.set(path, new Set());
                    client.listeners.get(path).add(onValue);
                    const timer = setTimeout(() => {
                        if (client.online) onValue(clone(data.get(path) ?? null));
                    }, 0);
                    return () => {
                        clearTimeout(timer);
                        client.listeners.get(path).delete(onValue);
                    };
                },
                set(path, value) {
                    log.push({ client: name, op: 'set', path, payload: clone(value) });
                    if (value === null || value === undefined) data.delete(path);
                    else data.set(path, clone(value));
                    notify(path);
                    return Promise.resolve();
                },
                update(path, patch) {
                    log.push({ client: name, op: 'update', path, payload: clone(patch) });
                    data.set(path, applyPatch(data.get(path) ?? null, patch));
                    notify(path);
                    return Promise.resolve();
                }
            };
        }
    };
}

export function memoryStorage() {
    const map = new Map();
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, String(v)),
        removeItem: (k) => map.delete(k)
    };
}

// Espera a que se vacien temporizadores cortos y microtareas pendientes.
export const settle = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms));
