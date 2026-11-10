// Backends de persistencia. Ambos exponen la misma interfaz minima:
//   subscribe(path, onValue, onError) -> unsubscribe
//   set(path, value) -> Promise
//   update(path, patch) -> Promise      (patch multi-ruta, null borra)
//   kind: 'firebase' | 'local'
//
// - firebase: Realtime Database (produccion).
// - local: localStorage con aviso entre pestañas. Se usa en tests, en desarrollo
//   sin red y como ultimo recurso si Firebase no puede inicializarse.

import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { applyPatch, clone } from './fbvalue.js';

export function createFirebaseBackend(config, namespace = '') {
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config);
    const db = app.database();
    const ref = (path) => db.ref(namespace ? namespace + '/' + path : path);

    return {
        kind: 'firebase',
        subscribe(path, onValue, onError) {
            const node = ref(path);
            const handler = node.on('value', (snapshot) => onValue(snapshot.val()), (error) => {
                if (onError) onError(error);
            });
            return () => node.off('value', handler);
        },
        set: (path, value) => ref(path).set(value),
        update: (path, patch) => ref(path).update(patch)
    };
}

const LOCAL_PREFIX = 'filosofo_db_';

export function createLocalBackend(storage = window.localStorage, namespace = '') {
    const listeners = new Map(); // path -> Set<fn>
    const keyOf = (path) => LOCAL_PREFIX + (namespace ? namespace + '/' : '') + path;

    const read = (path) => {
        try {
            const raw = storage.getItem(keyOf(path));
            return raw === null ? null : JSON.parse(raw);
        } catch {
            return null;
        }
    };
    const emit = (path) => {
        const value = read(path);
        (listeners.get(path) || []).forEach((fn) => fn(clone(value)));
    };
    const write = (path, value) => {
        if (value === null || value === undefined) storage.removeItem(keyOf(path));
        else storage.setItem(keyOf(path), JSON.stringify(value));
        emit(path);
    };

    // Otra pestaña escribio: reenviar a los suscriptores de esta.
    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('storage', (event) => {
            if (!event.key || !event.key.startsWith(LOCAL_PREFIX)) return;
            for (const path of listeners.keys()) {
                if (keyOf(path) === event.key) emit(path);
            }
        });
    }

    return {
        kind: 'local',
        subscribe(path, onValue) {
            if (!listeners.has(path)) listeners.set(path, new Set());
            listeners.get(path).add(onValue);
            // Igual que Firebase: el primer valor llega de forma asincrona.
            const timer = setTimeout(() => onValue(clone(read(path))), 0);
            return () => {
                clearTimeout(timer);
                listeners.get(path).delete(onValue);
            };
        },
        set(path, value) {
            write(path, value);
            return Promise.resolve();
        },
        update(path, patch) {
            write(path, applyPatch(read(path), patch));
            return Promise.resolve();
        }
    };
}

// Elige el backend segun el entorno de compilacion.
//   VITE_DB_BACKEND=local      fuerza localStorage (tests e2e, demos sin red)
//   VITE_DB_NAMESPACE=sandbox  antepone un prefijo a todas las rutas, para
//                              probar contra Firebase sin tocar datos reales
export function createBackend(firebaseConfig) {
    const env = import.meta.env || {};
    const namespace = env.VITE_DB_NAMESPACE || '';
    if (env.VITE_DB_BACKEND === 'local') return createLocalBackend(window.localStorage, namespace);
    try {
        return createFirebaseBackend(firebaseConfig, namespace);
    } catch (error) {
        console.warn('Firebase no disponible; usando almacenamiento local.', error);
        return createLocalBackend(window.localStorage, namespace);
    }
}
