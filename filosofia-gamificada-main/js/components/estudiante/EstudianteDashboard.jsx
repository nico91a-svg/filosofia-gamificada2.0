// Dashboard del Estudiante - Vista gamificada completa
// Con: Leaderboard, Avatar Evolutivo, Mapa de Aventura, Intercambio de Artefactos
window.EstudianteDashboard = ({ currentUser, students, activities, unidades, currentUnidad, currentClase, onLogout, setStudents }) => {
    const { useState } = React;
    const [activeTab, setActiveTab] = useState('perfil');
    const [expandedUnidades, setExpandedUnidades] = useState({});
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [selectedTradeArt, setSelectedTradeArt] = useState(null);
    const [tradeTarget, setTradeTarget] = useState('');
    const [showUseConfirm, setShowUseConfirm] = useState(false);
    const [selectedUseArt, setSelectedUseArt] = useState(null);
    const [showOpenChest, setShowOpenChest] = useState(false);
    const [chestOpening, setChestOpening] = useState(null);
    const [chestResult, setChestResult] = useState(null);
    const [chestAnimating, setChestAnimating] = useState(false);

    // ---- Datos derivados ----
    const nivel = window.getNivel(currentUser.xp || 0);
    const xpEnNivel = (currentUser.xp || 0) - nivel.xp_min;
    const xpParaSiguiente = nivel.xp_max - nivel.xp_min;
    const xpProgress = Math.min((xpEnNivel / xpParaSiguiente) * 100, 100);

    const clase = window.CLASES_FILOSOFICAS.find(c => c.id === currentUser.clase) || window.CLASES_FILOSOFICAS[0];
    const unidadesData = unidades || window.UNIDADES_DEFAULT;
    const vocabDescubierto = currentUser.vocabularioDescubierto || [];

    // Ranking
    const sortedStudents = [...(students || [])].sort((a, b) => (b.xp || 0) - (a.xp || 0));
    const rankPosition = sortedStudents.findIndex(s => s.id === currentUser.id) + 1;
    const totalStudents = sortedStudents.length;

    // Actividades del estudiante (compatible con ambos formatos de campo)
    const myActivities = (activities || []).filter(a =>
        a.studentId === currentUser.id || a.estudianteId === currentUser.id
    ).sort((a, b) => {
        var da = a.date ? new Date(a.date) : a.fecha ? new Date(a.fecha) : new Date(0);
        var db = b.date ? new Date(b.date) : b.fecha ? new Date(b.fecha) : new Date(0);
        return db - da;
    });

    const totalXpActividades = myActivities.reduce((sum, a) => sum + (a.xp || 0), 0);

    // Toggle collapsible
    const toggleUnidad = (uid) => {
        setExpandedUnidades(prev => ({ ...prev, [uid]: !prev[uid] }));
    };

    // ---- Avatar evolutivo (sensible al genero) ----
    const genero = currentUser.genero || 'no-binario';

    const getAvatar = (nivelNum, generoOverride) => {
        var g = generoOverride || genero;
        // Avatares por genero: femenino, masculino, no-binario
        var avataresFemenino = [
            { nivel: 1, emoji: '👧', titulo: 'Aprendiz Curiosa', accesorio: 'Toga sencilla', bg: 'from-gray-600 to-gray-700' },
            { nivel: 2, emoji: '👩‍🎓', titulo: 'Estudiante Pensadora', accesorio: 'Toga + Pergamino', bg: 'from-blue-600 to-blue-700' },
            { nivel: 3, emoji: '👩‍🏫', titulo: 'Discipula Reflexiva', accesorio: 'Toga + Libro abierto', bg: 'from-indigo-600 to-indigo-700' },
            { nivel: 4, emoji: '🧐', titulo: 'Buscadora de Verdad', accesorio: 'Toga + Lupa dorada', bg: 'from-purple-600 to-purple-700' },
            { nivel: 5, emoji: '🦉', titulo: 'Sabia en Formacion', accesorio: 'Toga + Buho de Atenea', bg: 'from-violet-600 to-violet-700' },
            { nivel: 6, emoji: '⚗️', titulo: 'Alquimista de Ideas', accesorio: 'Toga + Alambique mistico', bg: 'from-fuchsia-600 to-fuchsia-700' },
            { nivel: 7, emoji: '🏛️', titulo: 'Guardiana del Liceo', accesorio: 'Toga dorada + Columnas', bg: 'from-amber-600 to-amber-700' },
            { nivel: 8, emoji: '🔮', titulo: 'Oracula del Saber', accesorio: 'Toga purpura + Orbe', bg: 'from-pink-600 to-pink-700' },
            { nivel: 9, emoji: '👑', titulo: 'Maestra Filosofa', accesorio: 'Corona de laurel + Cetro', bg: 'from-yellow-600 to-yellow-700' },
            { nivel: 10, emoji: '🌟', titulo: 'Filosofa Legendaria', accesorio: 'Aura dorada + Estrella', bg: 'from-yellow-500 to-amber-500' }
        ];
        var avataresMasculino = [
            { nivel: 1, emoji: '👦', titulo: 'Aprendiz Curioso', accesorio: 'Toga sencilla', bg: 'from-gray-600 to-gray-700' },
            { nivel: 2, emoji: '👨‍🎓', titulo: 'Estudiante Pensador', accesorio: 'Toga + Pergamino', bg: 'from-blue-600 to-blue-700' },
            { nivel: 3, emoji: '👨‍🏫', titulo: 'Discipulo Reflexivo', accesorio: 'Toga + Libro abierto', bg: 'from-indigo-600 to-indigo-700' },
            { nivel: 4, emoji: '🤓', titulo: 'Buscador de Verdad', accesorio: 'Toga + Lupa dorada', bg: 'from-purple-600 to-purple-700' },
            { nivel: 5, emoji: '🦉', titulo: 'Sabio en Formacion', accesorio: 'Toga + Buho de Atenea', bg: 'from-violet-600 to-violet-700' },
            { nivel: 6, emoji: '⚗️', titulo: 'Alquimista de Ideas', accesorio: 'Toga + Alambique mistico', bg: 'from-fuchsia-600 to-fuchsia-700' },
            { nivel: 7, emoji: '🏛️', titulo: 'Guardian del Liceo', accesorio: 'Toga dorada + Columnas', bg: 'from-amber-600 to-amber-700' },
            { nivel: 8, emoji: '🔮', titulo: 'Oraculo del Saber', accesorio: 'Toga purpura + Orbe', bg: 'from-pink-600 to-pink-700' },
            { nivel: 9, emoji: '👑', titulo: 'Maestro Filosofo', accesorio: 'Corona de laurel + Cetro', bg: 'from-yellow-600 to-yellow-700' },
            { nivel: 10, emoji: '🌟', titulo: 'Filosofo Legendario', accesorio: 'Aura dorada + Estrella', bg: 'from-yellow-500 to-amber-500' }
        ];
        var avataresNeutro = [
            { nivel: 1, emoji: '🧒', titulo: 'Aprendiz Curiose', accesorio: 'Toga sencilla', bg: 'from-gray-600 to-gray-700' },
            { nivel: 2, emoji: '🧑‍🎓', titulo: 'Estudiante Pensadore', accesorio: 'Toga + Pergamino', bg: 'from-blue-600 to-blue-700' },
            { nivel: 3, emoji: '🧑‍🏫', titulo: 'Discipule Reflexive', accesorio: 'Toga + Libro abierto', bg: 'from-indigo-600 to-indigo-700' },
            { nivel: 4, emoji: '🧐', titulo: 'Buscadore de Verdad', accesorio: 'Toga + Lupa dorada', bg: 'from-purple-600 to-purple-700' },
            { nivel: 5, emoji: '🦉', titulo: 'Sabie en Formacion', accesorio: 'Toga + Buho de Atenea', bg: 'from-violet-600 to-violet-700' },
            { nivel: 6, emoji: '⚗️', titulo: 'Alquimista de Ideas', accesorio: 'Toga + Alambique mistico', bg: 'from-fuchsia-600 to-fuchsia-700' },
            { nivel: 7, emoji: '🏛️', titulo: 'Guardiane del Liceo', accesorio: 'Toga dorada + Columnas', bg: 'from-amber-600 to-amber-700' },
            { nivel: 8, emoji: '🔮', titulo: 'Oracule del Saber', accesorio: 'Toga purpura + Orbe', bg: 'from-pink-600 to-pink-700' },
            { nivel: 9, emoji: '👑', titulo: 'Maestre Filosofe', accesorio: 'Corona de laurel + Cetro', bg: 'from-yellow-600 to-yellow-700' },
            { nivel: 10, emoji: '🌟', titulo: 'Filosofe Legendarie', accesorio: 'Aura dorada + Estrella', bg: 'from-yellow-500 to-amber-500' }
        ];

        var avatares = g === 'femenino' ? avataresFemenino :
                       g === 'masculino' ? avataresMasculino : avataresNeutro;
        return avatares.find(a => a.nivel === nivelNum) || avatares[0];
    };

    const avatar = getAvatar(nivel.nivel);

    // ---- Contar cofres pendientes ----
    const pendingChests = (currentUser.artefactos || []).filter(
        a => typeof a === 'object' && a.id && a.id.startsWith('cofre_')
    ).length;

    // ---- Tabs config ----
    const tabs = [
        { id: 'perfil', label: 'Mi Perfil', emoji: '👤' },
        { id: 'mapa', label: 'Aventura', emoji: '🗺️' },
        { id: 'ranking', label: 'Ranking', emoji: '🏆' },
        { id: 'vocabulario', label: 'Vocabulario', emoji: '📚' },
        { id: 'actividades', label: 'Actividades', emoji: '⚡' },
        { id: 'artefactos', label: pendingChests > 0 ? 'Artefactos (' + pendingChests + ')' : 'Artefactos', emoji: pendingChests > 0 ? '📦' : '🏺', badge: pendingChests }
    ];

    // ---- Helpers ----
    const renderStars = (nivel) => {
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= nivel ? 'text-yellow-400' : 'text-gray-300'}>
                    {i <= nivel ? '\u2605' : '\u2606'}
                </span>
            );
        }
        return stars;
    };

    const getActividadTipo = (tipoId) => {
        return window.TIPOS_ACTIVIDAD.find(t => t.id === tipoId) || { nombre: tipoId, icon: '📋' };
    };

    // ---- Progreso global del curso ----
    const cursoUnidadObj = unidadesData.find(u => u.id === currentUnidad) || unidadesData[0];
    const cursoClaseObj = cursoUnidadObj ? cursoUnidadObj.clases.find(c => c.num === currentClase) : null;
    const totalClasesCurso = unidadesData.reduce((sum, u) => sum + u.clases.length, 0);
    const clasesAvanzadas = (function() {
        var count = 0;
        var unidadIdx = unidadesData.findIndex(u => u.id === currentUnidad);
        for (var i = 0; i < unidadIdx; i++) {
            count += unidadesData[i].clases.length;
        }
        count += (currentClase || 1);
        return count;
    })();
    const progresoCurso = totalClasesCurso > 0 ? Math.round((clasesAvanzadas / totalClasesCurso) * 100) : 0;

    // ---- Misiones de clase (del sistema de misiones aleatorias) ----
    const misionesDeClase = window.getMisionesDeClase ? window.getMisionesDeClase(currentUnidad, currentClase) : [];
    const misionesCompletadasData = currentUser.misionesCompletadas || {};

    const misiones = misionesDeClase.map(function(mDef) {
        var claveClase = currentUnidad + '_C' + currentClase;
        var completadaManual = misionesCompletadasData[claveClase] && misionesCompletadasData[claveClase][mDef.id];
        var completadaAuto = false;
        if (mDef.verificacion === 'auto' && mDef.autoCheck) {
            completadaAuto = mDef.autoCheck(currentUser.id, activities || [], currentClase, currentUnidad, currentUser);
        }
        var completada = completadaManual || completadaAuto;
        return {
            id: mDef.id,
            emoji: mDef.emoji,
            nombre: mDef.nombre,
            descripcion: mDef.descripcion,
            tipo: mDef.tipo,
            recompensa: '+' + mDef.recompensa.xp + ' XP',
            progreso: completada ? 1 : 0,
            meta: 1,
            verificacion: mDef.verificacion
        };
    });
    const misionesCompletadas = misiones.filter(m => m.progreso >= m.meta).length;

    // ---- Intercambio de artefactos ----
    const handleTrade = () => {
        if (!selectedTradeArt || !tradeTarget || !setStudents) return;
        var targetId = Number(tradeTarget);
        var fromStudent = students.find(s => s.id === currentUser.id);
        if (!fromStudent) return;
        var artIdx = selectedTradeArt;
        var inventario = fromStudent.artefactos || [];
        if (!inventario[artIdx] || inventario[artIdx].usado) return;
        var artefacto = inventario[artIdx];

        setStudents(prev => prev.map(s => {
            if (s.id === currentUser.id) {
                var newArts = s.artefactos.filter((_, i) => i !== artIdx);
                return { ...s, artefactos: newArts };
            }
            if (s.id === targetId) {
                var newArts2 = (s.artefactos || []).concat([{
                    id: artefacto.id,
                    obtenido: new Date().toISOString(),
                    usado: false,
                    regaladoPor: currentUser.id
                }]);
                return { ...s, artefactos: newArts2 };
            }
            return s;
        }));
        setShowTradeModal(false);
        setSelectedTradeArt(null);
        setTradeTarget('');
    };

    // ---- Usar artefacto ----
    const handleUseArtefacto = () => {
        if (selectedUseArt === null || !setStudents) return;
        setStudents(prev => prev.map(s => {
            if (s.id !== currentUser.id) return s;
            var arts = (s.artefactos || []).map((art, i) => {
                if (i === selectedUseArt && !art.usado) {
                    return { ...art, usado: true, fechaUso: new Date().toISOString() };
                }
                return art;
            });
            return { ...s, artefactos: arts };
        }));
        setShowUseConfirm(false);
        setSelectedUseArt(null);
    };

    // ---- Abrir cofre ----
    const handleOpenChest = (cofreIdx, cofreTipo) => {
        setChestAnimating(true);
        setChestOpening({ idx: cofreIdx, tipo: cofreTipo });
        setShowOpenChest(true);
        setTimeout(() => {
            var resultado = window.abrirCofre(cofreTipo);
            if (resultado && setStudents) {
                setStudents(prev => prev.map(s => {
                    if (s.id !== currentUser.id) return s;
                    var arts = (s.artefactos || []).map((art, i) => {
                        if (i === cofreIdx) {
                            return { id: resultado.id, obtenido: new Date().toISOString(), usado: false, deCofre: cofreTipo };
                        }
                        return art;
                    });
                    return { ...s, artefactos: arts };
                }));
            }
            setChestResult(resultado);
            setChestAnimating(false);
        }, 2000);
    };

    // ============================================================
    // TAB: MI PERFIL (con Avatar Evolutivo)
    // ============================================================
    const renderPerfil = () => (
        <div className="space-y-6">
            {/* Progreso Global del Curso */}
            {cursoUnidadObj && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-cyan-400/30">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{cursoUnidadObj.emoji}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-cyan-300 text-xs font-semibold">CLASE ACTUAL DEL CURSO</p>
                            <p className="text-white font-bold text-sm truncate">{cursoUnidadObj.id} - Clase {currentClase}: {cursoClaseObj ? cursoClaseObj.titulo : ''}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-cyan-400 font-bold text-lg">{progresoCurso}%</p>
                            <p className="text-purple-300 text-xs">del curso</p>
                        </div>
                    </div>
                    <div className="w-full bg-purple-900/50 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-700"
                            style={{ width: progresoCurso + '%' }}></div>
                    </div>
                </div>
            )}

            {/* Misiones de Clase */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="text-xl">🎯</span> Misiones de Clase
                    </h3>
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                        {misionesCompletadas}/{misiones.length} completadas
                    </span>
                </div>
                <div className="space-y-3">
                    {misiones.map(mision => {
                        var completada = mision.progreso >= mision.meta;
                        var esEntreClases = mision.tipo === 'entre-clases';
                        return (
                            <div key={mision.id}
                                className={`rounded-xl p-3 border transition-all ${
                                    completada
                                        ? 'bg-green-500/15 border-green-400/30'
                                        : esEntreClases
                                            ? 'bg-orange-500/10 border-orange-400/20'
                                            : 'bg-white/5 border-white/10'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{completada ? '✅' : mision.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className={`font-semibold text-sm ${completada ? 'text-green-400' : 'text-white'}`}>
                                                {mision.nombre}
                                            </p>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                                esEntreClases
                                                    ? 'bg-orange-500/20 text-orange-300'
                                                    : 'bg-blue-500/20 text-blue-300'
                                            }`}>
                                                {esEntreClases ? '📋 Entre clases' : '🏫 En clase'}
                                            </span>
                                        </div>
                                        <p className="text-purple-300 text-xs">{mision.descripcion}</p>
                                        {mision.verificacion === 'manual' && !completada && (
                                            <p className="text-orange-300/70 text-xs mt-1 italic">El profesor verificara tu avance</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        {completada ? (
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-lg font-bold">Lograda</span>
                                        ) : (
                                            <span className="bg-white/10 text-purple-300 text-xs px-2 py-1 rounded-lg">{mision.recompensa}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Avatar Card */}
            <div className={`bg-gradient-to-br ${avatar.bg} rounded-2xl p-6 text-center border border-white/20 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/5"></div>
                <div className="relative">
                    <div className="text-7xl mb-2 drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
                        {avatar.emoji}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">{currentUser.nombreSocial || currentUser.nombre}</h2>
                    <p className="text-white/80 text-sm font-semibold">{avatar.titulo}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold ${clase.color}`}>
                            {clase.emoji} {clase.nombre}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-semibold">
                            {avatar.accesorio}
                        </span>
                    </div>
                </div>
            </div>

            {/* Evolucion del Avatar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                <h3 className="text-white font-bold mb-3 text-center">Evolucion del Avatar</h3>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => {
                        var av = getAvatar(n);
                        var isReached = nivel.nivel >= n;
                        var isCurrent = nivel.nivel === n;
                        return (
                            <div key={n} className={`flex flex-col items-center min-w-[60px] p-2 rounded-xl transition-all ${
                                isCurrent ? 'bg-yellow-500/30 ring-2 ring-yellow-400' :
                                isReached ? 'bg-white/10' : 'opacity-30'
                            }`}>
                                <span className={`text-2xl ${!isReached ? 'grayscale' : ''}`}>{isReached ? av.emoji : '🔒'}</span>
                                <span className="text-white text-xs font-bold mt-1">Nv.{n}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Nivel y XP */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <span className="text-purple-200 text-sm">Nivel {nivel.nivel}</span>
                        <h3 className="text-xl font-bold text-white">{nivel.titulo}</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-yellow-400">{currentUser.xp || 0}</span>
                        <span className="text-purple-200 text-sm block">XP Total</span>
                    </div>
                </div>
                <div className="w-full bg-purple-900/50 rounded-full h-4 mb-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: xpProgress + '%' }}></div>
                </div>
                <p className="text-purple-300 text-sm text-center">
                    {nivel.nivel < 10 ? (nivel.xp_max - (currentUser.xp || 0)) + ' XP para siguiente nivel' : 'Nivel maximo alcanzado!'}
                </p>
            </div>

            {/* Radar de habilidades */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 text-center">Perfil de Habilidades</h3>
                <window.RadarChart student={currentUser} darkMode={true} />
            </div>

            {/* Grid de habilidades */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Habilidades Filosoficas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {window.HABILIDADES.map(hab => {
                        var pts = (currentUser.habilidades || {})[hab.id] || 0;
                        var habNivel = window.getHabilidadNivel(pts);
                        var habNivelInfo = window.HABILIDAD_NIVELES.find(n => n.nivel === habNivel);
                        return (
                            <div key={hab.id} className="bg-white/10 rounded-xl p-3 text-center">
                                <div className="text-2xl mb-1">{hab.emoji}</div>
                                <p className="text-white text-sm font-semibold">{hab.shortName}</p>
                                <div className="flex justify-center gap-0.5 my-1">
                                    {renderStars(habNivel)}
                                </div>
                                <p className="text-purple-300 text-xs">{habNivelInfo ? habNivelInfo.nombre : ''}</p>
                                <p className="text-purple-400 text-xs">{pts} pts</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Badges */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Insignias Obtenidas</h3>
                {(currentUser.badges || []).length === 0 ? (
                    <p className="text-purple-300 text-center text-sm">Aun no tienes insignias. Sigue participando para ganarlas.</p>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {(currentUser.badges || []).map(bid => {
                            var badge = window.BADGES.find(b => b.id === bid);
                            if (!badge) return null;
                            return (
                                <div key={bid} className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3 text-center">
                                    <div className="text-3xl mb-1">{badge.icon}</div>
                                    <p className="text-white text-xs font-semibold">{badge.nombre}</p>
                                    <p className="text-purple-300 text-xs mt-1">{badge.descripcion}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    // ============================================================
    // TAB: MAPA DE AVENTURA
    // ============================================================
    const renderMapa = () => {
        // Usar TODAS las actividades del curso para determinar progreso global
        var allActivities = activities || [];

        // Determinar la unidad actual basada en currentUnidad (posicion global del profesor)
        var globalUnidadIdx = unidadesData.findIndex(u => u.id === currentUnidad);
        if (globalUnidadIdx < 0) globalUnidadIdx = 0;

        // Colores de terreno por unidad
        var terrenos = [
            { bg: 'from-blue-800 to-indigo-900', path: 'bg-blue-400', icon: '🏛️', terrain: 'El Agora Inicial' },
            { bg: 'from-purple-800 to-pink-900', path: 'bg-purple-400', icon: '🏔️', terrain: 'Monte Ontologico' },
            { bg: 'from-green-800 to-teal-900', path: 'bg-green-400', icon: '🏛️', terrain: 'Templo del Conocimiento' },
            { bg: 'from-orange-800 to-red-900', path: 'bg-orange-400', icon: '🌋', terrain: 'Volcan de la Praxis' }
        ];

        return (
            <div className="space-y-4">
                {/* Titulo del mapa */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <h3 className="text-xl font-bold text-white">El Camino del Filosofo</h3>
                    <p className="text-purple-300 text-sm">Tu viaje a traves del saber filosofico</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="text-2xl">{avatar.emoji}</span>
                        <span className="text-white font-semibold">{avatar.titulo}</span>
                    </div>
                </div>

                {/* Mapa por unidades */}
                {unidadesData.map((unidad, idx) => {
                    var terreno = terrenos[idx] || terrenos[0];
                    // Clases alcanzadas: usar posicion global del profesor
                    var clasesAlcanzadas = 0;
                    if (idx < globalUnidadIdx) {
                        // Unidad pasada: todas las clases alcanzadas
                        clasesAlcanzadas = unidad.clases.length;
                    } else if (idx === globalUnidadIdx) {
                        // Unidad actual: hasta currentClase
                        clasesAlcanzadas = currentClase || 1;
                    }
                    // Clases donde YO participe (para destacar)
                    var misClasesConActividad = unidad.clases.filter(c =>
                        myActivities.some(a => a.unidadId === unidad.id && a.claseNum === c.num)
                    ).length;
                    var progClases = unidad.clases.length > 0 ? Math.round((clasesAlcanzadas / unidad.clases.length) * 100) : 0;
                    var isPast = idx < globalUnidadIdx;
                    var isCurrent = idx === globalUnidadIdx;
                    var isFuture = idx > globalUnidadIdx;

                    var vocabTotal = (unidad.vocabulario || []).length;
                    var vocabFound = vocabTotal > 0 ? (unidad.vocabulario || []).filter(v => vocabDescubierto.includes(v.termino)).length : 0;

                    return (
                        <div key={unidad.id}
                            className={`bg-gradient-to-br ${terreno.bg} rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${
                                isCurrent ? 'border-yellow-400 ring-2 ring-yellow-400/30 shadow-lg shadow-yellow-500/20' :
                                isPast ? 'border-green-400/50' : 'border-gray-600/30 opacity-60'
                            }`}>
                            {/* Decoracion de fondo */}
                            <div className="absolute top-2 right-2 text-6xl opacity-10">{terreno.icon}</div>

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4 relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                                    isPast ? 'bg-green-500' : isCurrent ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'
                                }`}>
                                    {isPast ? '✅' : isCurrent ? avatar.emoji : '🔒'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{unidad.emoji}</span>
                                        <h4 className="text-white font-bold">{unidad.nombre}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-white/60 text-xs">{terreno.terrain}</span>
                                        {isCurrent && (
                                            <span className="bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">ESTAS AQUI</span>
                                        )}
                                        {isPast && (
                                            <span className="bg-green-500/30 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">COMPLETADO</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Camino de clases (nodos) - scroll horizontal en mobile */}
                            <div className="flex items-center gap-0.5 sm:gap-1 mb-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                                {unidad.clases.map((cl, ci) => {
                                    var claseAlcanzada = cl.num <= clasesAlcanzadas;
                                    var participoYo = myActivities.some(a => a.unidadId === unidad.id && a.claseNum === cl.num);
                                    var esClaseActual = isCurrent && cl.num === (currentClase || 1);
                                    return (
                                        <React.Fragment key={ci}>
                                            <div className={`flex flex-col items-center min-w-[40px] sm:min-w-[52px] transition-all`}
                                                title={cl.titulo}>
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg border-2 transition-all ${
                                                    participoYo ? `${terreno.path} border-white text-white shadow-lg` :
                                                    claseAlcanzada ? `${terreno.path}/60 border-white/50 text-white/70` :
                                                    esClaseActual ? 'bg-yellow-500/30 border-yellow-400 animate-pulse' :
                                                    'bg-gray-700/50 border-gray-600 opacity-50'
                                                }`}>
                                                    {participoYo ? cl.emoji : claseAlcanzada ? '✓' : esClaseActual ? '👣' : (ci + 1)}
                                                </div>
                                                <span className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-center leading-tight max-w-[40px] sm:max-w-[52px] ${
                                                    participoYo ? 'text-white' : claseAlcanzada ? 'text-white/60' : 'text-gray-400'
                                                }`}>
                                                    {claseAlcanzada || participoYo ? cl.titulo.split(' ').slice(0, 2).join(' ') : 'C' + cl.num}
                                                </span>
                                                {claseAlcanzada && !participoYo && (
                                                    <span className="text-[8px] text-yellow-300/70 mt-0.5">sin actividad</span>
                                                )}
                                            </div>
                                            {ci < unidad.clases.length - 1 && (
                                                <div className={`w-2 sm:w-4 h-0.5 mt-[-12px] sm:mt-[-16px] shrink-0 ${claseAlcanzada || participoYo ? terreno.path : 'bg-gray-600'}`}></div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* Barra de progreso */}
                            <div className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white/70">Progreso</span>
                                    <span className="text-white font-bold">{clasesAlcanzadas}/{unidad.clases.length} clases</span>
                                    {misClasesConActividad > 0 && misClasesConActividad < clasesAlcanzadas && (
                                        <span className="text-yellow-300 text-xs">(participaste en {misClasesConActividad})</span>
                                    )}
                                </div>
                                <div className="w-full bg-black/30 rounded-full h-3">
                                    <div className={`${terreno.path} h-3 rounded-full transition-all duration-700`}
                                        style={{ width: progClases + '%' }}></div>
                                </div>
                            </div>

                            {/* Vocabulario */}
                            {vocabTotal > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-sm">📚</span>
                                    <span className="text-white/70 text-xs">Vocabulario: {vocabFound}/{vocabTotal}</span>
                                    <div className="flex-1 bg-black/30 rounded-full h-2">
                                        <div className="bg-cyan-400 h-2 rounded-full transition-all"
                                            style={{ width: (vocabFound / vocabTotal * 100) + '%' }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Evaluacion */}
                            {unidad.evaluacionSumativa && (
                                <div className="flex items-center gap-2 mt-3 bg-black/20 rounded-lg p-2">
                                    <span className="text-lg">🎯</span>
                                    <div className="flex-1">
                                        <p className="text-white text-xs font-semibold">{unidad.evaluacionSumativa.nombre}</p>
                                        <p className="text-white/50 text-xs">{unidad.evaluacionSumativa.descripcion}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // ============================================================
    // TAB: RANKING (Leaderboard Top 5)
    // ============================================================
    const renderRanking = () => {
        var top5 = sortedStudents.slice(0, 5);
        var medalEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        var medalBgs = [
            'from-yellow-500/30 to-amber-500/30 border-yellow-400/50',
            'from-gray-400/20 to-gray-500/20 border-gray-400/50',
            'from-orange-500/20 to-amber-600/20 border-orange-400/50',
            'from-white/5 to-white/10 border-white/20',
            'from-white/5 to-white/10 border-white/20'
        ];

        return (
            <div className="space-y-4">
                {/* Tu posicion */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                    <div className="text-5xl mb-2">🏆</div>
                    <h3 className="text-xl font-bold text-white">Tu Posicion</h3>
                    <div className="flex items-center justify-center gap-4 mt-3">
                        <div>
                            <p className="text-4xl font-bold text-yellow-400">#{rankPosition}</p>
                            <p className="text-purple-300 text-sm">de {totalStudents}</p>
                        </div>
                        <div className="h-12 w-px bg-white/20"></div>
                        <div>
                            <p className="text-4xl font-bold text-cyan-400">{currentUser.xp || 0}</p>
                            <p className="text-purple-300 text-sm">XP Total</p>
                        </div>
                        <div className="h-12 w-px bg-white/20"></div>
                        <div>
                            <p className="text-4xl">{avatar.emoji}</p>
                            <p className="text-purple-300 text-sm">Nv.{nivel.nivel}</p>
                        </div>
                    </div>
                </div>

                {/* Top 5 Leaderboard */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h3 className="text-white font-bold mb-4 text-center">Top 5 Filosofos</h3>
                    <div className="space-y-3">
                        {top5.map((student, idx) => {
                            var sNivel = window.getNivel(student.xp || 0);
                            var sAvatar = getAvatar(sNivel.nivel, student.genero);
                            var sClase = window.CLASES_FILOSOFICAS.find(c => c.id === student.clase);
                            var isMe = student.id === currentUser.id;
                            return (
                                <div key={student.id}
                                    className={`bg-gradient-to-r ${medalBgs[idx]} rounded-xl p-4 border-2 transition-all ${
                                        isMe ? 'ring-2 ring-yellow-400/50 shadow-lg' : ''
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{medalEmojis[idx]}</span>
                                        <span className="text-2xl">{sAvatar.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold text-sm truncate ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                                                    {student.nombreSocial || student.nombre} {isMe ? '(Tu)' : ''}
                                                </p>
                                                {sClase && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${sClase.color}`}>
                                                        {sClase.emoji}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white/60 text-xs">Nv.{sNivel.nivel} {sNivel.titulo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-yellow-400 font-bold text-lg">{student.xp || 0}</p>
                                            <p className="text-white/50 text-xs">XP</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Si no esta en top 5, mostrar su fila */}
                    {rankPosition > 5 && (
                        <div className="mt-4">
                            <div className="text-center text-white/30 my-2">• • •</div>
                            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl p-4 border-2 border-yellow-400/30 ring-2 ring-yellow-400/30">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-white/60">#{rankPosition}</span>
                                    <span className="text-2xl">{avatar.emoji}</span>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-yellow-400">{currentUser.nombreSocial || currentUser.nombre} (Tu)</p>
                                        <p className="text-white/60 text-xs">Nv.{nivel.nivel} {nivel.titulo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-yellow-400 font-bold text-lg">{currentUser.xp || 0}</p>
                                        <p className="text-white/50 text-xs">XP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats comparativos */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h3 className="text-white font-bold mb-3">Tu desempeno vs el curso</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-purple-300 text-xs">Tu XP</p>
                            <p className="text-xl font-bold text-yellow-400">{currentUser.xp || 0}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-purple-300 text-xs">Promedio curso</p>
                            <p className="text-xl font-bold text-cyan-400">
                                {totalStudents > 0 ? Math.round(sortedStudents.reduce((s, st) => s + (st.xp || 0), 0) / totalStudents) : 0}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-purple-300 text-xs">Tus actividades</p>
                            <p className="text-xl font-bold text-green-400">{myActivities.length}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-purple-300 text-xs">Tus insignias</p>
                            <p className="text-xl font-bold text-pink-400">{(currentUser.badges || []).length}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================
    // TAB: VOCABULARIO (sin cambios mayores)
    // ============================================================
    const renderVocabulario = () => {
        var totalTerminos = 0;
        var totalDescubiertos = 0;
        unidadesData.forEach(u => {
            totalTerminos += (u.vocabulario || []).length;
            totalDescubiertos += (u.vocabulario || []).filter(v => vocabDescubierto.includes(v.termino)).length;
        });

        return (
            <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
                    <div className="text-4xl mb-2">📚</div>
                    <h3 className="text-xl font-bold text-white">Lexico Filosofico</h3>
                    <p className="text-3xl font-bold text-cyan-400 mt-1">{totalDescubiertos}/{totalTerminos}</p>
                    <p className="text-purple-300 text-sm">terminos descubiertos</p>
                    <div className="w-full bg-purple-900/50 rounded-full h-3 mt-3 max-w-xs mx-auto">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all"
                            style={{ width: (totalTerminos > 0 ? (totalDescubiertos / totalTerminos) * 100 : 0) + '%' }}></div>
                    </div>
                </div>

                {unidadesData.map(unidad => {
                    var vocab = unidad.vocabulario || [];
                    if (vocab.length === 0) return null;
                    var found = vocab.filter(v => vocabDescubierto.includes(v.termino)).length;
                    var isOpen = expandedUnidades[unidad.id] !== false;

                    return (
                        <div key={unidad.id} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                            <button onClick={() => toggleUnidad(unidad.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{unidad.emoji}</span>
                                    <div className="text-left">
                                        <h4 className="text-white font-bold text-sm">{unidad.nombre}</h4>
                                        <span className="text-cyan-400 text-sm font-semibold">{found}/{vocab.length} descubierto</span>
                                    </div>
                                </div>
                                <span className={`text-white text-xl transition-transform ${isOpen ? 'rotate-90' : ''}`}>&#9654;</span>
                            </button>
                            {isOpen && (
                                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {vocab.map((v, vi) => {
                                        var discovered = vocabDescubierto.includes(v.termino);
                                        return (
                                            <div key={vi}
                                                className={`rounded-xl p-3 border transition-all ${
                                                    discovered
                                                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
                                                        : 'bg-gray-800/50 border-gray-600/30'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {discovered ? (
                                                        <span className="text-cyan-400 text-lg">💡</span>
                                                    ) : (
                                                        <window.Icons.Lock size={16} className="text-gray-500" />
                                                    )}
                                                    <span className={`font-bold text-sm ${discovered ? 'text-white' : 'text-gray-500'}`}>
                                                        {discovered ? v.termino : '???'}
                                                    </span>
                                                </div>
                                                <p className={`text-xs leading-relaxed ${discovered ? 'text-purple-200' : 'text-gray-600'}`}>
                                                    {discovered ? v.definicion : 'Termino no descubierto aun. Sigue explorando...'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // ============================================================
    // TAB: ACTIVIDADES
    // ============================================================
    const renderActividades = () => {
        var tipoCount = {};
        myActivities.forEach(a => { tipoCount[a.tipo] = (tipoCount[a.tipo] || 0) + 1; });

        var habPoints = currentUser.habilidades || {};
        var strongestHab = null;
        var maxPts = 0;
        window.HABILIDADES.forEach(h => {
            var pts = habPoints[h.id] || 0;
            if (pts > maxPts) { maxPts = pts; strongestHab = h; }
        });

        var maxTipoCount = 0;
        Object.values(tipoCount).forEach(c => { if (c > maxTipoCount) maxTipoCount = c; });

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                        <p className="text-2xl font-bold text-yellow-400">{myActivities.length}</p>
                        <p className="text-purple-300 text-xs">Actividades</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                        <p className="text-2xl font-bold text-green-400">{totalXpActividades}</p>
                        <p className="text-purple-300 text-xs">XP Ganado</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                        <p className="text-2xl">{strongestHab ? strongestHab.emoji : '---'}</p>
                        <p className="text-purple-300 text-xs">{strongestHab ? strongestHab.shortName : 'N/A'}</p>
                    </div>
                </div>

                {Object.keys(tipoCount).length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                        <h3 className="text-white font-bold mb-3">Actividades por Tipo</h3>
                        <div className="space-y-2">
                            {Object.entries(tipoCount).sort((a, b) => b[1] - a[1]).map(([tipo, count]) => {
                                var tipoInfo = getActividadTipo(tipo);
                                var pct = maxTipoCount > 0 ? (count / maxTipoCount) * 100 : 0;
                                return (
                                    <div key={tipo} className="flex items-center gap-2">
                                        <span className="text-lg w-8 text-center">{tipoInfo.icon}</span>
                                        <span className="text-purple-200 text-xs w-24 truncate">{tipoInfo.nombre}</span>
                                        <div className="flex-1 bg-purple-900/50 rounded-full h-5 relative">
                                            <div className="bg-gradient-to-r from-indigo-400 to-purple-500 h-5 rounded-full transition-all flex items-center justify-end pr-2"
                                                style={{ width: Math.max(pct, 10) + '%' }}>
                                                <span className="text-white text-xs font-bold">{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h3 className="text-white font-bold mb-3">Actividades Recientes</h3>
                    {myActivities.length === 0 ? (
                        <p className="text-purple-300 text-center text-sm">No tienes actividades registradas aun.</p>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {myActivities.slice(0, 20).map((act, i) => {
                                var tipoInfo = getActividadTipo(act.tipo);
                                var unidad = unidadesData.find(u => u.id === act.unidadId);
                                var habsGanadas = act.habilidades || (window.RUBRICS_HABILIDADES[act.tipo] || {});
                                return (
                                    <div key={i} className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{tipoInfo.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-semibold truncate">{tipoInfo.nombre}</p>
                                                <p className="text-purple-300 text-xs">
                                                    {unidad ? unidad.emoji + ' ' + unidad.nombre : ''}{(act.date || act.fecha) ? ' - ' + new Date(act.date || act.fecha).toLocaleDateString() : ''}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="bg-yellow-500/20 text-yellow-400 text-sm font-bold px-2 py-1 rounded-lg">
                                                    +{act.xp || 0} XP
                                                </span>
                                                <p className="text-purple-400 text-xs mt-1 capitalize">{act.nivel || ''}</p>
                                            </div>
                                        </div>
                                        {/* Habilidades ganadas */}
                                        {Object.keys(habsGanadas).length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2 ml-10">
                                                {Object.entries(habsGanadas).map(([habId, pts]) => {
                                                    var hab = window.HABILIDADES.find(h => h.id === habId);
                                                    if (!hab || pts <= 0) return null;
                                                    return (
                                                        <span key={habId} className="bg-white/10 text-purple-200 text-xs px-2 py-0.5 rounded-full">
                                                            {hab.emoji} +{pts}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {/* Comentario del profesor */}
                                        {act.comentario && (
                                            <div className="mt-2 ml-10 bg-blue-500/10 border border-blue-400/20 rounded-lg p-2.5">
                                                <p className="text-blue-300 text-xs font-semibold mb-0.5">💬 Comentario del profesor:</p>
                                                <p className="text-blue-200 text-xs leading-relaxed">{act.comentario}</p>
                                            </div>
                                        )}
                                        {/* Notas */}
                                        {act.notas && !act.comentario && (
                                            <p className="text-purple-400 text-xs mt-1.5 ml-10 italic">{act.notas}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ============================================================
    // TAB: ARTEFACTOS (con intercambio)
    // ============================================================
    const renderArtefactos = () => {
        var inventario = currentUser.artefactos || [];

        var items = inventario.map((item, idx) => {
            var artefactoId = typeof item === 'string' ? item : (item.id || item.artefactoId);
            var usado = typeof item === 'object' ? (item.usado || false) : false;
            var regaladoPor = typeof item === 'object' ? (item.regaladoPor || null) : null;
            // Cofres
            if (artefactoId && artefactoId.startsWith('cofre_')) {
                var tipoCofre = artefactoId.replace('cofre_', '');
                var cofreDef = window.COFRES ? window.COFRES[tipoCofre] : null;
                if (cofreDef) {
                    return { id: artefactoId, nombre: cofreDef.nombre, emoji: cofreDef.emoji, rareza: tipoCofre, efecto: 'Contiene un artefacto misterioso', esCofre: true, tipoCofre: tipoCofre, _idx: idx, _originalId: artefactoId };
                }
            }
            var artefacto = window.ARTEFACTOS.find(a => a.id === artefactoId);
            return artefacto ? { ...artefacto, usado, regaladoPor, _idx: idx, _originalId: artefactoId } : null;
        }).filter(Boolean);

        var cofres = items.filter(item => item.esCofre);
        var artefactosNormales = items.filter(item => !item.esCofre);

        var otherStudents = (students || []).filter(s => s.id !== currentUser.id);

        return (
            <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
                    <div className="text-4xl mb-2">🏺</div>
                    <h3 className="text-xl font-bold text-white">Inventario de Artefactos</h3>
                    <p className="text-purple-300 text-sm">{artefactosNormales.length} artefacto{artefactosNormales.length !== 1 ? 's' : ''} y {cofres.length} cofre{cofres.length !== 1 ? 's' : ''}</p>
                </div>

                {artefactosNormales.length === 0 && cofres.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
                        <div className="text-5xl mb-3 opacity-50">🔮</div>
                        <p className="text-purple-300">No tienes artefactos aun.</p>
                        <p className="text-purple-400 text-sm mt-1">Completa actividades y logros para obtener artefactos filosoficos.</p>
                    </div>
                ) : (
                    <>
                    {/* Cofres sin abrir */}
                    {cofres.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-yellow-300 font-bold text-sm mb-2">🎁 Cofres sin abrir ({cofres.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {cofres.map((cofre, i) => (
                                    <div key={'cofre-' + i}
                                        className="rounded-2xl p-4 border-2 border-yellow-400/50 bg-yellow-500/10">
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl">{cofre.emoji}</span>
                                            <div className="flex-1">
                                                <h4 className="text-white font-bold text-sm">{cofre.nombre}</h4>
                                                <p className="text-yellow-200 text-xs">Contiene un artefacto misterioso</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleOpenChest(cofre._idx, cofre.tipoCofre)}
                                            className="mt-3 w-full bg-yellow-500/30 hover:bg-yellow-500/50 border border-yellow-400/50 text-yellow-200 hover:text-white py-2 rounded-xl text-sm font-bold transition-all">
                                            🔓 Abrir Cofre
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {artefactosNormales.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {artefactosNormales.map((art, i) => {
                            var rarezaClasses = art.rareza === 'legendario'
                                ? 'border-yellow-400/50 bg-yellow-500/10'
                                : art.rareza === 'epico'
                                    ? 'border-purple-400/50 bg-purple-500/10'
                                    : art.rareza === 'raro'
                                        ? 'border-blue-400/50 bg-blue-500/10'
                                        : 'border-gray-400/50 bg-gray-500/10';
                            var rarezaLabel = art.rareza === 'legendario' ? '⭐ Legendario'
                                : art.rareza === 'epico' ? '💜 Epico'
                                : art.rareza === 'raro' ? '💙 Raro'
                                : '⚪ Comun';
                            var fromStudent = art.regaladoPor ? (students || []).find(s => s.id === art.regaladoPor) : null;

                            return (
                                <div key={i}
                                    className={`rounded-2xl p-4 border-2 ${rarezaClasses} ${art.usado ? 'opacity-60' : ''} transition-all`}>
                                    <div className="flex items-start gap-3">
                                        <span className="text-4xl">{art.emoji}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-white font-bold text-sm">{art.nombre}</h4>
                                                {art.usado ? (
                                                    <span className="bg-gray-500/30 text-gray-300 text-xs px-2 py-0.5 rounded-full">Usado</span>
                                                ) : (
                                                    <span className="bg-green-500/30 text-green-400 text-xs px-2 py-0.5 rounded-full">Disponible</span>
                                                )}
                                            </div>
                                            <p className="text-purple-200 text-xs mb-1">{art.efecto}</p>
                                            <p className="text-xs">{rarezaLabel}</p>
                                            {fromStudent && (
                                                <p className="text-purple-400 text-xs mt-1">🎁 Regalo de {fromStudent.nombreSocial || fromStudent.nombre}</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Botones de usar y regalar (solo si no usado y hay setStudents) */}
                                    {!art.usado && setStudents && (
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => { setSelectedUseArt(art._idx); setShowUseConfirm(true); }}
                                                className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all">
                                                ✨ Usar
                                            </button>
                                            {otherStudents.length > 0 && (
                                                <button onClick={() => { setSelectedTradeArt(art._idx); setShowTradeModal(true); }}
                                                    className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all">
                                                    🎁 Regalar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    )}
                    </>
                )}

                {/* Catalogo */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h3 className="text-white font-bold mb-3">Catalogo Completo</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {window.ARTEFACTOS.map(art => {
                            var owned = items.some(it => it.id === art.id);
                            return (
                                <div key={art.id}
                                    className={`rounded-xl p-3 text-center border transition-all ${
                                        owned ? 'border-yellow-400/30 bg-yellow-500/10' : 'border-gray-600/30 bg-gray-800/30 opacity-50'
                                    }`}>
                                    <div className="text-2xl mb-1">{owned ? art.emoji : '❓'}</div>
                                    <p className={`text-xs font-semibold ${owned ? 'text-white' : 'text-gray-500'}`}>
                                        {owned ? art.nombre : '???'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    const renderContent = () => {
        switch (activeTab) {
            case 'perfil': return renderPerfil();
            case 'mapa': return renderMapa();
            case 'ranking': return renderRanking();
            case 'vocabulario': return renderVocabulario();
            case 'actividades': return renderActividades();
            case 'artefactos': return renderArtefactos();
            default: return renderPerfil();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl sm:text-2xl">{avatar.emoji}</span>
                        <div className="min-w-0">
                            <h1 className="text-white font-bold text-sm sm:text-lg leading-tight truncate">{currentUser.nombreSocial || currentUser.nombre}</h1>
                            <p className="text-purple-300 text-xs hidden sm:block">Nv.{nivel.nivel} {avatar.titulo}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                        <span className="bg-yellow-500/20 text-yellow-400 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full">
                            {currentUser.xp || 0} XP
                        </span>
                        <span className="bg-purple-500/20 text-purple-300 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full">
                            #{rankPosition}
                        </span>
                        <button onClick={onLogout}
                            className="text-purple-300 hover:text-white transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-white/10"
                            title="Cerrar sesion">
                            <window.Icons.LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-60px)]">
                {/* Side tabs (desktop) */}
                <nav className="hidden md:flex flex-col gap-1 p-3 w-48 shrink-0">
                    {tabs.map(tab => (
                        <button key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all relative ${
                                activeTab === tab.id
                                    ? 'bg-white/20 text-white shadow-lg'
                                    : 'text-purple-300 hover:bg-white/10 hover:text-white'
                            }`}>
                            <span>{tab.emoji}</span>
                            <span>{tab.label}</span>
                            {tab.badge > 0 && (
                                <span className="absolute right-2 top-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Main content */}
                <main className="flex-1 p-4 pb-24 md:pb-4 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>

            {/* Bottom tab bar (mobile) - safe area + compact */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 z-50"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                <div className="flex justify-around py-1.5 px-1">
                    {tabs.map(tab => (
                        <button key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-0 px-1.5 py-1 rounded-lg transition-all min-w-0 ${
                                activeTab === tab.id ? 'text-white' : 'text-purple-400'
                            }`}>
                            <span className={`text-base ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
                            <span className="text-[10px] font-medium leading-tight truncate max-w-[48px]">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="w-1 h-1 rounded-full bg-yellow-400"></div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Modal apertura de cofre con animacion mejorada */}
            {showOpenChest && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-500/50 rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
                        {/* Particulas de fondo */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {chestAnimating && [0,1,2,3,4,5,6,7].map(i => (
                                <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                                    style={{
                                        left: (15 + i * 10) + '%',
                                        top: (20 + (i % 3) * 25) + '%',
                                        animationDelay: (i * 0.3) + 's',
                                        animationDuration: '1.5s'
                                    }}></div>
                            ))}
                            {!chestAnimating && chestResult && [0,1,2,3,4,5,6,7,8,9].map(i => (
                                <div key={i} className="absolute text-lg animate-ping"
                                    style={{
                                        left: (5 + i * 9) + '%',
                                        top: (10 + (i % 4) * 22) + '%',
                                        animationDelay: (i * 0.2) + 's',
                                        animationDuration: '2s'
                                    }}>
                                    {['✨','⭐','💫','🌟','✨'][i % 5]}
                                </div>
                            ))}
                        </div>
                        {chestAnimating ? (
                            <>
                                <div className="text-8xl mb-4 animate-bounce" style={{animationDuration: '0.6s'}}>
                                    {chestOpening ? (window.COFRES[chestOpening.tipo]?.emoji || '🎁') : '🎁'}
                                </div>
                                <h3 className="text-2xl font-bold text-yellow-300 mb-2 animate-pulse">Abriendo cofre...</h3>
                                <p className="text-yellow-200/60 text-sm mb-3">Descubriendo artefacto misterioso</p>
                                <div className="w-full bg-gray-700 rounded-full h-3 mt-4 overflow-hidden">
                                    <div className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 h-3 rounded-full transition-all duration-[2000ms] ease-out"
                                        style={{width: '100%'}}></div>
                                </div>
                            </>
                        ) : chestResult ? (
                            <>
                                <div className="text-8xl mb-4" style={{animation: 'pulse 1s ease-in-out infinite'}}>{chestResult.emoji}</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Obtuviste: {chestResult.nombre}</h3>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                                    chestResult.rareza === 'legendario' ? 'bg-yellow-500/30 text-yellow-300' :
                                    chestResult.rareza === 'epico' ? 'bg-purple-500/30 text-purple-300' :
                                    chestResult.rareza === 'raro' ? 'bg-blue-500/30 text-blue-300' :
                                    'bg-gray-500/30 text-gray-300'
                                }`}>
                                    {chestResult.rareza === 'legendario' ? '⭐ LEGENDARIO' :
                                     chestResult.rareza === 'epico' ? '💜 EPICO' :
                                     chestResult.rareza === 'raro' ? '💙 RARO' : '⚪ COMUN'}
                                </span>
                                <p className="text-purple-200 text-sm mb-4">{chestResult.efecto}</p>
                                <button onClick={() => { setShowOpenChest(false); setChestResult(null); setChestOpening(null); }}
                                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-bold transition">
                                    Genial!
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-5xl mb-4">😕</div>
                                <p className="text-gray-300">Error al abrir cofre</p>
                                <button onClick={() => { setShowOpenChest(false); setChestResult(null); }}
                                    className="mt-4 bg-gray-700 text-white py-2 px-6 rounded-xl">Cerrar</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de confirmacion de uso de artefacto */}
            {showUseConfirm && selectedUseArt !== null && (() => {
                var inventario = currentUser.artefactos || [];
                var artInv = inventario[selectedUseArt];
                var artDef = artInv ? window.ARTEFACTOS.find(a => a.id === (artInv.id || artInv)) : null;
                return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-6 max-w-sm w-full text-center">
                            {artDef && (
                                <>
                                    <div className="text-5xl mb-3">{artDef.emoji}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">Usar {artDef.nombre}</h3>
                                    <p className="text-green-300 text-sm mb-1">Efecto: {artDef.efecto}</p>
                                    <p className="text-yellow-400 text-xs mb-4">Una vez usado, no se puede recuperar. Tu profesor aplicara el efecto.</p>
                                </>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => { setShowUseConfirm(false); setSelectedUseArt(null); }}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl text-sm font-semibold transition">
                                    Cancelar
                                </button>
                                <button onClick={handleUseArtefacto}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-semibold transition">
                                    ✨ Confirmar Uso
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Modal de intercambio de artefactos */}
            {showTradeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold text-white mb-4">🎁 Regalar Artefacto</h3>
                        <p className="text-purple-300 text-sm mb-4">Selecciona a quien quieres regalar este artefacto:</p>
                        <select value={tradeTarget} onChange={e => setTradeTarget(e.target.value)}
                            className="w-full bg-gray-800 border border-purple-500/30 text-white rounded-xl px-4 py-3 mb-4 text-sm">
                            <option value="">Seleccionar companero...</option>
                            {(students || []).filter(s => s.id !== currentUser.id).map(s => (
                                <option key={s.id} value={s.id}>{s.nombreSocial || s.nombre}</option>
                            ))}
                        </select>
                        <div className="flex gap-3">
                            <button onClick={() => { setShowTradeModal(false); setSelectedTradeArt(null); setTradeTarget(''); }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl text-sm font-semibold transition">
                                Cancelar
                            </button>
                            <button onClick={handleTrade}
                                disabled={!tradeTarget}
                                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                                    tradeTarget ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}>
                                Regalar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
