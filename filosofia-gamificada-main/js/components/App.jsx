// Componente principal de la aplicación
window.FilosofoApp = () => {
    const { useState, useEffect, useRef } = React;

    const [currentUser, setCurrentUser] = useState(null);
    const [loginType, setLoginType] = useState(null);
    const [students, setStudents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [unidades, setUnidades] = useState(window.UNIDADES_DEFAULT);
    const [currentUnidad, setCurrentUnidad] = useState('U1');
    const [currentClase, setCurrentClase] = useState(1);
    const [loading, setLoading] = useState(true);

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
        inventarioArtefactos: s.inventarioArtefactos || [],
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

    // Cargar datos con listeners en tiempo real
    useEffect(() => {
        const isFirebase = window.DatabaseService.isFirebaseConnected();
        console.log('Firebase conectado:', isFirebase);

        // Timeout de seguridad: si en 10 segundos no carga, usar datos locales
        const safetyTimeout = setTimeout(() => {
            if (loading) {
                console.warn('Timeout de carga. Usando datos locales.');
                const defaults = window.DEFAULT_STUDENTS_3B || [];
                if (defaults.length > 0) setStudents(defaults);
                dataLoadedRef.current.students = true;
                dataLoadedRef.current.activities = true;
                setLoading(false);
            }
        }, 10000);

        if (isFirebase) {
            // ---- MODO FIREBASE: listeners en tiempo real ----
            // Estudiantes
            window.DatabaseService.load('students', (data) => {
                const arr = toArray(data);
                const defaults = window.DEFAULT_STUDENTS_3B || [];

                // Verificar si Firebase tiene los datos correctos del III-B
                const hasValidData = arr.length >= defaults.length &&
                    arr.some(s => s.password && s.password.endsWith('2026'));

                if (arr.length > 0 && hasValidData) {
                    syncingRef.current.students = true;
                    setStudents(arr.map(normalizeStudent));
                    setTimeout(() => { syncingRef.current.students = false; }, 800);
                } else if (!dataLoadedRef.current.students) {
                    // Firebase vacio o con datos incorrectos: subir los 35 estudiantes
                    if (defaults.length > 0) {
                        console.log('Sincronizando ' + defaults.length + ' estudiantes a Firebase...');
                        setStudents(defaults);
                        window.DatabaseService.save('students', defaults)
                            .then(() => console.log('Estudiantes guardados en Firebase'))
                            .catch(err => console.error('Error guardando estudiantes:', err));
                    }
                }
                dataLoadedRef.current.students = true;
                clearTimeout(safetyTimeout);
                checkAllLoaded();
            });

            // Actividades
            window.DatabaseService.load('activities', (data) => {
                const arr = toArray(data);
                syncingRef.current.activities = true;
                setActivities(arr);
                setTimeout(() => { syncingRef.current.activities = false; }, 800);
                dataLoadedRef.current.activities = true;
                checkAllLoaded();
            });

            // Posicion actual
            window.DatabaseService.load('position', (data) => {
                if (data) {
                    if (data.unidad) setCurrentUnidad(data.unidad);
                    if (data.clase) setCurrentClase(data.clase);
                }
                dataLoadedRef.current.position = true;
            });

            // Unidades personalizadas
            window.DatabaseService.load('unidades', (data) => {
                const arr = toArray(data);
                if (arr.length > 0) {
                    syncingRef.current.unidades = true;
                    setUnidades(arr);
                    setTimeout(() => { syncingRef.current.unidades = false; }, 800);
                }
                dataLoadedRef.current.unidades = true;
            });
        } else {
            // ---- MODO OFFLINE: localStorage ----
            clearTimeout(safetyTimeout);
            const loadOffline = async () => {
                try {
                    const savedStudents = await window.DatabaseService.loadOnce('students');
                    const arr = toArray(savedStudents);
                    if (arr.length > 0) {
                        setStudents(arr.map(normalizeStudent));
                    } else {
                        const defaults = window.DEFAULT_STUDENTS_3B || [];
                        if (defaults.length > 0) setStudents(defaults);
                    }

                    const savedActs = await window.DatabaseService.loadOnce('activities');
                    const actsArr = toArray(savedActs);
                    if (actsArr.length > 0) setActivities(actsArr);

                    const savedPos = await window.DatabaseService.loadOnce('position');
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
    }, []);

    // Guardar datos cuando cambien (solo si ya fueron cargados Y no viene de Firebase sync)
    useEffect(() => {
        if (!loading && dataLoadedRef.current.students && !syncingRef.current.students && students.length > 0) {
            console.log('Guardando ' + students.length + ' estudiantes en Firebase...');
            window.DatabaseService.save('students', students)
                .then(() => console.log('Estudiantes guardados OK'))
                .catch(err => console.error('ERROR guardando estudiantes:', err));
        }
    }, [students, loading]);

    useEffect(() => {
        if (!loading && dataLoadedRef.current.activities && !syncingRef.current.activities) {
            console.log('Guardando ' + activities.length + ' actividades en Firebase...');
            window.DatabaseService.save('activities', activities)
                .then(() => console.log('Actividades guardadas OK'))
                .catch(err => console.error('ERROR guardando actividades:', err));
        }
    }, [activities, loading]);

    useEffect(() => {
        if (!loading && dataLoadedRef.current.unidades && !syncingRef.current.unidades && unidades.length > 0) {
            window.DatabaseService.save('unidades', unidades)
                .catch(err => console.error('ERROR guardando unidades:', err));
        }
    }, [unidades, loading]);

    useEffect(() => {
        if (!loading && dataLoadedRef.current.position) {
            window.DatabaseService.save('position', { unidad: currentUnidad, clase: currentClase })
                .catch(err => console.error('ERROR guardando posicion:', err));
        }
    }, [currentUnidad, currentClase, loading]);

    // Login
    const handleLogin = (type, username, password) => {
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
        const dataStr = JSON.stringify({ students, activities, unidades, position: { unidad: currentUnidad, clase: currentClase } }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'filosofo_backup_' + new Date().toISOString().split('T')[0] + '.json';
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
                    alert('Datos importados correctamente. Se cargaron ' + (data.students ? data.students.length : 0) + ' estudiantes y ' + (data.activities ? data.activities.length : 0) + ' actividades.');
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
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-6xl mb-4 animate-pulse">🎓</div>
                    <h1 className="text-3xl font-bold mb-2">Cargando...</h1>
                    <p className="text-purple-200">Preparando el sistema gamificado</p>
                </div>
            </div>
        );
    }

    // Login screen
    if (!currentUser) {
        return <window.LoginScreen onLogin={handleLogin} />;
    }

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
            />
        );
    }

    return null;
};
