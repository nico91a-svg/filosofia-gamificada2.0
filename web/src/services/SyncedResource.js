// Un nodo de la base de datos sincronizado con estado local.
//
// Garantias:
//  1. Solo se escribe lo que cambio respecto de lo ultimo conocido del servidor
//     (ver syncPlan.js). Recibir datos nunca provoca una escritura.
//  2. No se escribe nada hasta haber recibido un valor real del servidor en esta
//     sesion. Si no hay red al abrir, se muestra la ultima copia guardada en modo
//     solo lectura ('offline'); asi una copia vieja jamas pisa datos nuevos.
//  3. Varias modificaciones seguidas (p. ej. un registro masivo) se agrupan en
//     una sola escritura.
//
// No depende de React: se conecta con el hook useResource (useSyncExternalStore).

import { clone, entriesOf, fbEqual } from './fbvalue.js';
import { planCollectionWrite, planValueWrite } from './syncPlan.js';

const CACHE_PREFIX = 'filosofo_cache_';
const identity = (value) => value;

export class SyncedResource {
    constructor({ backend, path, kind = 'value', normalize = identity, fallback = null,
        storage = safeStorage(), loadTimeoutMs = 10000, onError = null }) {
        this.backend = backend;
        this.path = path;
        this.kind = kind;
        this.normalize = normalize;
        this.fallback = fallback;
        this.storage = storage;
        this.loadTimeoutMs = loadTimeoutMs;
        // La copia local se separa por espacio de datos (reales vs. de prueba).
        this.cacheKey = CACHE_PREFIX + (backend.namespace ? backend.namespace + '/' : '') + path;
        this.onError = onError;

        this.value = kind === 'collection' ? [] : clone(fallback);
        this.base = kind === 'collection' ? [] : clone(fallback);
        this.status = 'loading'; // 'loading' | 'live' | 'offline'
        this.error = null;
        this.blockedWrites = 0;
        this.usingFallback = kind === 'value'; // el servidor no tiene valor propio

        this.listeners = new Set();
        this.snapshot = this.makeSnapshot();
        this.unsubscribe = null;
        this.timer = null;
        this.flushQueued = false;
        this.cacheTimer = null;

        this.subscribe = this.subscribe.bind(this);
        this.getSnapshot = this.getSnapshot.bind(this);
        this.set = this.set.bind(this);
        this.reset = this.reset.bind(this);
    }

    // ---- ciclo de vida ----
    start() {
        if (this.unsubscribe) return;
        this.unsubscribe = this.backend.subscribe(
            this.path,
            (raw) => this.handleRemote(raw),
            (error) => this.handleError(error)
        );
        if (this.status === 'loading') {
            this.timer = setTimeout(() => this.goOffline(), this.loadTimeoutMs);
        }
    }

    stop() {
        if (this.unsubscribe) this.unsubscribe();
        this.unsubscribe = null;
        clearTimeout(this.timer);
        clearTimeout(this.cacheTimer);
    }

    // ---- lectura (useSyncExternalStore) ----
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    getSnapshot() {
        return this.snapshot;
    }

    // ---- escritura local ----
    // Acepta un valor o una funcion (previo) => siguiente, como setState.
    // Devuelve false si el cambio se descarto por estar en solo lectura.
    set(updater) {
        if (this.status !== 'live') {
            this.blockedWrites += 1;
            this.emit();
            return false;
        }
        const next = typeof updater === 'function' ? updater(this.value) : updater;
        if (next === this.value) return true;
        this.value = next;
        this.emit();
        this.queueFlush();
        return true;
    }

    // Borra el nodo remoto; el valor vuelve al `fallback` (solo kind 'value').
    reset() {
        if (this.status !== 'live') return false;
        this.base = clone(this.fallback);
        this.value = clone(this.fallback);
        this.usingFallback = true;
        this.emit();
        this.write(this.backend.set(this.path, null));
        return true;
    }

    queueFlush() {
        if (this.flushQueued) return;
        this.flushQueued = true;
        queueMicrotask(() => {
            this.flushQueued = false;
            this.flush();
        });
    }

