// Conecta un SyncedResource con React.
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { SyncedResource } from './SyncedResource.js';

// `options` se lee solo al crear el recurso; `deps` indica cuando recrearlo
// (por ejemplo, al cambiar el pack de contenido que sirve de respaldo).
//
// `enabled=false` deja el recurso en 'loading' sin suscribirse (util para no
// leer datos que las reglas de la base de datos van a rechazar porque aun no
// hay sesion: ver el uso en useCourseData.js).
export function useResource(backend, path, options, deps = [], enabled = true) {
    const resource = useMemo(
        () => new SyncedResource({ backend, path, ...options }),
        [backend, path, ...deps]
    );

    useEffect(() => {
        if (!enabled) return;
        resource.start();
        return () => resource.stop();
    }, [resource, enabled]);

    const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot);
    return { ...snapshot, set: resource.set, reset: resource.reset };
}
