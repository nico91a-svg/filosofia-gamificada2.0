// Componente principal de la aplicación
window.FilosofoApp = () => {
    const { useState, useEffect, useRef } = React;

    // Curso activo (edicion del juego). Default: primero de la lista de CURSOS.
    const cursosDisponibles = (window.CURSOS || []);
    const initialCurso = (window.loadCursoSelection && window.loadCursoSelection())
        || (cursosDisponibles[0] && cursosDisponibles[0].id)
        || '3B-2026';
    const [currentCursoId, setCurrentCursoId] = useState(initialCurso);

    const [currentUser, setCurrentUser] = useState(null);
    const [loginType, setLoginType] = useState(null);
    const [students, setStudents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [unidades, setUnidades] = useState(window.UNIDADES_DEFAULT);
    const [currentUnidad, setCurrentUnidad] = useState('U1');
    const [currentClase, setCurrentClase] = useState(1);
    const [loading, setLoading] = useState(true);

    // Path helper: traduce recurso logico al path real segun curso activo.
    const pathFor = (resource) => window.getCursoPath(currentCursoId, resource);

    // Refs para rastrear que datos ya fueron cargados de Firebase
    // Esto evita guardar arrays vacios antes de que Firebase responda
    const dataLoadedRef = useRef({
        students: false,
        activities: false,
        unidades: false,
        position: false
    });
    // Ref para evitar guardar datos que acabamos de recibir de Firebase
    const syncingRef = useRef({
        students: false,
        activities: false,
        unidades: false
    });

    // Normalizar datos de estudiante
    const normalizeStudent = (s) => ({
        ...s,
        nombreSocial: s.nombreSocial || s.nombre,
        nombreLegal: s.nombreLegal || s.nombre,
        genero: s.genero || 'no-binario',
        vocabularioDescubierto: s.vocabularioDescubierto || [],
        artefactos: s.artefactos || s.inventarioArtefactos || [],
        misionesCompletadas: s.misionesCompletadas || {},
        badges: s.badges || ['iniciado'],
        habilidades: s.habilidades || { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0 }
    });

    // Convertir snapshot Firebase a array
    const toArray = (data) => {
        if (!data) return [];
        return (Array.isArray(data) ? data : Object.values(data)).filter(Boolean);
    };

    // Funcion helper para marcar datos como cargados y verificar si ya cargo todo
    const checkAllLoaded = () => {
        const d = dataLoadedRef.current;
        if (d.students && d.activities) {
            setLoading(false);
        }
    };

    // Cargar datos con listeners en tiempo real (se re-suscribe al cambiar de curso)
    useEffect(() => {
        const isFirebase = window.DatabaseService.isFirebaseConnected();
        console.log('[curso ' + currentCursoId + '] Firebase:', isFirebase);

        // Reset flags al cambiar de curso. NO reseteamos loading=true para no
        // ocultar el LoginScreen si el usuario esta cambiando de curso desde alli;
        // los nuevos datos se cargan en 2do plano.
        dataLoadedRef.current = { students: false, activities: false, unidades: false, position: false };

        // Semilla de estudiantes para este curso (si esta definida)
        const defaults = (window.getCursoDefaultStudents && window.getCursoDefaultStudents(currentCursoId)) || [];

        // Timeout de seguridad: si en 10 segundos no carga, mostrar UI con datos locales
        // IMPORTANTE: No guardar defaults a Firebase para no sobreescribir progreso existente
        const safetyTimeout = setTimeout(() => {
            if (loading) {
                console.warn('Timeout de carga. Mostrando UI con datos locales.');
                if (defaults.length > 0 && students.length === 0) {
                    syncingRef.current.students = true;
                    setStudents(defaults);
                    setTimeout(() => { syncingRef.current.students = false; }, 2000);
                }
                dataLoadedRef.current.students = true;
                dataLoadedRef.current.activities = true;
                setLoading(false);
            }
        }, 10000);

        const listeners = [];

        if (isFirebase) {
            // ---- MODO FIREBASE: listeners en tiempo real ----
            // Estudiantes
            const studentsPath = pathFor('students');
            listeners.push(studentsPath);
            window.DatabaseService.load(studentsPath, (data) => {
                const arr = toArray(data);

                // Verificar si Firebase tiene datos plausibles (al menos alguno con password)
                const hasValidData = arr.length > 0 &&
                    (defaults.length === 0 || arr.length >= Math.min(defaults.length, 3)) &&
                    arr.some(s => s.password);

                if (hasValidData) {
                    syncingRef.current.students = true;
                    setStudents(arr.map(normalizeStudent));
                    setTimeout(() => { syncingRef.current.students = false; }, 800);
                } else if (!dataLoadedRef.current.students) {
                    // Firebase vacio: sembrar con defaults si existen
                    if (defaults.length > 0) {
                        console.log('Sembrando ' + defaults.length + ' estudiantes en ' + studentsPath);
                        setStudents(defaults);
                        window.DatabaseService.save(studentsPath, defaults)
                            .catch(err => console.error('Error sembrando estudiantes:', err));
                    } else {
                        setStudents([]);
                    }
                }
                dataLoadedRef.current.students = true;
                clearTimeout(safetyTimeout);
                checkAllLoaded();
            });

            // Actividades
            const actsPath = pathFor('activities');
            window.DatabaseService.load(actsPath, (data) => {
                const arr = toArray(data);
                syncingRef.current.activities = true;
                setActivities(arr);
                setTimeout(() => { syncingRef.current.activities = false; }, 800);
                dataLoadedRef.current.activities = true;
                checkAllLoaded();
            });

            // Posicion actual
            window.DatabaseService.load(pathFor('position'), (data) => {
                if (data) {
                    if (data.unidad) setCurrentUnidad(data.unidad);
                    if (data.clase) setCurrentClase(data.clase);
                } else {
                    setCurrentUnidad('U1');
                    setCurrentClase(1);
                }
                dataLoadedRef.current.position = true;
            });

            // Unidades personalizadas
            window.DatabaseService.load(pathFor('unidades'), (data) => {
                const arr = toArray(data);
                if (arr.length > 0) {
                    syncingRef.current.unidades = true;
                    setUnidades(arr);
                    setTimeout(() => { syncingRef.current.unidades = false; }, 800);
                } else {
                    setUnidades(window.UNIDADES_DEFAULT);
                }
                dataLoadedRef.current.unidades = true;
            });
        } else {
            // ---- MODO OFFLINE: localStorage ----
            clearTimeout(safetyTimeout);
            const loadOffline = async () => {
                try {
                    const savedStudents = await window.DatabaseService.loadOnce(pathFor('students'));
                    const arr = toArray(savedStudents);
                    if (arr.length > 0) {
                        setStudents(arr.map(normalizeStudent));
                    } else if (defaults.length > 0) {
                        setStudents(defaults);
                    }

                    const savedActs = await window.DatabaseService.loadOnce(pathFor('activities'));
                    const actsArr = toArray(savedActs);
                    setActivities(actsArr);

                    const savedPos = await window.DatabaseService.loadOnce(pathFor('position'));
                    if (savedPos) {
                        if (savedPos.unidad) setCurrentUnidad(savedPos.unidad);
                        if (savedPos.clase) setCurrentClase(savedPos.clase);
                    }
                } catch (error) {
                    console.error('Error cargando datos offline:', error);
                }
                dataLoadedRef.current.students = true;
                dataLoadedRef.current.activities = true;
                dataLoadedRef.current.unidades = true;
                dataLoadedRef.current.position = true;
                setLoading(false);
            };
            loadOffline();
        }

        return () => clearTimeout(safetyTimeout);
    }, [currentCursoId]);

    // Guardar datos cuando cambien (solo si ya fueron cargados Y no viene de Firebase sync)
    useEffect(() => {
        if (!loading && dataLoadedRef.current.students && !syncingRef.current.students && students.length > 0) {
            window.DatabaseService.save(pathFor('students'), students)
                .catch(err => console.error('ERROR guardando estudiantes:', err));
        }
    }, [students, loading]);

    useEffect(() => {
        if (!loading && dataLoadedRef.current.activities && !syncingRef.current.activities) {
            window.DatabaseService.save(pathFor('activities'), activities)
                .catch(err => console.error('ERROR guardando actividades:', err));
        }
    }, [activities, loading]);

    useEffect(() => {
        if (!loading && dataLoadedRef.current.unidades && !syncingRef.current.unidades && unidades.length > 0) {
            window.DatabaseService.save(pathFor('unidades'), unidades)
                .catch(err => console.error('ERROR guardando unidades:', err));
        }
    }, [unidades, loading]);

    useEffect(() => {
        if (!loading && dataLoadedRef.current.position) {
            window.DatabaseService.save(pathFor('position'), { unidad: currentUnidad, clase: currentClase })
                .catch(err => console.error('ERROR guardando posicion:', err));
        }
    }, [currentUnidad, currentClase, loading]);

    // El LoginScreen llama esto tan pronto se selecciona un curso, para que
    // los datos del curso se empiecen a cargar mientras el usuario completa
    // el resto del formulario. Evita race condition al validar credenciales.
    const handleCursoChange = (nuevoCursoId) => {
        if (nuevoCursoId && nuevoCursoId !== currentCursoId) {
            setCurrentCursoId(nuevoCursoId);
            if (window.saveCursoSelection) window.saveCursoSelection(nuevoCursoId);
        }
    };

    // Login: el cursoId ya se sincronizo al elegirlo (handleCursoChange), asi
    // que aca solo validamos credenciales contra los students ya cargados.
    const handleLogin = (type, username, password, cursoId) => {
        attemptLogin(type, username, password);
    };

    const attemptLogin = (type, username, password) => {
        if (type === 'profesor' && username === window.APP_CONFIG.profesor.usuario && password === window.APP_CONFIG.profesor.password) {
            setCurrentUser({ tipo: 'profesor', nombre: 'Profesor' });
            setLoginType('profesor');
        } else if (type === 'estudiante') {
            const student = students.find(s =>
                ((s.nombreSocial || s.nombre).toLowerCase() === username.toLowerCase() ||
                 s.nombre.toLowerCase() === username.toLowerCase()) && s.password === password
            );
            if (student) {
                setCurrentUser({ tipo: 'estudiante', ...student });
                setLoginType('estudiante');
            } else {
                alert('Credenciales incorrectas');
            }
        } else {
            alert('Credenciales incorrectas');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setLoginType(null);
    };

    // Export
    const handleExportData = () => {
        const curso = window.getCurso(currentCursoId);
        const dataStr = JSON.stringify({
            curso: { id: curso.id, nombre: curso.nombre, anio: curso.anio },
            students, activities, unidades,
            position: { unidad: currentUnidad, clase: currentClase }
        }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'filosofo_backup_' + curso.id + '_' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
    };

    // Import
    const handleImportData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (data.students) {
                        const normalized = (Array.isArray(data.students) ? data.students : Object.values(data.students)).map(s => ({
                            ...s,
                            nombreSocial: s.nombreSocial || s.nombre,
                            nombreLegal: s.nombreLegal || s.nombre,
                            genero: s.genero || 'no-binario',
                            vocabularioDescubierto: s.vocabularioDescubierto || [],
                            inventarioArtefactos: s.inventarioArtefactos || [],
                            badges: s.badges || ['iniciado'],
                            habilidades: s.habilidades || { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0 }
                        }));
                        setStudents(normalized);
                    }
                    if (data.activities) {
                        const acts = Array.isArray(data.activities) ? data.activities : Object.values(data.activities);
                        setActivities(acts.filter(Boolean));
                    }
                    if (data.unidades) {
                        const unis = Array.isArray(data.unidades) ? data.unidades : Object.values(data.unidades);
                        if (unis.length > 0) setUnidades(unis);
                    }
                    if (data.position) {
                        if (data.position.unidad) setCurrentUnidad(data.position.unidad);
                        if (data.position.clase) setCurrentClase(data.position.clase);
                    }
                    alert('Datos importados: ' + (data.students ? data.students.length : 0) + ' estudiantes y ' + (data.activities ? data.activities.length : 0) + ' actividades.');
                } catch (err) {
                    alert('Error al importar: El archivo no tiene un formato valido. ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="relative text-center text-white">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500 shadow-2xl shadow-violet-900/50 animate-pulse-slow">
                        <span className="text-4xl">🏛️</span>
                    </div>
                    <h1 className="font-serif text-3xl font-bold mb-2 tracking-tight">Cargando...</h1>
                    <p className="text-violet-200/70 text-sm">Preparando tu edicion del juego</p>
                </div>
            </div>
        );
    }

    // Login screen
    if (!currentUser) {
        return <window.LoginScreen onLogin={handleLogin} onCursoChange={handleCursoChange} />;
    }

    const curso = window.getCurso(currentCursoId);

    // Profesor dashboard
    if (loginType === 'profesor') {
        return (
            <window.ProfesorDashboard
                students={students}
                setStudents={setStudents}
                activities={activities}
                setActivities={setActivities}
                unidades={unidades}
                setUnidades={setUnidades}
                currentUnidad={currentUnidad}
                setCurrentUnidad={setCurrentUnidad}
                currentClase={currentClase}
                setCurrentClase={setCurrentClase}
                onLogout={handleLogout}
                onExportData={handleExportData}
                onImportData={handleImportData}
                curso={curso}
            />
        );
    }

    // Estudiante dashboard
    if (loginType === 'estudiante') {
        // Refresh student data from state (may have changed)
        const freshStudent = students.find(s => s.id === currentUser.id);
        return (
            <window.EstudianteDashboard
                currentUser={freshStudent || currentUser}
                students={students}
                setStudents={setStudents}
                activities={activities}
                unidades={unidades}
                currentUnidad={currentUnidad}
                currentClase={currentClase}
                onLogout={handleLogout}
                curso={curso}
            />
        );
    }

    return null;
};
