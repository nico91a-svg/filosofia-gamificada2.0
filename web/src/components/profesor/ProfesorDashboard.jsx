import React from 'react';
import { ARTEFACTOS, getCofre, getRarezaColor } from '../../domain/artefactos.js';
import { AddActivityModal, AddStudentModal, EditStudentModal, StudentDetailModal } from '../shared/Modals.jsx';
import { CLASES_FILOSOFICAS } from '../../domain/clases-filosoficas.js';
import { crearCurso, getPaleta } from '../../data/cursos.js';
import { getContentPack } from '../../content/index.js';
import { crearEstudiante } from '../../domain/estudiantes.js';
import { nextId } from '../../domain/ids.js';
import { GestionCursos } from './GestionCursos.jsx';
import { GestionUnidades } from './GestionUnidades.jsx';
import { HABILIDADES, HABILIDAD_NIVELES, getHabilidadNivel } from '../../domain/habilidades.js';
import { Icons } from '../shared/Icons.jsx';
import { MISIONES_DB, getMisionesDeClase } from '../../domain/misiones.js';
import { RUBRICS_HABILIDADES, RUBRICS_XP, TIPOS_ACTIVIDAD } from '../../domain/tipos-actividad.js';
import { RegistroMasivo } from './RegistroMasivo.jsx';
import { getNivel } from '../../domain/niveles.js';

// ProfesorDashboard.jsx - Dashboard principal del profesor
const { useState, useEffect } = React;

