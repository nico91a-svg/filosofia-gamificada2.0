// Todos los datos sincronizados de un curso, con la misma forma que usaban los
// paneles (valor + setter estilo setState).
import { useCallback, useMemo } from 'react';
import { useResource } from './useResource.js';
import { cursoPath } from '../data/cursos.js';
import { getContentPack, normalizeUnidades } from '../content/index.js';
import { normalizeStudent } from '../domain/estudiantes.js';

const STUDENTS = { kind: 'collection', normalize: normalizeStudent };
const ACTIVITIES = { kind: 'collection' };
const STUDENTS_PRIVADO = { kind: 'value', fallback: {} };

// `enabled=false` (sin sesion) deja los recursos en pausa: no tiene sentido
// leerlos antes de autenticarse, porque las reglas de la base de datos los
// van a rechazar (ver docs/SEGURIDAD.md).
//
// `esDocente` controla aparte el nodo `students_privado` (nombreLegal de cada
// estudiante): las reglas solo dejan leerlo al docente, asi que ni se
// suscribe para una sesion de estudiante — y su estado no cuenta para el
// `status` general, para no mostrar "sin conexion" donde en realidad es
// "sin permiso a proposito".
export function useCourseData(backend, curso, enabled = true, esDocente = false) {
    const pack = getContentPack(curso.contentPackId);
    const firstUnidad = pack.unidades[0].id;

    const students = useResource(backend, cursoPath(curso, 'students'), STUDENTS, [], enabled);
    const activities = useResource(backend, cursoPath(curso, 'activities'), ACTIVITIES, [], enabled);
    // Sin unidades guardadas se usan las del pack; solo se guardan si el docente las edita.
    const unidades = useResource(backend, cursoPath(curso, 'unidades'),
        { kind: 'value', normalize: normalizeUnidades, fallback: pack.unidades }, [pack.id], enabled);
    const position = useResource(backend, cursoPath(curso, 'position'),
        { kind: 'value', fallback: { unidad: firstUnidad, clase: 1 } }, [pack.id], enabled);
    const studentsPrivado = useResource(backend, cursoPath(curso, 'students_privado'),
        STUDENTS_PRIVADO, [], enabled && esDocente);

    const setPosition = position.set;
    const setCurrentUnidad = useCallback(
        (unidad) => setPosition((prev) => ({ ...prev, unidad })), [setPosition]);
    const setCurrentClase = useCallback(
        (clase) => setPosition((prev) => ({ ...prev, clase })), [setPosition]);

    const setNombreLegal = useCallback((studentId, nombreLegal) => {
        studentsPrivado.set((prev) => ({ ...(prev || {}), [studentId]: nombreLegal }));
    }, [studentsPrivado.set]);

    const statuses = [students.status, activities.status, unidades.status, position.status];
    const status = statuses.includes('loading') ? 'loading'
        : statuses.includes('offline') ? 'offline' : 'live';
    const blockedWrites = students.blockedWrites + activities.blockedWrites +
        unidades.blockedWrites + position.blockedWrites;

    const pos = position.value || {};
    const unidadesValue = unidades.value && unidades.value.length ? unidades.value : pack.unidades;
    // La posicion guardada puede apuntar a una unidad que ya no existe (cambio de pack).
    const currentUnidad = unidadesValue.some((u) => u.id === pos.unidad) ? pos.unidad : unidadesValue[0].id;

    // El docente ve el nombre legal real (students_privado); sin eso, queda
    // el valor por defecto de normalizeStudent (= el nombre social, no
    // revela nada). Los estudiantes de un curso ajeno ni fetchean este nodo.
    const nombresLegales = studentsPrivado.value || {};
    const studentsConNombreLegal = useMemo(() => {
        if (!esDocente) return students.value;
        return students.value.map((s) => {
            const legal = nombresLegales[s.id];
            return legal !== undefined && legal !== s.nombreLegal ? { ...s, nombreLegal: legal } : s;
        });
    }, [students.value, nombresLegales, esDocente]);

    return useMemo(() => ({
        status,
        blockedWrites,
        pack,
        students: studentsConNombreLegal,
        setStudents: students.set,
        setNombreLegal,
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
    }), [status, blockedWrites, pack, studentsConNombreLegal, students.set, setNombreLegal, activities.value,
        activities.set, unidadesValue, unidades.set, unidades.reset, unidades.usingFallback, currentUnidad,
        pos.clase, setCurrentUnidad, setCurrentClase, setPosition]);
}
