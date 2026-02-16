// Componente principal de la aplicación
window.FilosofoApp = () => {
    const { useState, useEffect } = React;

    const [currentUser, setCurrentUser] = useState(null);
    const [loginType, setLoginType] = useState(null);
    const [students, setStudents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [unidades, setUnidades] = useState(window.UNIDADES_DEFAULT);
    const [currentUnidad, setCurrentUnidad] = useState('U1');
    const [currentClase, setCurrentClase] = useState(1);
    const [loading, setLoading] = useState(true);

    // Cargar datos al iniciar
    useEffect(() => {
        const loadData = async () => {
            try {
                // Intentar cargar estudiantes
                const savedStudents = await window.DatabaseService.loadOnce('students');
                if (savedStudents) {
                    // Convertir de objeto Firebase a array si es necesario
                    const studentsArray = Array.isArray(savedStudents)
                        ? savedStudents.filter(Boolean)
                        : Object.values(savedStudents);
                    // Asegurar que cada estudiante tenga vocabularioDescubierto
                    const normalized = studentsArray.map(s => ({
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

                // Intentar cargar actividades
                const savedActivities = await window.DatabaseService.loadOnce('activities');
                if (savedActivities) {
                    const activitiesArray = Array.isArray(savedActivities)
                        ? savedActivities.filter(Boolean)
                        : Object.values(savedActivities);
                    setActivities(activitiesArray);
                }

                // Intentar cargar unidades personalizadas
                const savedUnidades = await window.DatabaseService.loadOnce('unidades');
                if (savedUnidades) {
                    const unidadesArray = Array.isArray(savedUnidades)
                        ? savedUnidades.filter(Boolean)
                        : Object.values(savedUnidades);
                    if (unidadesArray.length > 0) {
                        setUnidades(unidadesArray);
                    }
                }

                // Cargar posición actual
                const savedPosition = await window.DatabaseService.loadOnce('position');
                if (savedPosition) {
                    if (savedPosition.unidad) setCurrentUnidad(savedPosition.unidad);
                    if (savedPosition.clase) setCurrentClase(savedPosition.clase);
                }
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
            setLoading(false);
        };

        loadData();
    }, []);

    // Guardar datos cuando cambien
    useEffect(() => {
        if (!loading && students.length > 0) {
            window.DatabaseService.save('students', students);
        }
    }, [students]);

    useEffect(() => {
        if (!loading && activities.length > 0) {
            window.DatabaseService.save('activities', activities);
        }
    }, [activities]);

    useEffect(() => {
        if (!loading) {
            window.DatabaseService.save('unidades', unidades);
        }
    }, [unidades]);

    useEffect(() => {
        if (!loading) {
            window.DatabaseService.save('position', { unidad: currentUnidad, clase: currentClase });
        }
    }, [currentUnidad, currentClase]);

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