export const ProfesorDashboard = function ProfesorDashboard({
    students, setStudents, setNombreLegal,
    activities, setActivities,
    unidades, setUnidades,
    currentUnidad, setCurrentUnidad,
    currentClase, setCurrentClase,
    onLogout, onExportData, onImportData,
    onResetUnidades, unidadesPersonalizadas,
    curso, cursos, setCursos, currentCursoId, setCurrentCursoId,
    backendKind
}) {
    // ---- Estado interno ----
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showEditStudent, setShowEditStudent] = useState(null);
    const [showStudentDetail, setShowStudentDetail] = useState(null);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [showGrantArtefacto, setShowGrantArtefacto] = useState(false);
    const [showUseArtefacto, setShowUseArtefacto] = useState(false);
    const [showGiftArtefacto, setShowGiftArtefacto] = useState(false);
    const [selectedArtefactoStudent, setSelectedArtefactoStudent] = useState(null);

    // NOTA: la persistencia la maneja la capa de datos (services/SyncedResource).
    // Aqui solo se modifica el estado con setStudents / setActivities.

    // ---- Funciones de estudiantes ----
    // Devuelve el estudiante creado: lo usa AddStudentModal para mostrar el
    // comando de gestionar-cuentas.mjs (backend 'firebase') antes de cerrarse.
    function addStudent(data) {
        var newStudent = crearEstudiante(nextId(), data);
        setStudents(function(prev) { return [].concat(prev, [newStudent]); });
        if (setNombreLegal) setNombreLegal(newStudent.id, data.nombreLegal || data.nombreSocial || data.nombre);
        return newStudent;
    }

    function deleteStudent(id) {
        if (confirm('Estas seguro de eliminar este estudiante? Esta accion no se puede deshacer.')) {
            setStudents(function(prev) { return prev.filter(function(s) { return s.id !== id; }); });
            setActivities(function(prev) { return prev.filter(function(a) { return a.studentId !== id; }); });
        }
    }

    function addXP(studentId, amount) {
        setStudents(function(prev) {
            return prev.map(function(s) {
                if (s.id !== studentId) return s;
                var newXP = (s.xp || 0) + amount;
                var updated = Object.assign({}, s, { xp: newXP });
                // Verificar badges de nivel
                if (newXP >= 300 && !s.badges.includes('nivel5')) {
                    updated.badges = [].concat(updated.badges, ['nivel5']);
                }
                if (newXP >= 1000 && !s.badges.includes('nivel10')) {
                    updated.badges = [].concat(updated.badges, ['nivel10']);
                }
                return updated;
            });
        });
    }

    function addHabilidadPoints(studentId, habilidadId, points) {
        setStudents(function(prev) {
            return prev.map(function(s) {
                if (s.id !== studentId) return s;
                var habs = Object.assign({}, s.habilidades);
                habs[habilidadId] = (habs[habilidadId] || 0) + points;
                return Object.assign({}, s, { habilidades: habs });
            });
        });
    }

    function addBadge(studentId, badgeId) {
        setStudents(function(prev) {
            return prev.map(function(s) {
                if (s.id !== studentId) return s;
                if (s.badges.includes(badgeId)) return s;
                return Object.assign({}, s, { badges: [].concat(s.badges, [badgeId]) });
            });
        });
    }

    function addArtefacto(studentId, artefactoId) {
        setStudents(function(prev) {
            return prev.map(function(s) {
                if (s.id !== studentId) return s;
                var arts = s.artefactos ? [].concat(s.artefactos) : [];
                arts.push({ id: artefactoId, obtenido: new Date().toISOString(), usado: false });
                return Object.assign({}, s, { artefactos: arts });
            });
        });
    }

    // ---- Sistema de badges automaticos ----
    function checkAndGrantBadges(studentId, activityType, updatedActivities) {
        var student = students.find(function(s) { return s.id === studentId; });
        if (!student) return;
        var currentBadges = student.badges || [];
        var newBadges = [];

        // Badge: participante - primera actividad registrada
        var studentActs = updatedActivities.filter(function(a) { return a.studentId === studentId; });
        if (studentActs.length >= 1 && !currentBadges.includes('participante')) {
            newBadges.push('participante');
        }

        // Badge: guerrero - participo en un debate
        if (activityType === 'debate' && !currentBadges.includes('guerrero')) {
            newBadges.push('guerrero');
        }

        // Badge: maestro - participo en un dialogo socratico
        if (activityType === 'dialogo' && !currentBadges.includes('maestro')) {
            newBadges.push('maestro');
        }

        // Badge: ensayista - completo un ensayo
        if (activityType === 'ensayo' && !currentBadges.includes('ensayista')) {
            newBadges.push('ensayista');
        }

        // Badge: investigador - completo una investigacion
        if (activityType === 'investigacion' && !currentBadges.includes('investigador')) {
            newBadges.push('investigador');
        }

        // Badge: debatiente - completo un debate filosófico
        if (activityType === 'debate' && !currentBadges.includes('debatiente')) {
            newBadges.push('debatiente');
        }

        // Badge: original - completo un experimento mental
        if (activityType === 'experimento' && !currentBadges.includes('original')) {
            newBadges.push('original');
        }

        // Badge: asombrado - 5+ actividades con nivel excepcional
        var excepcionalCount = studentActs.filter(function(a) { return a.nivel === 'excepcional'; }).length;
        if (excepcionalCount >= 5 && !currentBadges.includes('asombrado')) {
            newBadges.push('asombrado');
        }

        // Badge: arquitecto - 3+ mapas conceptuales
        var mapasCount = studentActs.filter(function(a) { return a.tipo === 'mapa'; }).length;
        if (mapasCount >= 3 && !currentBadges.includes('arquitecto')) {
            newBadges.push('arquitecto');
        }

        // Badge: esceptico - 5+ debates o dialogos
        var debatesCount = studentActs.filter(function(a) { return a.tipo === 'debate' || a.tipo === 'dialogo'; }).length;
        if (debatesCount >= 5 && !currentBadges.includes('esceptico')) {
            newBadges.push('esceptico');
        }

        // Verificar badges de vocabulario
        var vocabDescubierto = student.vocabularioDescubierto || [];
        unidades.forEach(function(u) {
            var vocab = u.vocabulario || [];
            if (vocab.length > 0) {
                var allFound = vocab.every(function(v) { return vocabDescubierto.includes(v.termino); });
                var badgeId = 'vocabulario_' + u.id.toLowerCase();
                if (allFound && !currentBadges.includes(badgeId)) {
                    newBadges.push(badgeId);
                }
            }
        });

        // Otorgar badges nuevos
        newBadges.forEach(function(badgeId) {
            addBadge(studentId, badgeId);
        });
    }

    function addActivity(data) {
        var xpFinal = data.xp;
        var notasExtra = data.notas || '';

        // --- LIMITE PARTICIPACION: max 2 por dia ---
        if (data.tipo === 'participacion') {
            var hoy = new Date().toISOString().split('T')[0];
            var participacionesHoy = activities.filter(function(a) {
                return a.studentId === data.studentId &&
                       a.tipo === 'participacion' &&
                       a.date && a.date.split('T')[0] === hoy;
            }).length;
            if (participacionesHoy >= 2) {
                xpFinal = 0;
                notasExtra = (notasExtra ? notasExtra + ' | ' : '') + 'Limite diario alcanzado (2/2)';
            }
        }

        var newActivity = {
            id: nextId(),
            studentId: data.studentId,
            tipo: data.tipo,
            categoria: data.categoria || 'cotidiana',
            nivel: data.nivel,
            xp: xpFinal,
            notas: notasExtra,
            comentario: data.comentario || '',
            unidadId: data.unidadId || currentUnidad,
            claseNum: data.claseNum || currentClase,
            date: new Date().toISOString(),
            habilidades: data.habilidades || {}
        };
        // Actualizacion funcional: en un registro masivo esta funcion se llama
        // muchas veces seguidas y `activities` aun no refleja las anteriores.
        // (Antes se guardaba solo la actividad del ultimo estudiante.)
        var updatedActivities = [newActivity].concat(activities);
        setActivities(function(prev) { return [newActivity].concat(prev); });
        // Otorgar XP (solo si hay)
        if (xpFinal > 0) {
            addXP(data.studentId, xpFinal);
        }
        // Otorgar puntos de habilidad (solo si hubo XP)
        if (xpFinal > 0) {
            var habPoints = data.habilidades || {};
            Object.keys(habPoints).forEach(function(habId) {
                if (habPoints[habId] > 0) {
                    addHabilidadPoints(data.studentId, habId, habPoints[habId]);
                }
            });
        }
        // Verificar y otorgar badges automaticos
        checkAndGrantBadges(data.studentId, data.tipo, updatedActivities);

        // --- OTORGAR COFRE si la actividad lo merece ---
        var tipoCofre = getCofre(data.tipo, data.nivel);
        if (tipoCofre) {
            addArtefacto(data.studentId, 'cofre_' + tipoCofre);
        }

        // --- AUTO-AVANCE DE CLASE: avanzar al maximo registrado ---
        var actUnidad = data.unidadId || currentUnidad;
        var actClase = data.claseNum || currentClase;
        var unidadOrder = unidades.map(function(u) { return u.id; });
        var actUnidadIdx = unidadOrder.indexOf(actUnidad);
        var curUnidadIdx = unidadOrder.indexOf(currentUnidad);
        if (actUnidadIdx > curUnidadIdx) {
            setCurrentUnidad(actUnidad);
            setCurrentClase(actClase);
        } else if (actUnidadIdx === curUnidadIdx && actClase > currentClase) {
            setCurrentClase(actClase);
        }

        setShowAddActivity(false);
    }

    // ---- Funciones de artefactos ----
    function otorgarArtefacto(studentId, artefactoId) {
        addArtefacto(studentId, artefactoId);
        setShowGrantArtefacto(false);
    }

    function usarArtefacto(studentId, artefactoIndex) {
        setStudents(function(prev) {
            return prev.map(function(s) {
                if (s.id !== studentId) return s;
                var arts = s.artefactos ? [].concat(s.artefactos) : [];
                if (arts[artefactoIndex] && !arts[artefactoIndex].usado) {
                    arts[artefactoIndex] = Object.assign({}, arts[artefactoIndex], { usado: true, fechaUso: new Date().toISOString() });
                }
                return Object.assign({}, s, { artefactos: arts });
            });
        });
        setShowUseArtefacto(false);
    }

    function regalarArtefacto(fromStudentId, toStudentId, artefactoIndex) {
        var fromStudent = students.find(function(s) { return s.id === fromStudentId; });
        if (!fromStudent || !fromStudent.artefactos || !fromStudent.artefactos[artefactoIndex]) return;
        var artefacto = fromStudent.artefactos[artefactoIndex];
        if (artefacto.usado) return;
        // Remover del estudiante origen
        setStudents(function(prev) {
            return prev.map(function(s) {
                if (s.id === fromStudentId) {
                    var arts = s.artefactos.filter(function(_, i) { return i !== artefactoIndex; });
                    return Object.assign({}, s, { artefactos: arts });
                }
                if (s.id === toStudentId) {
                    var arts2 = s.artefactos ? [].concat(s.artefactos) : [];
                    arts2.push({ id: artefacto.id, obtenido: new Date().toISOString(), usado: false, regaladoPor: fromStudentId });
                    return Object.assign({}, s, { artefactos: arts2 });
                }
                return s;
            });
        });
        setShowGiftArtefacto(false);
    }

    // ---- Datos derivados ----
    var sortedStudents = [].concat(students).sort(function(a, b) { return (b.xp || 0) - (a.xp || 0); });
    var avgXP = students.length > 0 ? Math.round(students.reduce(function(sum, s) { return sum + (s.xp || 0); }, 0) / students.length) : 0;
    var avgLevel = students.length > 0 ? (students.reduce(function(sum, s) { return sum + getNivel(s.xp || 0).nivel; }, 0) / students.length).toFixed(1) : 0;
    var currentUnidadObj = unidades.find(function(u) { return u.id === currentUnidad; }) || unidades[0];
    var currentClaseObj = currentUnidadObj ? currentUnidadObj.clases.find(function(c) { return c.num === currentClase; }) : null;
    var recentActivities = activities.slice(0, 10);

    // ---- Vocabulario auto-desbloqueado al avanzar de clase ----
    function autoUnlockVocabulario(targetUnidad, targetClase) {
        // Desbloquear vocabulario para TODOS los estudiantes basado en progreso
        // Regla: vocabulario de unidades anteriores = todo desbloqueado
        // Vocabulario de unidad actual = proporcional a la clase actual
        var unidadIdx = unidades.findIndex(function(u) { return u.id === targetUnidad; });
        if (unidadIdx < 0) return;

        var termsToUnlock = [];

        // Todas las unidades anteriores: desbloquear todo su vocabulario
        for (var i = 0; i < unidadIdx; i++) {
            var vocab = unidades[i].vocabulario || [];
            vocab.forEach(function(v) { termsToUnlock.push(v.termino); });
        }

        // Unidad actual: desbloquear proporcionalmente
        var currentU = unidades[unidadIdx];
        var vocabActual = currentU.vocabulario || [];
        var totalClasesU = currentU.totalClases || currentU.clases.length;
        if (vocabActual.length > 0 && totalClasesU > 0) {
            // Cuantos terminos desbloquear segun la clase actual
            var ratio = targetClase / totalClasesU;
            var numTerms = Math.min(Math.ceil(ratio * vocabActual.length), vocabActual.length);
            for (var j = 0; j < numTerms; j++) {
                termsToUnlock.push(vocabActual[j].termino);
            }
        }

        if (termsToUnlock.length === 0) return;

        // Actualizar todos los estudiantes
        setStudents(function(prev) {
            return prev.map(function(s) {
                var existing = s.vocabularioDescubierto || [];
                var merged = [].concat(existing);
                var changed = false;
                termsToUnlock.forEach(function(term) {
                    if (merged.indexOf(term) === -1) {
                        merged.push(term);
                        changed = true;
                    }
                });
                if (!changed) return s;
                return Object.assign({}, s, { vocabularioDescubierto: merged });
            });
        });
    }

    // Auto-desbloquear vocabulario cuando cambia la posicion
    useEffect(function() {
        if (students.length > 0) {
            autoUnlockVocabulario(currentUnidad, currentClase);
        }
    }, [currentUnidad, currentClase]);

    // Navegacion de clase
    function prevClase() {
        if (currentClase > 1) {
            setCurrentClase(currentClase - 1);
        } else {
            var idx = unidades.findIndex(function(u) { return u.id === currentUnidad; });
            if (idx > 0) {
                var prevU = unidades[idx - 1];
                setCurrentUnidad(prevU.id);
                setCurrentClase(prevU.clases.length);
            }
        }
    }

    function nextClase() {
        if (currentUnidadObj && currentClase < currentUnidadObj.clases.length) {
            setCurrentClase(currentClase + 1);
        } else {
            var idx = unidades.findIndex(function(u) { return u.id === currentUnidad; });
            if (idx < unidades.length - 1) {
                setCurrentUnidad(unidades[idx + 1].id);
                setCurrentClase(1);
            }
        }
    }

    // ---- Misiones de clase ----
    var misionesDeClase = getMisionesDeClase(currentUnidad, currentClase);

    function toggleMisionEstudiante(studentId, misionId) {
        var claveClase = currentUnidad + '_C' + currentClase;
        setStudents(function(prev) {
            return prev.map(function(s) {
                if (s.id !== studentId) return s;
                var mc = Object.assign({}, s.misionesCompletadas || {});
                if (!mc[claveClase]) mc[claveClase] = {};
                if (mc[claveClase][misionId]) {
                    // Desmarcar
                    delete mc[claveClase][misionId];
                    // Restar XP de la mision
                    var mDef = MISIONES_DB.find(function(m) { return m.id === misionId; });
                    if (mDef && mDef.recompensa && mDef.recompensa.xp) {
                        var newXP = Math.max(0, (s.xp || 0) - mDef.recompensa.xp);
                        return Object.assign({}, s, { misionesCompletadas: mc, xp: newXP });
                    }
                } else {
                    // Marcar completada
                    mc[claveClase][misionId] = new Date().toISOString();
                    // Otorgar XP de la mision
                    var mDef2 = MISIONES_DB.find(function(m) { return m.id === misionId; });
                    if (mDef2 && mDef2.recompensa && mDef2.recompensa.xp) {
                        var newXP2 = (s.xp || 0) + mDef2.recompensa.xp;
                        return Object.assign({}, s, { misionesCompletadas: mc, xp: newXP2 });
                    }
                }
                return Object.assign({}, s, { misionesCompletadas: mc });
            });
        });
    }

    function toggleMisionTodos(misionId) {
        var claveClase = currentUnidad + '_C' + currentClase;
        // Si todos ya tienen la mision, desmarcar todos; si no, marcar todos
        var todosCompletaron = students.every(function(s) {
            return s.misionesCompletadas && s.misionesCompletadas[claveClase] && s.misionesCompletadas[claveClase][misionId];
        });
        var mDef = MISIONES_DB.find(function(m) { return m.id === misionId; });
        var xpMision = mDef && mDef.recompensa ? mDef.recompensa.xp : 0;

        setStudents(function(prev) {
            return prev.map(function(s) {
                var mc = Object.assign({}, s.misionesCompletadas || {});
                if (!mc[claveClase]) mc[claveClase] = {};
                var xpChange = 0;
                if (todosCompletaron) {
                    delete mc[claveClase][misionId];
                    xpChange = -xpMision;
                } else if (!mc[claveClase][misionId]) {
                    mc[claveClase][misionId] = new Date().toISOString();
                    xpChange = xpMision;
                }
                var newXP = Math.max(0, (s.xp || 0) + xpChange);
                return Object.assign({}, s, { misionesCompletadas: mc, xp: newXP });
            });
        });
    }

    // ---- Tabs config ----
    var tabs = [
        { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
        { id: 'estudiantes', label: 'Estudiantes', emoji: '👥' },
        { id: 'actividades', label: 'Actividades', emoji: '📝' },
        { id: 'unidades', label: 'Unidades', emoji: '📚' },
        { id: 'registro-masivo', label: 'Registro Masivo', emoji: '📋' },
        { id: 'misiones', label: 'Misiones', emoji: '🎯' },
        { id: 'artefactos', label: 'Artefactos', emoji: '🏺' },
        { id: 'habilidades', label: 'Habilidades', emoji: '🎯' },
        { id: 'cursos', label: 'Cursos', emoji: '🏛️' }
    ];

    // ---- Gestion de cursos ----
    function addCurso() {
        setCursos(function(prev) {
            return prev.concat([crearCurso({ nombre: 'Curso ' + (prev.length + 1) })]);
        });
    }
    function duplicarCurso(idOrigen) {
        setCursos(function(prev) {
            var origen = prev.find(function(c) { return c.id === idOrigen; });
            if (!origen) return prev;
            var copia = Object.assign({}, origen);
            delete copia.id;
            return prev.concat([crearCurso(Object.assign(copia, { nombre: origen.nombre + ' (copia)' }))]);
        });
    }
    function updateCurso(cursoId, updates) {
        setCursos(function(prev) {
            return prev.map(function(c) { return c.id === cursoId ? Object.assign({}, c, updates) : c; });
        });
    }
    function deleteCurso(cursoId) {
        var c = cursos.find(function(x) { return x.id === cursoId; });
        if (!c) return;
        if (c.esDefault) { alert('El curso original no se puede eliminar.'); return; }
        if (c.id === currentCursoId) { alert('Activa otro curso antes de eliminar este.'); return; }
        if (!confirm('Eliminar el curso "' + c.nombre + '" de la lista?\n\nSus estudiantes y actividades NO se borran de la base de datos (cursos/' + c.id + '), pero dejara de aparecer en la aplicacion.')) return;
        setCursos(function(prev) { return prev.filter(function(x) { return x.id !== cursoId; }); });
    }

    // ============================================================
    // RENDER
    // ============================================================
    var navbarGradient = getPaleta(curso.paleta).navbar;

    return (
        <div className="min-h-screen bg-dungeon-950">
            {/* ---- NAVBAR ---- */}
            <nav className="text-white shadow-lg" style={{ background: navbarGradient }}>
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">🏛️</span>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg font-bold leading-tight truncate">Dashboard del Profesor</h1>
                            <div className="text-xs text-white/80 flex items-center gap-1.5 whitespace-nowrap" data-testid="curso-activo">
                                <span>{curso.emoji}</span>
                                <span className="truncate">{curso.nombre}</span>
                                <span className="opacity-60">·</span>
                                <span>{curso.anio}</span>
                            </div>
                        </div>
                        {cursos.length > 1 && (
                            <select
                                value={currentCursoId || ''}
                                onChange={function(e) { setCurrentCursoId(e.target.value); }}
                                className="min-w-0 max-w-[9rem] sm:max-w-none bg-dungeon-700/15 hover:bg-dungeon-700/25 border border-white/20 rounded-none px-2 py-1 text-sm font-semibold cursor-pointer"
                                title="Cambiar de curso"
                                aria-label="Cambiar de curso"
                            >
                                {cursos.map(function(c) {
                                    return <option key={c.id} value={c.id} className="text-parchment">{c.emoji} {c.nombre} ({c.anio}){c.activo === false ? ' · oculto' : ''}</option>;
                                })}
                            </select>
                        )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button onClick={onImportData} aria-label="Importar" title="Importar un respaldo"
                            className="flex items-center gap-2 bg-dungeon-700 bg-opacity-20 hover:bg-opacity-30 px-3 sm:px-4 py-2 rounded-none text-sm font-semibold transition">
                            <span aria-hidden="true">📥</span><span className="hidden sm:inline">Importar</span>
                        </button>
                        <button onClick={onExportData} aria-label="Exportar" title="Descargar un respaldo"
                            className="flex items-center gap-2 bg-dungeon-700 bg-opacity-20 hover:bg-opacity-30 px-3 sm:px-4 py-2 rounded-none text-sm font-semibold transition">
                            <Icons.Download size={16} /><span className="hidden sm:inline">Exportar</span>
                        </button>
                        <button onClick={onLogout} aria-label="Salir" title="Cerrar sesión"
                            className="flex items-center gap-2 bg-ruby hover:bg-ruby/80 px-3 sm:px-4 py-2 rounded-none text-sm font-semibold transition">
                            <Icons.LogOut size={16} /><span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ---- TABS ---- */}
            <div className="bg-dungeon-800 border-b-2 border-stone-dark">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {tabs.map(function(tab) {
                            return (
                                <button key={tab.id} onClick={function() { setActiveTab(tab.id); }}
                                    className={"px-4 py-2 rounded-none text-sm font-semibold whitespace-nowrap transition " +
                                        (activeTab === tab.id
                                            ? 'bg-gold text-dungeon-950'
                                            : 'text-arcane hover:bg-dungeon-600')}>
                                    <span className="mr-1">{tab.emoji}</span> {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ---- CONTENIDO ---- */}
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* ================ TAB: DASHBOARD ================ */}
                {activeTab === 'dashboard' && (
                    <div>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="panel-pixel p-5 flex items-center gap-4">
                                <div className="bg-blue-950/60 p-3 rounded-none">
                                    <Icons.Users size={28} className="text-blue-300" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-parchment">{students.length}</div>
                                    <div className="text-sm text-arcane">Total Estudiantes</div>
                                </div>
                            </div>
                            <div className="panel-pixel p-5 flex items-center gap-4">
                                <div className="bg-arcane/20 p-3 rounded-none">
                                    <Icons.TrendingUp size={28} className="text-arcane" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-parchment">{avgXP}</div>
                                    <div className="text-sm text-arcane">XP Promedio</div>
                                </div>
                            </div>
                            <div className="panel-pixel p-5 flex items-center gap-4">
                                <div className="bg-gold/15 p-3 rounded-none">
                                    <Icons.Trophy size={28} className="text-gold" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-parchment">{avgLevel}</div>
                                    <div className="text-sm text-arcane">Nivel Promedio</div>
                                </div>
                            </div>
                            <div className="panel-pixel p-5 flex items-center gap-4">
                                <div className="bg-emerald/20 p-3 rounded-none">
                                    <Icons.BookOpen size={28} className="text-emerald" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-parchment">{activities.length}</div>
                                    <div className="text-sm text-arcane">Total Actividades</div>
                                </div>
                            </div>
                        </div>

                        {/* Unidad y Clase Actual */}
                        <div className="panel-pixel p-6 mb-6">
                            <h2 className="text-lg font-bold text-parchment mb-4">Clase Actual</h2>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <button onClick={prevClase}
                                    className="bg-dungeon-600 hover:bg-stone px-4 py-2 rounded-none text-parchment/90 font-bold transition">
                                    &#8592; Anterior
                                </button>
                                <div className="text-center">
                                    {currentUnidadObj && (
                                        <div>
                                            <div className="text-3xl mb-1">{currentUnidadObj.emoji}</div>
                                            <div className="text-sm text-arcane font-semibold">{currentUnidadObj.id} - {currentUnidadObj.nombre}</div>
                                            {currentClaseObj && (
                                                <div className="mt-2">
                                                    <span className="bg-indigo-950/60 text-indigo-300 px-3 py-1 rounded-full text-sm font-bold">
                                                        Clase {currentClaseObj.num}: {currentClaseObj.emoji} {currentClaseObj.titulo}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button onClick={nextClase}
                                    className="bg-dungeon-600 hover:bg-stone px-4 py-2 rounded-none text-parchment/90 font-bold transition">
                                    Siguiente &#8594;
                                </button>
                            </div>
                        </div>

                        {/* Actividades Recientes */}
                        <div className="panel-pixel p-6">
                            <h2 className="text-lg font-bold text-parchment mb-4">Actividades Recientes</h2>
                            {recentActivities.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivities.map(function(act) {
                                        var tipo = TIPOS_ACTIVIDAD.find(function(t) { return t.id === act.tipo; });
                                        var student = students.find(function(s) { return s.id === act.studentId; });
                                        var unidad = unidades.find(function(u) { return u.id === act.unidadId; });
                                        return (
                                            <div key={act.id} className="flex items-center justify-between bg-dungeon-800 rounded-none p-3 hover:bg-dungeon-600 transition">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{tipo ? tipo.icon : '📌'}</span>
                                                    <div>
                                                        <div className="font-semibold text-sm text-parchment">
                                                            {student ? student.nombre : 'Desconocido'} - {tipo ? tipo.nombre : act.tipo}
                                                        </div>
                                                        <div className="text-xs text-arcane">
                                                            {unidad ? unidad.emoji + ' ' + unidad.id : ''} Clase {act.claseNum || '?'} | {new Date(act.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-arcane">+{act.xp} XP</div>
                                                    <div className="text-xs text-arcane capitalize">{act.nivel}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-arcane/70 py-8">No hay actividades registradas aun.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================ TAB: ESTUDIANTES ================ */}
                {activeTab === 'estudiantes' && (
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-parchment">Ranking de Estudiantes</h2>
                            <button onClick={function() { setShowAddStudent(true); }}
                                className="flex items-center gap-2 bg-emerald hover:bg-emerald/80 text-white px-5 py-2 rounded-none font-semibold transition">
                                <Icons.Plus size={18} /> Agregar Estudiante
                            </button>
                        </div>
                        {students.length === 0 ? (
                            <div className="panel-pixel p-12 text-center text-arcane/70">
                                <div className="text-5xl mb-4">👥</div>
                                <p className="text-lg">No hay estudiantes registrados.</p>
                                <p className="text-sm mt-1">Agrega tu primer estudiante para comenzar.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedStudents.map(function(student, index) {
                                    var nivel = getNivel(student.xp || 0);
                                    var clase = CLASES_FILOSOFICAS.find(function(c) { return c.id === student.clase; });
                                    var xpProgress = Math.min(((student.xp - nivel.xp_min) / (nivel.xp_max - nivel.xp_min)) * 100, 100);
                                    return (
                                        <div key={student.id} className="panel-pixel shadow hover:shadow-lg transition p-5">
                                            {/* Rank + Nombre */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm " +
                                                        (index === 0 ? 'bg-gold/100' : index === 1 ? 'bg-stone' : index === 2 ? 'bg-orange-400' : 'bg-dungeon-600')}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-parchment">{student.nombreSocial || student.nombre}</div>
                                                        {student.nombreLegal && student.nombreLegal !== (student.nombreSocial || student.nombre) && (
                                                            <div className="text-arcane/70 text-xs">Legal: {student.nombreLegal}</div>
                                                        )}
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {clase && (
                                                                <div className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-semibold " + clase.color}>
                                                                    {clase.emoji} {clase.nombre}
                                                                </div>
                                                            )}
                                                            {student.genero && (
                                                                <span className="text-xs text-arcane/70">
                                                                    {student.genero === 'femenino' ? '👩' : student.genero === 'masculino' ? '👨' : '🧑'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Nivel y XP */}
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="font-semibold text-parchment/90">Nv.{nivel.nivel} {nivel.titulo}</span>
                                                    <span className="text-arcane font-bold">{student.xp} XP</span>
                                                </div>
                                                <div className="w-full bg-dungeon-600 rounded-full h-2.5">
                                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: xpProgress + '%' }}></div>
                                                </div>
                                            </div>

                                            {/* Estrellas de habilidades */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {HABILIDADES.map(function(hab) {
                                                    var pts = (student.habilidades && student.habilidades[hab.id]) || 0;
                                                    var nivelH = getHabilidadNivel(pts);
                                                    return (
                                                        <div key={hab.id} className="flex items-center gap-0.5" title={hab.nombre + ': ' + pts + ' pts (Nv.' + nivelH + ')'}>
                                                            <span className="text-xs">{hab.emoji}</span>
                                                            <div className="flex gap-px">
                                                                {[1,2,3,4,5].map(function(star) {
                                                                    return (
                                                                        <span key={star} className={"text-xs " + (star <= nivelH ? 'text-gold' : 'text-arcane/60')}>&#9733;</span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Botones de accion */}
                                            <div className="flex gap-2">
                                                <button onClick={function() { setShowStudentDetail(student); }}
                                                    className="flex-1 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 py-2 rounded-none text-xs font-semibold transition">
                                                    Ver Detalles
                                                </button>
                                                <button onClick={function() { setShowEditStudent(student); }}
                                                    className="bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 p-2 rounded-none transition" title="Editar">
                                                    <Icons.Edit2 size={16} />
                                                </button>
                                                <button onClick={function() { deleteStudent(student.id); }}
                                                    className="bg-ruby/15 hover:bg-ruby/30 text-ruby p-2 rounded-none transition" title="Eliminar">
                                                    <Icons.Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ================ TAB: ACTIVIDADES ================ */}
                {activeTab === 'actividades' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-parchment">Actividades</h2>
                            <button onClick={function() { setShowAddActivity(true); }}
                                className="flex items-center gap-2 bg-emerald hover:bg-emerald/80 text-white px-5 py-2 rounded-none font-semibold transition">
                                <Icons.Plus size={18} /> Registrar Actividad
                            </button>
                        </div>

                        {/* Tipos de actividad grid */}
                        <div className="panel-pixel p-6 mb-6">
                            <h3 className="text-lg font-bold text-parchment mb-4">Tipos de Actividad</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {TIPOS_ACTIVIDAD.map(function(tipo) {
                                    var rubric = RUBRICS_XP[tipo.id];
                                    return (
                                        <div key={tipo.id} className="bg-dungeon-800 rounded-none p-3 text-center hover:bg-dungeon-600 transition">
                                            <div className="text-3xl mb-2">{tipo.icon}</div>
                                            <div className="text-xs font-semibold text-parchment/90 mb-1">{tipo.nombre}</div>
                                            {rubric && (
                                                <div className="text-xs text-arcane">
                                                    {rubric.basico}-{rubric.excepcional} XP
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Historial */}
                        <div className="panel-pixel p-6">
                            <h3 className="text-lg font-bold text-parchment mb-4">Historial de Actividades</h3>
                            {activities.length > 0 ? (
                                <div className="space-y-2">
                                    {activities.slice(0, 50).map(function(act) {
                                        var tipo = TIPOS_ACTIVIDAD.find(function(t) { return t.id === act.tipo; });
                                        var student = students.find(function(s) { return s.id === act.studentId; });
                                        var unidad = unidades.find(function(u) { return u.id === act.unidadId; });
                                        return (
                                            <div key={act.id} className="flex items-center justify-between bg-dungeon-800 rounded-none p-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{tipo ? tipo.icon : '📌'}</span>
                                                    <div>
                                                        <div className="font-semibold text-sm text-parchment">
                                                            {student ? student.nombre : 'Desconocido'}
                                                        </div>
                                                        <div className="text-xs text-arcane">
                                                            {tipo ? tipo.nombre : act.tipo} | {unidad ? unidad.emoji + ' ' + unidad.id : ''} Clase {act.claseNum || '?'} | {new Date(act.date).toLocaleDateString()}
                                                        </div>
                                                        {act.notas && <div className="text-xs text-arcane/70 mt-0.5 italic">{act.notas}</div>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-arcane">+{act.xp} XP</div>
                                                    <div className="text-xs text-arcane capitalize">{act.nivel}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-arcane/70 py-8">No hay actividades registradas aun.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================ TAB: UNIDADES ================ */}
                {activeTab === 'unidades' && (
                    <GestionUnidades
                        unidades={unidades}
                        setUnidades={setUnidades}
                        currentUnidad={currentUnidad}
                        setCurrentUnidad={setCurrentUnidad}
                        currentClase={currentClase}
                        setCurrentClase={setCurrentClase}
                        pack={getContentPack(curso.contentPackId)}
                        personalizadas={unidadesPersonalizadas}
                        onReset={onResetUnidades}
                    />
                )}

                {/* ================ TAB: REGISTRO MASIVO ================ */}
                {activeTab === 'registro-masivo' && (
                    <RegistroMasivo
                        students={students}
                        setStudents={setStudents}
                        addActivity={addActivity}
                        unidades={unidades}
                        activities={activities}
                        unidadActual={currentUnidad}
                        claseActual={currentClase}
                    />
                )}

                {/* ================ TAB: MISIONES ================ */}
                {activeTab === 'misiones' && (
                    <div>
                        <div className="panel-pixel shadow-md p-4 mb-4">
                            <h2 className="text-lg font-bold text-parchment mb-1">🎯 Misiones de Clase</h2>
                            <p className="text-sm text-arcane mb-3">
                                Clase actual: <span className="font-semibold">{currentUnidad} - Clase {currentClase}</span>
                                {currentClaseObj && <span> ({currentClaseObj.titulo})</span>}
                            </p>
                            <p className="text-xs text-arcane/70">
                                Las misiones cambian aleatoriamente en cada clase. Marca las misiones que cada estudiante haya completado.
                                Las misiones "auto" se detectan por actividades registradas. Las manuales debes marcarlas tu.
                            </p>
                        </div>

                        {/* Misiones de esta clase */}
                        {misionesDeClase.map(function(mision) {
                            var claveClase = currentUnidad + '_C' + currentClase;
                            var esManual = mision.verificacion === 'manual';
                            var todosCompletaron = students.every(function(s) {
                                if (!esManual && mision.autoCheck) {
                                    return mision.autoCheck(s.id, activities, currentClase, currentUnidad, s);
                                }
                                return s.misionesCompletadas && s.misionesCompletadas[claveClase] && s.misionesCompletadas[claveClase][mision.id];
                            });
                            var completados = students.filter(function(s) {
                                if (!esManual && mision.autoCheck) {
                                    return mision.autoCheck(s.id, activities, currentClase, currentUnidad, s);
                                }
                                return s.misionesCompletadas && s.misionesCompletadas[claveClase] && s.misionesCompletadas[claveClase][mision.id];
                            }).length;

                            return (
                                <div key={mision.id} className="panel-pixel shadow-md p-4 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{mision.emoji}</span>
                                            <div>
                                                <h3 className="font-bold text-parchment">{mision.nombre}</h3>
                                                <p className="text-xs text-arcane">{mision.descripcion}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                        mision.tipo === 'entre-clases'
                                                            ? 'bg-gold/15 text-gold'
                                                            : 'bg-blue-950/60 text-blue-300'
                                                    }`}>
                                                        {mision.tipo === 'entre-clases' ? '📋 Entre clases' : '🏫 En clase'}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        esManual ? 'bg-gold/15 text-gold' : 'bg-emerald/20 text-emerald'
                                                    }`}>
                                                        {esManual ? '✋ Manual' : '⚡ Automatica'}
                                                    </span>
                                                    <span className="text-xs text-arcane font-semibold">+{mision.recompensa.xp} XP</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-parchment/90">{completados}/{students.length}</p>
                                            <p className="text-xs text-arcane/70">completaron</p>
                                            {esManual && (
                                                <button onClick={function() { toggleMisionTodos(mision.id); }}
                                                    className={`mt-1 text-xs px-3 py-1 rounded-none font-semibold transition-colors ${
                                                        todosCompletaron
                                                            ? 'bg-ruby/15 text-ruby hover:bg-ruby/30'
                                                            : 'bg-emerald/20 text-emerald hover:bg-emerald/30'
                                                    }`}>
                                                    {todosCompletaron ? 'Desmarcar todos' : 'Marcar todos'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lista de estudiantes */}
                                    <div className="border-t pt-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-[300px] overflow-y-auto">
                                            {sortedStudents.map(function(student) {
                                                var completadaManual = student.misionesCompletadas &&
                                                    student.misionesCompletadas[claveClase] &&
                                                    student.misionesCompletadas[claveClase][mision.id];
                                                var completadaAuto = !esManual && mision.autoCheck &&
                                                    mision.autoCheck(student.id, activities, currentClase, currentUnidad, student);
                                                var completada = completadaManual || completadaAuto;

                                                return (
                                                    <button key={student.id}
                                                        onClick={function() {
                                                            if (esManual || !completadaAuto) {
                                                                toggleMisionEstudiante(student.id, mision.id);
                                                            }
                                                        }}
                                                        disabled={completadaAuto && !esManual}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-none text-left text-sm transition-all ${
                                                            completada
                                                                ? 'bg-emerald/10 border border-emerald/60 text-emerald'
                                                                : 'bg-dungeon-800 border border-stone-dark text-arcane hover:bg-dungeon-600'
                                                        } ${completadaAuto && !esManual ? 'cursor-default' : 'cursor-pointer'}`}>
                                                        <span className="text-lg">{completada ? '✅' : '⬜'}</span>
                                                        <span className="truncate font-medium">{student.nombreSocial || student.nombre}</span>
                                                        {completadaAuto && !esManual && (
                                                            <span className="text-xs text-emerald ml-auto">auto</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ================ TAB: ARTEFACTOS ================ */}
                {activeTab === 'artefactos' && (
                    <div>
                        {/* Catalogo */}
                        <h2 className="text-2xl font-bold text-parchment mb-4">Catalogo de Artefactos Filosoficos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                            {ARTEFACTOS.map(function(art) {
                                var rarezaColor = getRarezaColor(art.rareza);
                                return (
                                    <div key={art.id} className={"panel-pixel p-5 border-2 " + rarezaColor}>
                                        <div className="text-4xl text-center mb-3">{art.emoji}</div>
                                        <div className="text-center font-bold text-parchment mb-1">{art.nombre}</div>
                                        <div className="text-center text-xs text-arcane capitalize mb-2">
                                            <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " +
                                                (art.rareza === 'legendario' ? 'bg-gold/15 text-gold' :
                                                 art.rareza === 'epico' ? 'bg-arcane/20 text-arcane' :
                                                 'bg-blue-950/60 text-blue-300')}>
                                                {art.rareza}
                                            </span>
                                        </div>
                                        <div className="text-center text-xs text-arcane">{art.efecto}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Gestion por estudiante */}
                        <h3 className="text-xl font-bold text-parchment mb-4">Gestion de Artefactos por Estudiante</h3>
                        {students.length > 0 ? (
                            <div className="space-y-3 mb-8">
                                {students.map(function(student) {
                                    var artefactos = student.artefactos || [];
                                    return (
                                        <div key={student.id} className="panel-pixel p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-bold text-parchment">{student.nombreSocial || student.nombre}</div>
                                                <div className="flex gap-2">
                                                    <button onClick={function() { setSelectedArtefactoStudent(student); setShowGrantArtefacto(true); }}
                                                        className="bg-emerald/20 hover:bg-emerald/30 text-emerald px-3 py-1 rounded-none text-xs font-semibold transition">
                                                        Otorgar
                                                    </button>
                                                    <button onClick={function() { setSelectedArtefactoStudent(student); setShowUseArtefacto(true); }}
                                                        className="bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 px-3 py-1 rounded-none text-xs font-semibold transition">
                                                        Usar
                                                    </button>
                                                    <button onClick={function() { setSelectedArtefactoStudent(student); setShowGiftArtefacto(true); }}
                                                        className="bg-arcane/20 hover:bg-arcane/30 text-arcane px-3 py-1 rounded-none text-xs font-semibold transition">
                                                        Regalar
                                                    </button>
                                                </div>
                                            </div>
                                            {artefactos.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {artefactos.map(function(artInv, idx) {
                                                        var artDef = ARTEFACTOS.find(function(a) { return a.id === artInv.id; });
                                                        if (!artDef) return null;
                                                        return (
                                                            <div key={idx}
                                                                className={"inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border " +
                                                                    (artInv.usado ? 'bg-dungeon-800 text-arcane/70 border-stone line-through' : getRarezaColor(artDef.rareza))}
                                                                title={artDef.efecto + (artInv.usado ? ' (Usado)' : '')}>
                                                                {artDef.emoji} {artDef.nombre}
                                                                {artInv.usado && <span className="ml-1 text-arcane/70">(Usado)</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-arcane/70">Sin artefactos</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="panel-pixel shadow p-8 text-center text-arcane/70 mb-8">
                                No hay estudiantes registrados.
                            </div>
                        )}

                        {/* Top coleccionistas */}
                        <h3 className="text-xl font-bold text-parchment mb-4">Top Coleccionistas</h3>
                        <div className="panel-pixel p-6">
                            {(function() {
                                var ranked = [].concat(students)
                                    .map(function(s) { return { nombre: s.nombreSocial || s.nombre, total: (s.artefactos || []).length }; })
                                    .sort(function(a, b) { return b.total - a.total; })
                                    .filter(function(s) { return s.total > 0; });
                                if (ranked.length === 0) {
                                    return <div className="text-center text-arcane/70 py-4">Nadie tiene artefactos aun.</div>;
                                }
                                return (
                                    <div className="space-y-2">
                                        {ranked.map(function(r, idx) {
                                            return (
                                                <div key={idx} className="flex items-center justify-between bg-dungeon-800 rounded-none p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm " +
                                                            (idx === 0 ? 'bg-gold/100' : idx === 1 ? 'bg-stone' : idx === 2 ? 'bg-orange-400' : 'bg-dungeon-600')}>
                                                            {idx + 1}
                                                        </div>
                                                        <span className="font-semibold text-parchment">{r.nombre}</span>
                                                    </div>
                                                    <span className="font-bold text-arcane">{r.total} artefactos</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* ================ TAB: HABILIDADES ================ */}
                {activeTab === 'habilidades' && (
                    <div>
                        <h2 className="text-2xl font-bold text-parchment mb-6">Habilidades Filosoficas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {HABILIDADES.map(function(hab) {
                                return (
                                    <div key={hab.id} className="panel-pixel p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-3xl">{hab.emoji}</span>
                                            <div>
                                                <h3 className="text-lg font-bold" style={{ color: hab.color }}>{hab.nombre}</h3>
                                                <p className="text-sm text-arcane">{hab.descripcion}</p>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="text-xs font-semibold text-arcane mb-2 uppercase">Como mejorar</div>
                                            <p className="text-sm text-arcane">{hab.comoMejora}</p>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-arcane mb-2 uppercase">Niveles de Progresion</div>
                                            <div className="space-y-1">
                                                {HABILIDAD_NIVELES.map(function(niv) {
                                                    return (
                                                        <div key={niv.nivel} className="flex items-center gap-2 text-sm">
                                                            <div className="flex gap-0.5">
                                                                {[1,2,3,4,5].map(function(star) {
                                                                    return <span key={star} className={star <= niv.nivel ? 'text-gold' : 'text-arcane/60'}>&#9733;</span>;
                                                                })}
                                                            </div>
                                                            <span className="font-semibold text-parchment/90">{niv.nombre}</span>
                                                            <span className="text-arcane/70 text-xs">({niv.min}-{niv.max === 9999 ? '...' : niv.max} pts)</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explicacion de progresion */}
                        <div className="panel-pixel p-6">
                            <h3 className="text-lg font-bold text-parchment mb-4">Como funciona la Progresion</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-950/50 rounded-none p-4">
                                    <div className="text-2xl mb-2">📝</div>
                                    <h4 className="font-bold text-parchment mb-1">1. Realizar Actividades</h4>
                                    <p className="text-sm text-arcane">Cada actividad otorga puntos en habilidades especificas segun su tipo.</p>
                                </div>
                                <div className="bg-arcane/10 rounded-none p-4">
                                    <div className="text-2xl mb-2">📈</div>
                                    <h4 className="font-bold text-parchment mb-1">2. Acumular Puntos</h4>
                                    <p className="text-sm text-arcane">Los puntos se acumulan en cada habilidad y determinan el nivel de maestria.</p>
                                </div>
                                <div className="bg-emerald/10 rounded-none p-4">
                                    <div className="text-2xl mb-2">⭐</div>
                                    <h4 className="font-bold text-parchment mb-1">3. Subir de Nivel</h4>
                                    <p className="text-sm text-arcane">Al alcanzar ciertos umbrales, se desbloquean nuevos niveles de habilidad (1 a 5 estrellas).</p>
                                </div>
                            </div>
                            <div className="mt-4 bg-dungeon-800 rounded-none p-4">
                                <h4 className="font-bold text-parchment mb-2">Habilidades por Tipo de Actividad</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {TIPOS_ACTIVIDAD.map(function(tipo) {
                                        var habRubric = RUBRICS_HABILIDADES[tipo.id];
                                        if (!habRubric) return null;
                                        return (
                                            <div key={tipo.id} className="panel-pixel-dark p-3 text-sm">
                                                <div className="font-semibold text-parchment/90 mb-1">{tipo.icon} {tipo.nombre}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.keys(habRubric).map(function(habId) {
                                                        var hab = HABILIDADES.find(function(h) { return h.id === habId; });
                                                        if (!hab) return null;
                                                        return (
                                                            <span key={habId} className="bg-dungeon-800 px-2 py-0.5 rounded text-xs">
                                                                {hab.emoji} +{habRubric[habId]}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================ TAB: CURSOS ================ */}
                {activeTab === 'cursos' && (
                    <GestionCursos
                        cursos={cursos}
                        currentCursoId={currentCursoId}
                        onActivar={setCurrentCursoId}
                        onAdd={addCurso}
                        onDuplicar={duplicarCurso}
                        onUpdate={updateCurso}
                        onDelete={deleteCurso}
                    />
                )}

            </div>

            {/* ================ MODALES ================ */}

            {showAddStudent && (
                <AddStudentModal
                    onClose={function() { setShowAddStudent(false); }}
                    onAdd={addStudent}
                    backendKind={backendKind}
                    cursoId={curso.id}
                />
            )}

            {showEditStudent && (
                <EditStudentModal
                    student={showEditStudent}
                    onClose={function() { setShowEditStudent(null); }}
                    onAddXP={addXP}
                    onAddHabilidadPoints={addHabilidadPoints}
                    onAddBadge={addBadge}
                    onAddArtefacto={addArtefacto}
                />
            )}

            {showStudentDetail && (
                <StudentDetailModal
                    student={showStudentDetail}
                    activities={activities}
                    onClose={function() { setShowStudentDetail(null); }}
                    onDeleteActivity={function(activityId) {
                        var act = activities.find(function(a) { return a.id === activityId; });
                        if (!act) return;
                        if (!confirm('Eliminar esta actividad y restar ' + (act.xp || 0) + ' XP al estudiante?')) return;
                        // Restar XP y habilidades al estudiante
                        setStudents(function(prev) {
                            return prev.map(function(s) {
                                if (s.id !== act.studentId) return s;
                                var newXP = Math.max(0, (s.xp || 0) - (act.xp || 0));
                                var newHabs = Object.assign({}, s.habilidades || {});
                                var habPoints = act.habilidades || (RUBRICS_HABILIDADES[act.tipo] || {});
                                Object.keys(habPoints).forEach(function(habId) {
                                    newHabs[habId] = Math.max(0, (newHabs[habId] || 0) - habPoints[habId]);
                                });
                                return Object.assign({}, s, { xp: newXP, habilidades: newHabs });
                            });
                        });
                        // Eliminar la actividad
                        setActivities(function(prev) {
                            return prev.filter(function(a) { return a.id !== activityId; });
                        });
                    }}
                />
            )}

            {showAddActivity && (
                <AddActivityModal
                    students={students}
                    unidades={unidades}
                    unidadActual={currentUnidad}
                    claseActual={currentClase}
                    onClose={function() { setShowAddActivity(false); }}
                    onAdd={addActivity}
                />
            )}

            {/* Modal Otorgar Artefacto */}
            {showGrantArtefacto && selectedArtefactoStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="panel-pixel-dark p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Otorgar Artefacto a {selectedArtefactoStudent.nombre}</h3>
                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                            {ARTEFACTOS.map(function(art) {
                                return (
                                    <button key={art.id} onClick={function() { otorgarArtefacto(selectedArtefactoStudent.id, art.id); }}
                                        className={"p-3 rounded-none border-2 text-center hover:shadow transition " + getRarezaColor(art.rareza)}>
                                        <div className="text-2xl mb-1">{art.emoji}</div>
                                        <div className="text-xs font-semibold">{art.nombre}</div>
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={function() { setShowGrantArtefacto(false); setSelectedArtefactoStudent(null); }}
                            className="w-full mt-4 bg-dungeon-600 hover:bg-stone text-parchment py-2 rounded-none font-semibold">Cancelar</button>
                    </div>
                </div>
            )}

            {/* Modal Usar Artefacto */}
            {showUseArtefacto && selectedArtefactoStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="panel-pixel-dark p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Usar Artefacto de {selectedArtefactoStudent.nombre}</h3>
                        {(function() {
                            var artsDisponibles = (selectedArtefactoStudent.artefactos || [])
                                .map(function(a, i) { return Object.assign({}, a, { _idx: i }); })
                                .filter(function(a) { return !a.usado; });
                            if (artsDisponibles.length === 0) {
                                return <div className="text-center text-arcane/70 py-4">No tiene artefactos disponibles para usar.</div>;
                            }
                            return (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {artsDisponibles.map(function(artInv) {
                                        var artDef = ARTEFACTOS.find(function(a) { return a.id === artInv.id; });
                                        if (!artDef) return null;
                                        return (
                                            <button key={artInv._idx} onClick={function() { usarArtefacto(selectedArtefactoStudent.id, artInv._idx); }}
                                                className={"w-full flex items-center gap-3 p-3 rounded-none border-2 hover:shadow transition text-left " + getRarezaColor(artDef.rareza)}>
                                                <span className="text-2xl">{artDef.emoji}</span>
                                                <div>
                                                    <div className="font-semibold text-sm">{artDef.nombre}</div>
                                                    <div className="text-xs text-arcane">{artDef.efecto}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                        <button onClick={function() { setShowUseArtefacto(false); setSelectedArtefactoStudent(null); }}
                            className="w-full mt-4 bg-dungeon-600 hover:bg-stone text-parchment py-2 rounded-none font-semibold">Cancelar</button>
                    </div>
                </div>
            )}

            {/* Modal Regalar Artefacto */}
            {showGiftArtefacto && selectedArtefactoStudent && (
                <GiftArtefactoModal
                    fromStudent={selectedArtefactoStudent}
                    students={students}
                    onGift={regalarArtefacto}
                    onClose={function() { setShowGiftArtefacto(false); setSelectedArtefactoStudent(null); }}
                />
            )}
        </div>
    );
};

// Sub-componente modal para regalar artefactos
function GiftArtefactoModal({ fromStudent, students, onGift, onClose }) {
    var _useState = useState(null), selectedArtIdx = _useState[0], setSelectedArtIdx = _useState[1];
    var _useState2 = useState(''), toStudentId = _useState2[0], setToStudentId = _useState2[1];

    var artsDisponibles = (fromStudent.artefactos || [])
        .map(function(a, i) { return Object.assign({}, a, { _idx: i }); })
        .filter(function(a) { return !a.usado; });
    var otherStudents = students.filter(function(s) { return s.id !== fromStudent.id; });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="panel-pixel-dark p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Regalar Artefacto de {fromStudent.nombre}</h3>
                {artsDisponibles.length === 0 ? (
                    <div className="text-center text-arcane/70 py-4">No tiene artefactos disponibles para regalar.</div>
                ) : (
                    <div>
                        <label className="block text-sm font-semibold mb-2">Seleccionar artefacto</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                            {artsDisponibles.map(function(artInv) {
                                var artDef = ARTEFACTOS.find(function(a) { return a.id === artInv.id; });
                                if (!artDef) return null;
                                return (
                                    <button key={artInv._idx}
                                        onClick={function() { setSelectedArtIdx(artInv._idx); }}
                                        className={"w-full flex items-center gap-3 p-3 rounded-none border-2 text-left transition " +
                                            (selectedArtIdx === artInv._idx ? 'ring-2 ring-arcane ' : '') + getRarezaColor(artDef.rareza)}>
                                        <span className="text-2xl">{artDef.emoji}</span>
                                        <div className="text-sm font-semibold">{artDef.nombre}</div>
                                    </button>
                                );
                            })}
                        </div>
                        <label className="block text-sm font-semibold mb-2">Destinatario</label>
                        <select value={toStudentId} onChange={function(e) { setToStudentId(Number(e.target.value)); }}
                            className="input-pixel w-full px-4 py-2 mb-4">
                            <option value="">Seleccionar estudiante</option>
                            {otherStudents.map(function(s) {
                                return <option key={s.id} value={s.id}>{s.nombreSocial || s.nombre}</option>;
                            })}
                        </select>
                        <button onClick={function() {
                                if (selectedArtIdx !== null && toStudentId) {
                                    onGift(fromStudent.id, toStudentId, selectedArtIdx);
                                } else {
                                    alert('Selecciona artefacto y destinatario.');
                                }
                            }}
                            className="w-full bg-arcane hover:bg-arcane/80 text-white py-2 rounded-none font-bold mb-2">
                            Regalar
                        </button>
                    </div>
                )}
                <button onClick={onClose}
                    className="w-full bg-dungeon-600 hover:bg-stone text-parchment py-2 rounded-none font-semibold">Cancelar</button>
            </div>
        </div>
    );
}
