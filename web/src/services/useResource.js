// Conecta un SyncedResource con React.
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { SyncedResource } from './SyncedResource.js';

// `options` se lee solo al crear el recurso; `deps` indica cuando recrearlo
// (por ejemplo, al cambiar el pack de contenido que sirve de respaldo).
export function useResource(backend, path, options, deps = []) {
    const resource = useMemo(
        () => new SyncedResource({ backend, path, ...options }),
        [backend, path, ...deps]
    );

    useEffect(() => {
        resource.start();
        return () => resource.stop();
    }, [resource]);

    const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot);
    return { ...snapshot, set: resource.set, reset: resource.reset };
}
