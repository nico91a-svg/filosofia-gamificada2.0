// Componente raiz: elige curso, autentica y entrega los datos a cada panel.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from './config.js';
import { createBackend } from './services/backends.js';
import { useResource } from './services/useResource.js';
import { useCourseData } from './services/useCourseData.js';
import {
    clearStudentSession, loadStudentSession, matchesSession, saveStudentSession, verifyProfesor
} from './services/auth.js';
import {
    CURSOS_BASE, CURSO_ORIGINAL_ID, getCurso, loadCursoSelection, normalizeCursos, saveCursoSelection
} from './data/cursos.js';
import { findStudentByCredentials, normalizeStudent } from './domain/estudiantes.js';
import { normalizeUnidades } from './content/index.js';
import { LoginScreen } from './components/LoginScreen.jsx';
import { ProfesorDashboard } from './components/profesor/ProfesorDashboard.jsx';
import { EstudianteDashboard } from './components/estudiante/EstudianteDashboard.jsx';
import { ConnectionBanner, SandboxBanner, SplashScreen } from './components/shared/Status.jsx';

const CURSOS_OPTIONS = { kind: 'value', normalize: normalizeCursos, fallback: CURSOS_BASE };

export function App() {
    const backend = useMemo(() => createBackend(APP_CONFIG.firebase), []);

    // ---- cursos ----
    const cursosRes = useResource(backend, 'cursos_registro', CURSOS_OPTIONS);
    const cursos = useMemo(() => normalizeCursos(cursosRes.value), [cursosRes.value]);
    const setCursosRaw = cursosRes.set;
    const setCursos = useCallback((next) => setCursosRaw((prev) =>
        normalizeCursos(typeof next === 'function' ? next(normalizeCursos(prev)) : next)), [setCursosRaw]);

    const [cursoId, setCursoIdState] = useState(() => {
        const session = loadStudentSession();
        return (session && session.cursoId) || loadCursoSelection() || CURSO_ORIGINAL_ID;
    });
    const curso = getCurso(cursos, cursoId);
    const setCursoId = useCallback((id) => {
        setCursoIdState(id);
        saveCursoSelection(id);
    }, []);

    // ---- datos del curso activo ----
    const data = useCourseData(backend, curso);

    // ---- sesion ----
    const [session, setSession] = useState(null); // { tipo: 'profesor' } | { tipo: 'estudiante', studentId }
    const [loginError, setLoginError] = useState('');
    const [restoreTried, setRestoreTried] = useState(false);

    // Restaurar la sesion recordada del estudiante cuando ya hay datos.
    useEffect(() => {
        if (restoreTried || session || data.status === 'loading') return;
        setRestoreTried(true);
        const saved = loadStudentSession();
        if (!saved || saved.cursoId !== curso.id) return;
        const student = data.students.find((s) => s.id === saved.studentId);
        matchesSession(saved, student).then((ok) => {
            if (ok) setSession((current) => current || { tipo: 'estudiante', studentId: student.id });
            else if (data.status === 'live') clearStudentSession();
        });
    }, [restoreTried, session, data.status, data.students, curso.id]);

    const handleLogin = async (tipo, username, password) => {
        setLoginError('');
        try {
            if (tipo === 'profesor') {
                if (await verifyProfesor(APP_CONFIG.profesor, username, password)) {
                    setSession({ tipo: 'profesor' });
                } else {
                    setLoginError('Usuario o contraseña incorrectos.');
                }
                return;
            }
            if (data.status === 'loading') {
                setLoginError('Todavía se están cargando los datos del curso. Intenta de nuevo en unos segundos.');
                return;
            }
            const student = findStudentByCredentials(data.students, username, password);
            if (!student) {
                setLoginError('Nombre o contraseña incorrectos. Revisa que elegiste tu curso.');
                return;
            }
            setSession({ tipo: 'estudiante', studentId: student.id });
            saveStudentSession(curso.id, student);
        } catch (error) {
            console.error(error);
            setLoginError('No se pudo verificar el acceso en este navegador.');
        }
    };

    const handleLogout = () => {
        clearStudentSession();
        setSession(null);
        setLoginError('');
    };

    // ---- respaldo ----
    const handleExportData = () => {
        const payload = {
            curso: { id: curso.id, nombre: curso.nombre, anio: curso.anio, contentPackId: curso.contentPackId },
            exportado: new Date().toISOString(),
            students: data.students,
            activities: data.activities,
            unidades: data.unidades,
            position: { unidad: data.currentUnidad, clase: data.currentClase }
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'filosofo_backup_' + curso.id + '_' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleImportData = () => {
        if (data.status !== 'live') {
            alert('Sin conexión: no se puede importar ahora.');
            return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const imported = JSON.parse(evt.target.result);
                    const toList = (v) => (Array.isArray(v) ? v : Object.values(v || {})).filter(Boolean);
                    const students = imported.students ? toList(imported.students).map(normalizeStudent) : null;
                    const activities = imported.activities ? toList(imported.activities) : null;
                    const unidades = imported.unidades ? normalizeUnidades(imported.unidades) : null;

                    const resumen = (students ? students.length : 0) + ' estudiantes y ' +
                        (activities ? activities.length : 0) + ' actividades';
                    if (!window.confirm('Importar ' + resumen + ' al curso "' + curso.nombre + ' ' + curso.anio +
                        '"?\n\nEsto REEMPLAZA los datos actuales de ese curso. Exporta un respaldo antes si no lo has hecho.')) {
                        return;
                    }
                    if (students) data.setStudents(students);
                    if (activities) data.setActivities(activities);
                    if (unidades && unidades.length) data.setUnidades(unidades);
                    if (imported.position && imported.position.unidad) {
                        data.setPosition({ unidad: imported.position.unidad, clase: Number(imported.position.clase) || 1 });
                    }
                    alert('Datos importados: ' + resumen + '.');
                } catch (err) {
                    alert('Error al importar: el archivo no tiene un formato válido. ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // ---- render ----
    const estudiante = session && session.tipo === 'estudiante'
        ? data.students.find((s) => s.id === session.studentId)
        : null;

    // El estudiante de la sesion ya no existe en este curso: volver al login.
    useEffect(() => {
        if (session && session.tipo === 'estudiante' && data.status !== 'loading' && !estudiante) {
            if (data.status === 'live') clearStudentSession();
            setSession(null);
        }
    }, [session, data.status, estudiante]);

    let screen;
    if (!session) {
        screen = (
            <LoginScreen
                cursos={cursos}
                cursoId={curso.id}
                onCursoChange={setCursoId}
                onLogin={handleLogin}
                error={loginError}
                onClearError={() => setLoginError('')}
                status={data.status}
            />
        );
    } else if (data.status === 'loading' || (session.tipo === 'estudiante' && !estudiante)) {
        screen = <SplashScreen mensaje="Preparando tu edición del juego" />;
    } else if (session.tipo === 'profesor') {
        screen = (
            <ProfesorDashboard
                students={data.students}
                setStudents={data.setStudents}
                activities={data.activities}
                setActivities={data.setActivities}
                unidades={data.unidades}
                setUnidades={data.setUnidades}
                onResetUnidades={data.resetUnidades}
                unidadesPersonalizadas={data.unidadesPersonalizadas}
                currentUnidad={data.currentUnidad}
                setCurrentUnidad={data.setCurrentUnidad}
                currentClase={data.currentClase}
                setCurrentClase={data.setCurrentClase}
                onLogout={handleLogout}
                onExportData={handleExportData}
                onImportData={handleImportData}
                curso={curso}
                cursos={cursos}
                setCursos={setCursos}
                currentCursoId={curso.id}
                setCurrentCursoId={setCursoId}
            />
        );
    } else {
        screen = (
            <EstudianteDashboard
                currentUser={estudiante}
                students={data.students}
                setStudents={data.setStudents}
                activities={data.activities}
                unidades={data.unidades}
                currentUnidad={data.currentUnidad}
                currentClase={data.currentClase}
                onLogout={handleLogout}
                curso={curso}
            />
        );
    }

    return (
        <>
            <SandboxBanner namespace={backend.namespace} />
            <ConnectionBanner status={data.status} blockedWrites={data.blockedWrites} visible={!!session} />
            {screen}
        </>
    );
}
