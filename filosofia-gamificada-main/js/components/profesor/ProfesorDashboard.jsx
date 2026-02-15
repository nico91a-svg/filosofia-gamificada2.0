// ProfesorDashboard.jsx - Dashboard principal del profesor
const { useState, useEffect } = React;

window.ProfesorDashboard = function ProfesorDashboard({
    students, setStudents,
    activities, setActivities,
    unidades, setUnidades,
    currentUnidad, setCurrentUnidad,
    currentClase, setCurrentClase,
    onLogout, onExportData, onImportData
}) {
    // ---- Estado interno ----
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showEditStudent, setShowEditStudent] = useState(null);
    const [showStudentDetail, setShowStudentDetail] = useState(null);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showGrantArtefacto, setShowGrantArtefacto] = useState(false);
    const [showUseArtefacto, setShowUseArtefacto] = useState(false);
    const [showGiftArtefacto, setShowGiftArtefacto] = useState(false);
    const [selectedArtefactoStudent, setSelectedArtefactoStudent] = useState(null);

    // ---- Guardar datos cuando cambian ----
    useEffect(function() {
        if (students && students.length >= 0) {
            window.DatabaseService.save('students', students);
        }
    }, [students]);

    useEffect(function() {
        if (activities && activities.length >= 0) {
            window.DatabaseService.save('activities', activities);
        }
    }, [activities]);

    useEffect(function() {
        if (unidades && unidades.length > 0) {
            window.DatabaseService.save('unidades', unidades);
        }
    }, [unidades]);

    // ---- Funciones de estudiantes ----
    function addStudent(data) {
        var newStudent = {
            id: Date.now(),
            nombre: data.nombre,
            clase: data.clase,
            password: data.password,
            xp: 0,
            habilidades: { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0 },
            badges: ['iniciado'],
            vocabularioDescubierto: [],
            artefactos: []
        };
        setStudents(function(prev) { return [].concat(prev, [newStudent]); });
        setShowAddStudent(false);
    }

    function updateStudent(id, updates) {
        setStudents(function(prev) {
            return prev.map(function(s) {
                return s.id === id ? Object.assign({}, s, updates) : s;
            });
        });
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

        // Badge: filosofo_aplicado - completo un proyecto ABP
        if (activityType === 'proyecto' && !currentBadges.includes('filosofo_aplicado')) {
            newBadges.push('filosofo_aplicado');
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
        var newActivity = {
            id: Date.now(),
            studentId: data.studentId,
            tipo: data.tipo,
            nivel: data.nivel,
            xp: data.xp,
            notas: data.notas || '',
            unidadId: data.unidadId || currentUnidad,
            claseNum: data.claseNum || currentClase,
            date: new Date().toISOString(),
            habilidades: data.habilidades || {}
        };
        var updatedActivities = [newActivity].concat(activities);
        setActivities(function() { return updatedActivities; });
        // Otorgar XP
        addXP(data.studentId, data.xp);
        // Otorgar puntos de habilidad
        var habPoints = data.habilidades || {};
        Object.keys(habPoints).forEach(function(habId) {
            if (habPoints[habId] > 0) {
                addHabilidadPoints(data.studentId, habId, habPoints[habId]);
            }
        });
        // Verificar y otorgar badges automaticos
        checkAndGrantBadges(data.studentId, data.tipo, updatedActivities);
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
    var avgLevel = students.length > 0 ? (students.reduce(function(sum, s) { return sum + window.getNivel(s.xp || 0).nivel; }, 0) / students.length).toFixed(1) : 0;
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
        var vocab = currentU.vocabulario || [];
        var totalClasesU = currentU.totalClases || currentU.clases.length;
        if (vocab.length > 0 && totalClasesU > 0) {
            // Cuantos terminos desbloquear segun la clase actual
            var ratio = targetClase / totalClasesU;
            var numTerms = Math.min(Math.ceil(ratio * vocab.length), vocab.length);
            for (var j = 0; j < numTerms; j++) {
                termsToUnlock.push(vocab[j].termino);
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

    // ---- Tabs config ----
    var tabs = [
        { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
        { id: 'estudiantes', label: 'Estudiantes', emoji: '👥' },
        { id: 'actividades', label: 'Actividades', emoji: '📝' },
        { id: 'unidades', label: 'Unidades', emoji: '📚' },
        { id: 'registro-masivo', label: 'Registro Masivo', emoji: '📋' },
        { id: 'artefactos', label: 'Artefactos', emoji: '🏺' },
        { id: 'habilidades', label: 'Habilidades', emoji: '🎯' }
    ];

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="min-h-screen bg-gray-100">
            {/* ---- NAVBAR ---- */}
            <nav className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">🏛️</span> Dashboard del Profesor
                    </h1>
                    <div className="flex items-center gap-3">
                        <button onClick={onImportData}
                            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-semibold transition">
                            📥 Importar
                        </button>
                        <button onClick={onExportData}
                            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-semibold transition">
                            <window.Icons.Download size={16} /> Exportar
                        </button>
                        <button onClick={onLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition">
                            <window.Icons.LogOut size={16} /> Salir
                        </button>
                    </div>
                </div>
            </nav>

            {/* ---- TABS ---- */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {tabs.map(function(tab) {
                            return (
                                <button key={tab.id} onClick={function() { setActiveTab(tab.id); }}
                                    className={"px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition " +
                                        (activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow'
                                            : 'text-gray-600 hover:bg-gray-100')}>
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
                            <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <window.Icons.Users size={28} className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">{students.length}</div>
                                    <div className="text-sm text-gray-500">Total Estudiantes</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <window.Icons.TrendingUp size={28} className="text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">{avgXP}</div>
                                    <div className="text-sm text-gray-500">XP Promedio</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                                <div className="bg-yellow-100 p-3 rounded-lg">
                                    <window.Icons.Trophy size={28} className="text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">{avgLevel}</div>
                                    <div className="text-sm text-gray-500">Nivel Promedio</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <window.Icons.BookOpen size={28} className="text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">{activities.length}</div>
                                    <div className="text-sm text-gray-500">Total Actividades</div>
                                </div>
                            </div>
                        </div>

                        {/* Unidad y Clase Actual */}
                        <div className="bg-white rounded-xl shadow p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Clase Actual</h2>
                            <div className="flex items-center justify-between">
                                <button onClick={prevClase}
                                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-700 font-bold transition">
                                    &#8592; Anterior
                                </button>
                                <div className="text-center">
                                    {currentUnidadObj && (
                                        <div>
                                            <div className="text-3xl mb-1">{currentUnidadObj.emoji}</div>
                                            <div className="text-sm text-gray-500 font-semibold">{currentUnidadObj.id} - {currentUnidadObj.nombre}</div>
                                            {currentClaseObj && (
                                                <div className="mt-2">
                                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                                                        Clase {currentClaseObj.num}: {currentClaseObj.emoji} {currentClaseObj.titulo}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button onClick={nextClase}
                                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-700 font-bold transition">
                                    Siguiente &#8594;
                                </button>
                            </div>
                        </div>

                        {/* Actividades Recientes */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Actividades Recientes</h2>
                            {recentActivities.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivities.map(function(act) {
                                        var tipo = window.TIPOS_ACTIVIDAD.find(function(t) { return t.id === act.tipo; });
                                        var student = students.find(function(s) { return s.id === act.studentId; });
                                        var unidad = unidades.find(function(u) { return u.id === act.unidadId; });
                                        return (
                                            <div key={act.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{tipo ? tipo.icon : '📌'}</span>
                                                    <div>
                                                        <div className="font-semibold text-sm text-gray-800">
                                                            {student ? student.nombre : 'Desconocido'} - {tipo ? tipo.nombre : act.tipo}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {unidad ? unidad.emoji + ' ' + unidad.id : ''} Clase {act.claseNum || '?'} | {new Date(act.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-purple-600">+{act.xp} XP</div>
                                                    <div className="text-xs text-gray-500 capitalize">{act.nivel}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-8">No hay actividades registradas aun.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================ TAB: ESTUDIANTES ================ */}
                {activeTab === 'estudiantes' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Ranking de Estudiantes</h2>
                            <button onClick={function() { setShowAddStudent(true); }}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition">
                                <window.Icons.Plus size={18} /> Agregar Estudiante
                            </button>
                        </div>
                        {students.length === 0 ? (
                            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                                <div className="text-5xl mb-4">👥</div>
                                <p className="text-lg">No hay estudiantes registrados.</p>
                                <p className="text-sm mt-1">Agrega tu primer estudiante para comenzar.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedStudents.map(function(student, index) {
                                    var nivel = window.getNivel(student.xp || 0);
                                    var clase = window.CLASES_FILOSOFICAS.find(function(c) { return c.id === student.clase; });
                                    var xpProgress = Math.min(((student.xp - nivel.xp_min) / (nivel.xp_max - nivel.xp_min)) * 100, 100);
                                    return (
                                        <div key={student.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-5">
                                            {/* Rank + Nombre */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm " +
                                                        (index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300')}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{student.nombre}</div>
                                                        {clase && (
                                                            <div className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-semibold mt-1 " + clase.color}>
                                                                {clase.emoji} {clase.nombre}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Nivel y XP */}
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="font-semibold text-gray-700">Nv.{nivel.nivel} {nivel.titulo}</span>
                                                    <span className="text-purple-600 font-bold">{student.xp} XP</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: xpProgress + '%' }}></div>
                                                </div>
                                            </div>

                                            {/* Estrellas de habilidades */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {window.HABILIDADES.map(function(hab) {
                                                    var pts = (student.habilidades && student.habilidades[hab.id]) || 0;
                                                    var nivelH = window.getHabilidadNivel(pts);
                                                    return (
                                                        <div key={hab.id} className="flex items-center gap-0.5" title={hab.nombre + ': ' + pts + ' pts (Nv.' + nivelH + ')'}>
                                                            <span className="text-xs">{hab.emoji}</span>
                                                            <div className="flex gap-px">
                                                                {[1,2,3,4,5].map(function(star) {
                                                                    return (
                                                                        <span key={star} className={"text-xs " + (star <= nivelH ? 'text-yellow-400' : 'text-gray-300')}>&#9733;</span>
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
                                                    className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2 rounded-lg text-xs font-semibold transition">
                                                    Ver Detalles
                                                </button>
                                                <button onClick={function() { setShowEditStudent(student); }}
                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition" title="Editar">
                                                    <window.Icons.Edit2 size={16} />
                                                </button>
                                                <button onClick={function() { deleteStudent(student.id); }}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition" title="Eliminar">
                                                    <window.Icons.Trash2 size={16} />
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
                            <h2 className="text-2xl font-bold text-gray-800">Actividades</h2>
                            <button onClick={function() { setShowAddActivity(true); }}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition">
                                <window.Icons.Plus size={18} /> Registrar Actividad
                            </button>
                        </div>

                        {/* Tipos de actividad grid */}
                        <div className="bg-white rounded-xl shadow p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Tipos de Actividad</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {window.TIPOS_ACTIVIDAD.map(function(tipo) {
                                    var rubric = window.RUBRICS_XP[tipo.id];
                                    return (
                                        <div key={tipo.id} className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition">
                                            <div className="text-3xl mb-2">{tipo.icon}</div>
                                            <div className="text-xs font-semibold text-gray-700 mb-1">{tipo.nombre}</div>
                                            {rubric && (
                                                <div className="text-xs text-gray-500">
                                                    {rubric.basico}-{rubric.excepcional} XP
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Historial */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Historial de Actividades</h3>
                            {activities.length > 0 ? (
                                <div className="space-y-2">
                                    {activities.slice(0, 50).map(function(act) {
                                        var tipo = window.TIPOS_ACTIVIDAD.find(function(t) { return t.id === act.tipo; });
                                        var student = students.find(function(s) { return s.id === act.studentId; });
                                        var unidad = unidades.find(function(u) { return u.id === act.unidadId; });
                                        return (
                                            <div key={act.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{tipo ? tipo.icon : '📌'}</span>
                                                    <div>
                                                        <div className="font-semibold text-sm text-gray-800">
                                                            {student ? student.nombre : 'Desconocido'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {tipo ? tipo.nombre : act.tipo} | {unidad ? unidad.emoji + ' ' + unidad.id : ''} Clase {act.claseNum || '?'} | {new Date(act.date).toLocaleDateString()}
                                                        </div>
                                                        {act.notas && <div className="text-xs text-gray-400 mt-0.5 italic">{act.notas}</div>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-purple-600">+{act.xp} XP</div>
                                                    <div className="text-xs text-gray-500 capitalize">{act.nivel}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-8">No hay actividades registradas aun.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================ TAB: UNIDADES ================ */}
                {activeTab === 'unidades' && (
                    window.GestionUnidades
                        ? <window.GestionUnidades
                            unidades={unidades}
                            setUnidades={setUnidades}
                            currentUnidad={currentUnidad}
                            setCurrentUnidad={setCurrentUnidad}
                            currentClase={currentClase}
                            setCurrentClase={setCurrentClase}
                          />
                        : <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                            <div className="text-5xl mb-4">📚</div>
                            <p>Componente GestionUnidades no disponible.</p>
                          </div>
                )}

                {/* ================ TAB: REGISTRO MASIVO ================ */}
                {activeTab === 'registro-masivo' && (
                    window.RegistroMasivo
                        ? <window.RegistroMasivo
                            students={students}
                            activities={activities}
                            setActivities={setActivities}
                            addXP={addXP}
                            addHabilidadPoints={addHabilidadPoints}
                            addActivity={addActivity}
                            unidades={unidades}
                            currentUnidad={currentUnidad}
                            currentClase={currentClase}
                          />
                        : <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                            <div className="text-5xl mb-4">📋</div>
                            <p>Componente RegistroMasivo no disponible.</p>
                          </div>
                )}

                {/* ================ TAB: ARTEFACTOS ================ */}
                {activeTab === 'artefactos' && (
                    <div>
                        {/* Catalogo */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Catalogo de Artefactos Filosoficos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                            {window.ARTEFACTOS.map(function(art) {
                                var rarezaColor = window.getRarezaColor(art.rareza);
                                return (
                                    <div key={art.id} className={"bg-white rounded-xl shadow p-5 border-2 " + rarezaColor}>
                                        <div className="text-4xl text-center mb-3">{art.emoji}</div>
                                        <div className="text-center font-bold text-gray-800 mb-1">{art.nombre}</div>
                                        <div className="text-center text-xs text-gray-500 capitalize mb-2">
                                            <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " +
                                                (art.rareza === 'legendario' ? 'bg-yellow-100 text-yellow-700' :
                                                 art.rareza === 'epico' ? 'bg-purple-100 text-purple-700' :
                                                 'bg-blue-100 text-blue-700')}>
                                                {art.rareza}
                                            </span>
                                        </div>
                                        <div className="text-center text-xs text-gray-600">{art.efecto}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Gestion por estudiante */}
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Gestion de Artefactos por Estudiante</h3>
                        {students.length > 0 ? (
                            <div className="space-y-3 mb-8">
                                {students.map(function(student) {
                                    var artefactos = student.artefactos || [];
                                    return (
                                        <div key={student.id} className="bg-white rounded-xl shadow p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-bold text-gray-800">{student.nombre}</div>
                                                <div className="flex gap-2">
                                                    <button onClick={function() { setSelectedArtefactoStudent(student); setShowGrantArtefacto(true); }}
                                                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold transition">
                                                        Otorgar
                                                    </button>
                                                    <button onClick={function() { setSelectedArtefactoStudent(student); setShowUseArtefacto(true); }}
                                                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold transition">
                                                        Usar
                                                    </button>
                                                    <button onClick={function() { setSelectedArtefactoStudent(student); setShowGiftArtefacto(true); }}
                                                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-xs font-semibold transition">
                                                        Regalar
                                                    </button>
                                                </div>
                                            </div>
                                            {artefactos.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {artefactos.map(function(artInv, idx) {
                                                        var artDef = window.ARTEFACTOS.find(function(a) { return a.id === artInv.id; });
                                                        if (!artDef) return null;
                                                        return (
                                                            <div key={idx}
                                                                className={"inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border " +
                                                                    (artInv.usado ? 'bg-gray-100 text-gray-400 border-gray-300 line-through' : window.getRarezaColor(artDef.rareza))}
                                                                title={artDef.efecto + (artInv.usado ? ' (Usado)' : '')}>
                                                                {artDef.emoji} {artDef.nombre}
                                                                {artInv.usado && <span className="ml-1 text-gray-400">(Usado)</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-400">Sin artefactos</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 mb-8">
                                No hay estudiantes registrados.
                            </div>
                        )}

                        {/* Top coleccionistas */}
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Top Coleccionistas</h3>
                        <div className="bg-white rounded-xl shadow p-6">
                            {(function() {
                                var ranked = [].concat(students)
                                    .map(function(s) { return { nombre: s.nombre, total: (s.artefactos || []).length }; })
                                    .sort(function(a, b) { return b.total - a.total; })
                                    .filter(function(s) { return s.total > 0; });
                                if (ranked.length === 0) {
                                    return <div className="text-center text-gray-400 py-4">Nadie tiene artefactos aun.</div>;
                                }
                                return (
                                    <div className="space-y-2">
                                        {ranked.map(function(r, idx) {
                                            return (
                                                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm " +
                                                            (idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-gray-300')}>
                                                            {idx + 1}
                                                        </div>
                                                        <span className="font-semibold text-gray-800">{r.nombre}</span>
                                                    </div>
                                                    <span className="font-bold text-purple-600">{r.total} artefactos</span>
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Habilidades Filosoficas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {window.HABILIDADES.map(function(hab) {
                                return (
                                    <div key={hab.id} className="bg-white rounded-xl shadow p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-3xl">{hab.emoji}</span>
                                            <div>
                                                <h3 className="text-lg font-bold" style={{ color: hab.color }}>{hab.nombre}</h3>
                                                <p className="text-sm text-gray-600">{hab.descripcion}</p>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Como mejorar</div>
                                            <p className="text-sm text-gray-600">{hab.comoMejora}</p>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Niveles de Progresion</div>
                                            <div className="space-y-1">
                                                {window.HABILIDAD_NIVELES.map(function(niv) {
                                                    return (
                                                        <div key={niv.nivel} className="flex items-center gap-2 text-sm">
                                                            <div className="flex gap-0.5">
                                                                {[1,2,3,4,5].map(function(star) {
                                                                    return <span key={star} className={star <= niv.nivel ? 'text-yellow-400' : 'text-gray-300'}>&#9733;</span>;
                                                                })}
                                                            </div>
                                                            <span className="font-semibold text-gray-700">{niv.nombre}</span>
                                                            <span className="text-gray-400 text-xs">({niv.min}-{niv.max === 9999 ? '...' : niv.max} pts)</span>
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
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Como funciona la Progresion</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-2xl mb-2">📝</div>
                                    <h4 className="font-bold text-gray-800 mb-1">1. Realizar Actividades</h4>
                                    <p className="text-sm text-gray-600">Cada actividad otorga puntos en habilidades especificas segun su tipo.</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-2xl mb-2">📈</div>
                                    <h4 className="font-bold text-gray-800 mb-1">2. Acumular Puntos</h4>
                                    <p className="text-sm text-gray-600">Los puntos se acumulan en cada habilidad y determinan el nivel de maestria.</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-2xl mb-2">⭐</div>
                                    <h4 className="font-bold text-gray-800 mb-1">3. Subir de Nivel</h4>
                                    <p className="text-sm text-gray-600">Al alcanzar ciertos umbrales, se desbloquean nuevos niveles de habilidad (1 a 5 estrellas).</p>
                                </div>
                            </div>
                            <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                <h4 className="font-bold text-gray-800 mb-2">Habilidades por Tipo de Actividad</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {window.TIPOS_ACTIVIDAD.map(function(tipo) {
                                        var habRubric = window.RUBRICS_HABILIDADES[tipo.id];
                                        if (!habRubric) return null;
                                        return (
                                            <div key={tipo.id} className="bg-white rounded-lg p-3 text-sm">
                                                <div className="font-semibold text-gray-700 mb-1">{tipo.icon} {tipo.nombre}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.keys(habRubric).map(function(habId) {
                                                        var hab = window.HABILIDADES.find(function(h) { return h.id === habId; });
                                                        if (!hab) return null;
                                                        return (
                                                            <span key={habId} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
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

            </div>

            {/* ================ MODALES ================ */}

            {showAddStudent && (
                <window.AddStudentModal
                    onClose={function() { setShowAddStudent(false); }}
                    onAdd={addStudent}
                />
            )}

            {showEditStudent && (
                <window.EditStudentModal
                    student={showEditStudent}
                    onClose={function() { setShowEditStudent(null); }}
                    onAddXP={addXP}
                    onAddHabilidadPoints={addHabilidadPoints}
                    onAddBadge={addBadge}
                    onAddArtefacto={addArtefacto}
                />
            )}

            {showStudentDetail && (
                <window.StudentDetailModal
                    student={showStudentDetail}
                    activities={activities}
                    onClose={function() { setShowStudentDetail(null); }}
                />
            )}

            {showAddActivity && (
                <window.AddActivityModal
                    students={students}
                    unidades={unidades}
                    onClose={function() { setShowAddActivity(false); }}
                    onAdd={addActivity}
                />
            )}

            {/* Modal Otorgar Artefacto */}
            {showGrantArtefacto && selectedArtefactoStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Otorgar Artefacto a {selectedArtefactoStudent.nombre}</h3>
                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                            {window.ARTEFACTOS.map(function(art) {
                                return (
                                    <button key={art.id} onClick={function() { otorgarArtefacto(selectedArtefactoStudent.id, art.id); }}
                                        className={"p-3 rounded-lg border-2 text-center hover:shadow transition " + window.getRarezaColor(art.rareza)}>
                                        <div className="text-2xl mb-1">{art.emoji}</div>
                                        <div className="text-xs font-semibold">{art.nombre}</div>
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={function() { setShowGrantArtefacto(false); setSelectedArtefactoStudent(null); }}
                            className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold">Cancelar</button>
                    </div>
                </div>
            )}

            {/* Modal Usar Artefacto */}
            {showUseArtefacto && selectedArtefactoStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Usar Artefacto de {selectedArtefactoStudent.nombre}</h3>
                        {(function() {
                            var artsDisponibles = (selectedArtefactoStudent.artefactos || [])
                                .map(function(a, i) { return Object.assign({}, a, { _idx: i }); })
                                .filter(function(a) { return !a.usado; });
                            if (artsDisponibles.length === 0) {
                                return <div className="text-center text-gray-400 py-4">No tiene artefactos disponibles para usar.</div>;
                            }
                            return (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {artsDisponibles.map(function(artInv) {
                                        var artDef = window.ARTEFACTOS.find(function(a) { return a.id === artInv.id; });
                                        if (!artDef) return null;
                                        return (
                                            <button key={artInv._idx} onClick={function() { usarArtefacto(selectedArtefactoStudent.id, artInv._idx); }}
                                                className={"w-full flex items-center gap-3 p-3 rounded-lg border-2 hover:shadow transition text-left " + window.getRarezaColor(artDef.rareza)}>
                                                <span className="text-2xl">{artDef.emoji}</span>
                                                <div>
                                                    <div className="font-semibold text-sm">{artDef.nombre}</div>
                                                    <div className="text-xs text-gray-600">{artDef.efecto}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                        <button onClick={function() { setShowUseArtefacto(false); setSelectedArtefactoStudent(null); }}
                            className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold">Cancelar</button>
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Regalar Artefacto de {fromStudent.nombre}</h3>
                {artsDisponibles.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">No tiene artefactos disponibles para regalar.</div>
                ) : (
                    <div>
                        <label className="block text-sm font-semibold mb-2">Seleccionar artefacto</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                            {artsDisponibles.map(function(artInv) {
                                var artDef = window.ARTEFACTOS.find(function(a) { return a.id === artInv.id; });
                                if (!artDef) return null;
                                return (
                                    <button key={artInv._idx}
                                        onClick={function() { setSelectedArtIdx(artInv._idx); }}
                                        className={"w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition " +
                                            (selectedArtIdx === artInv._idx ? 'ring-2 ring-purple-500 ' : '') + window.getRarezaColor(artDef.rareza)}>
                                        <span className="text-2xl">{artDef.emoji}</span>
                                        <div className="text-sm font-semibold">{artDef.nombre}</div>
                                    </button>
                                );
                            })}
                        </div>
                        <label className="block text-sm font-semibold mb-2">Destinatario</label>
                        <select value={toStudentId} onChange={function(e) { setToStudentId(Number(e.target.value)); }}
                            className="w-full px-4 py-2 border rounded-lg mb-4">
                            <option value="">Seleccionar estudiante</option>
                            {otherStudents.map(function(s) {
                                return <option key={s.id} value={s.id}>{s.nombre}</option>;
                            })}
                        </select>
                        <button onClick={function() {
                                if (selectedArtIdx !== null && toStudentId) {
                                    onGift(fromStudent.id, toStudentId, selectedArtIdx);
                                } else {
                                    alert('Selecciona artefacto y destinatario.');
                                }
                            }}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold mb-2">
                            Regalar
                        </button>
                    </div>
                )}
                <button onClick={onClose}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold">Cancelar</button>
            </div>
        </div>
    );
}
