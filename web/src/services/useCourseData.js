// Todos los datos sincronizados de un curso, con la misma forma que usaban los
// paneles (valor + setter estilo setState).
import { useCallback, useMemo } from 'react';
import { useResource } from './useResource.js';
import { cursoPath } from '../data/cursos.js';
import { getContentPack, normalizeUnidades } from '../content/index.js';
import { normalizeStudent } from '../domain/estudiantes.js';

const STUDENTS = { kind: 'collection', normalize: normalizeStudent };
const ACTIVITIES = { kind: 'collection' };

export function useCourseData(backend, curso) {
    const pack = getContentPack(curso.contentPackId);
    const firstUnidad = pack.unidades[0].id;

    const students = useResource(backend, cursoPath(curso, 'students'), STUDENTS);
    const activities = useResource(backend, cursoPath(curso, 'activities'), ACTIVITIES);
    // Sin unidades guardadas se usan las del pack; solo se guardan si el docente las edita.
    const unidades = useResource(backend, cursoPath(curso, 'unidades'),
        { kind: 'value', normalize: normalizeUnidades, fallback: pack.unidades }, [pack.id]);
    const position = useResource(backend, cursoPath(curso, 'position'),
        { kind: 'value', fallback: { unidad: firstUnidad, clase: 1 } }, [pack.id]);

    const setPosition = position.set;
    const setCurrentUnidad = useCallback(
        (unidad) => setPosition((prev) => ({ ...prev, unidad })), [setPosition]);
    const setCurrentClase = useCallback(
        (clase) => setPosition((prev) => ({ ...prev, clase })), [setPosition]);

    const statuses = [students.status, activities.status, unidades.status, position.status];
    const status = statuses.includes('loading') ? 'loading'
        : statuses.includes('offline') ? 'offline' : 'live';
    const blockedWrites = students.blockedWrites + activities.blockedWrites +
        unidades.blockedWrites + position.blockedWrites;

    const pos = position.value || {};
    const unidadesValue = unidades.value && unidades.value.length ? unidades.value : pack.unidades;
    // La posicion guardada puede apuntar a una unidad que ya no existe (cambio de pack).
    const currentUnidad = unidadesValue.some((u) => u.id === pos.unidad) ? pos.unidad : unidadesValue[0].id;

    return useMemo(() => ({
        status,
        blockedWrites,
        pack,
        students: students.value,
        setStudents: students.set,
        activities: activities.value,
        setActivities: activities.set,
        unidades: unidadesValue,
        setUnidades: unidades.set,
        resetUnidades: unidades.reset,
        unidadesPersonalizadas: !unidades.usingFallback,
        currentUnidad,
        currentClase: Number(pos.clase) || 1,
        setCurrentUnidad,
        setCurrentClase,
        setPosition
    }), [status, blockedWrites, pack, students.value, students.set, activities.value, activities.set,
        unidadesValue, unidades.set, unidades.reset, unidades.usingFallback, currentUnidad, pos.clase,
        setCurrentUnidad, setCurrentClase, setPosition]);
}