    flush() {
        if (this.status !== 'live') return;
        if (this.kind === 'collection') {
            const local = Array.isArray(this.value) ? this.value : [];
            const plan = planCollectionWrite(this.base, local);
            if (plan.type === 'none') return;
            // La base se actualiza ANTES de escribir: Firebase notifica el valor
            // local de inmediato y ese aviso debe encontrar la base ya al dia.
            if (plan.type === 'update') {
                this.base = this.base.map((entry, i) => ({ key: entry.key, item: clone(local[i]) }));
                this.write(this.backend.update(this.path, plan.patch));
            } else {
                this.base = local.map((item, i) => ({ key: String(i), item: clone(item) }));
                this.write(this.backend.set(this.path, local.length ? clone(local) : null));
            }
        } else {
            const plan = planValueWrite(this.base, this.value);
            if (plan.type === 'none') return;
            this.base = clone(this.value);
            this.usingFallback = false;
            this.emit();
            const empty = this.value === null || this.value === undefined;
            this.write(this.backend.set(this.path, empty ? null : clone(this.value)));
        }
    }

    write(promise) {
        Promise.resolve(promise).catch((error) => this.handleError(error));
    }

    // ---- datos entrantes ----
    handleRemote(raw) {
        clearTimeout(this.timer);
        let next;
        let fallbackChanged = false;
        if (this.kind === 'collection') {
            const entries = entriesOf(raw).map(([key, item]) => ({ key, item: this.normalize(item) }));
            next = entries.map((entry) => entry.item);
            // Hay una edicion local aun sin enviar: se reaplica sobre el dato
            // recien llegado para no perderla (y se enviara en el flush pendiente).
            if (this.flushQueued && this.status === 'live') {
                const local = Array.isArray(this.value) ? this.value : [];
                const pending = planCollectionWrite(this.base, local);
                if (pending.type === 'update') next = rebase(entries, pending.patch);
                else if (pending.type === 'set') next = local;
            }
            this.base = entries.map((entry) => ({ key: entry.key, item: clone(entry.item) }));
        } else {
            const missing = raw === null || raw === undefined || fbEqual(raw, null);
            next = missing ? clone(this.fallback) : this.normalize(raw);
            const pendingLocal = this.flushQueued && this.status === 'live' && !fbEqual(this.base, this.value);
            this.base = clone(next);
            if (pendingLocal) next = this.value;
            fallbackChanged = this.usingFallback !== missing;
            this.usingFallback = missing;
        }
        const wasLive = this.status === 'live';
        this.status = 'live';
        this.error = null;
        if (!wasLive || fallbackChanged || !fbEqual(next, this.value)) {
            this.value = next;
            this.emit();
        }
        this.queueCacheSave();
    }

    handleError(error) {
        console.error('[sync] ' + this.path + ':', error);
        this.error = error;
        if (this.onError) this.onError(error);
        if (this.status === 'loading') this.goOffline();
        else this.emit();
    }

    goOffline() {
        if (this.status !== 'loading') return;
        const cached = this.readCache();
        if (cached !== undefined) {
            this.value = this.kind === 'collection'
                ? (Array.isArray(cached) ? cached : []).map(this.normalize)
                : this.normalize(cached);
        }
        this.status = 'offline';
        this.emit();
    }

    // ---- copia local para abrir sin red ----
    queueCacheSave() {
        clearTimeout(this.cacheTimer);
        this.cacheTimer = setTimeout(() => {
            try {
                this.storage.setItem(this.cacheKey, JSON.stringify(this.value));
            } catch { /* almacenamiento lleno o no disponible: no es critico */ }
        }, 400);
    }

    readCache() {
        try {
            const raw = this.storage.getItem(this.cacheKey);
            return raw === null ? undefined : JSON.parse(raw);
        } catch {
            return undefined;
        }
    }

    // ---- interno ----
    makeSnapshot() {
        return {
            value: this.value,
            status: this.status,
            error: this.error,
            blockedWrites: this.blockedWrites,
            usingFallback: this.usingFallback
        };
    }

    emit() {
        this.snapshot = this.makeSnapshot();
        this.listeners.forEach((listener) => listener());
    }
}

// Aplica un parche por campo ({ "<clave>/<campo>": valor }) sobre las entradas
// recien recibidas del servidor.
function rebase(entries, patch) {
    const byKey = {};
    for (const [route, value] of Object.entries(patch)) {
        const cut = route.indexOf('/');
        const key = route.slice(0, cut);
        if (!byKey[key]) byKey[key] = {};
        byKey[key][route.slice(cut + 1)] = value;
    }
    return entries.map(({ key, item }) => {
        if (!byKey[key]) return item;
        const merged = { ...item };
        for (const [field, value] of Object.entries(byKey[key])) {
            if (value === null) delete merged[field];
            else merged[field] = value;
        }
        return merged;
    });
}

function safeStorage() {
    try {
        return window.localStorage;
    } catch {
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    }
}
