// Dashboard del Estudiante - Vista gamificada completa
window.EstudianteDashboard = ({ currentUser, students, activities, unidades, onLogout }) => {
    const { useState } = React;
    const [activeTab, setActiveTab] = useState('perfil');
    const [expandedUnidades, setExpandedUnidades] = useState({});

    // ---- Datos derivados ----
    const nivel = window.getNivel(currentUser.xp || 0);
    const xpEnNivel = (currentUser.xp || 0) - nivel.xp_min;
    const xpParaSiguiente = nivel.xp_max - nivel.xp_min;
    const xpProgress = Math.min((xpEnNivel / xpParaSiguiente) * 100, 100);

    const clase = window.CLASES_FILOSOFICAS.find(c => c.id === currentUser.clase) || window.CLASES_FILOSOFICAS[0];
    const unidadesData = unidades || window.UNIDADES_DEFAULT;
    const vocabDescubierto = currentUser.vocabularioDescubierto || [];

    // Ranking position (sin mostrar datos de otros)
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

    // ---- Tabs config ----
    const tabs = [
        { id: 'perfil', label: 'Mi Perfil', emoji: '👤' },
        { id: 'progreso', label: 'Progreso', emoji: '📊' },
        { id: 'vocabulario', label: 'Vocabulario', emoji: '📚' },
        { id: 'actividades', label: 'Actividades', emoji: '⚡' },
        { id: 'artefactos', label: 'Artefactos', emoji: '🏺' }
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

    // ============================================================
    // TAB: MI PERFIL
    // ============================================================
    const renderPerfil = () => (
        <div className="space-y-6">
            {/* Header card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-6xl mb-3">{clase.emoji}</div>
                <h2 className="text-3xl font-bold text-white mb-1">{currentUser.nombre}</h2>
                <span className={`inline-block px-4 py-1 rounded-full text-white text-sm font-semibold ${clase.color}`}>
                    {clase.nombre}
                </span>
                <p className="text-purple-200 text-sm mt-2">{clase.descripcion}</p>
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
                    {nivel.nivel < 10 ? (nivel.xp_max - (currentUser.xp || 0)) + ' XP para siguiente nivel' : 'Nivel maximo alcanzado'}
                </p>
            </div>

            {/* Radar de habilidades */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 text-center">Perfil de Habilidades</h3>
                <window.RadarChart student={currentUser} />
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

            {/* Posicion en ranking */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-lg font-bold text-white mb-1">Posicion en el Ranking</h3>
                <p className="text-3xl font-bold text-yellow-400">#{rankPosition}</p>
                <p className="text-purple-300 text-sm">de {totalStudents} estudiantes</p>
            </div>
        </div>
    );

    // ============================================================
    // TAB: PROGRESO
    // ============================================================
    const renderProgreso = () => {
        // Determinar unidad actual (simple: la primera sin completar todas las actividades)
        var currentUnidadIdx = 0;
        unidadesData.forEach((u, idx) => {
            var clasesConActividad = u.clases.filter(c => {
                return myActivities.some(a => a.unidadId === u.id && a.claseNum === c.num);
            }).length;
            if (clasesConActividad >= u.clases.length && idx < unidadesData.length - 1) {
                currentUnidadIdx = idx + 1;
            }
        });

        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-2">Progreso por Unidad</h3>
                {unidadesData.map((unidad, idx) => {
                    var clasesConActividad = unidad.clases.filter(c => {
                        return myActivities.some(a => a.unidadId === unidad.id && a.claseNum === c.num);
                    }).length;
                    var progClases = unidad.clases.length > 0 ? Math.round((clasesConActividad / unidad.clases.length) * 100) : 0;

                    var vocabTotal = (unidad.vocabulario || []).length;
                    var vocabFound = vocabTotal > 0 ? (unidad.vocabulario || []).filter(v => vocabDescubierto.includes(v.termino)).length : 0;

                    var isCurrent = idx === currentUnidadIdx;

                    return (
                        <div key={unidad.id}
                            className={`bg-white/10 backdrop-blur-md rounded-2xl p-5 border transition-all ${isCurrent ? 'border-yellow-400/60 ring-2 ring-yellow-400/30' : 'border-white/20'}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">{unidad.emoji}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-white font-bold">{unidad.nombre}</h4>
                                        {isCurrent && (
                                            <span className="bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">ACTUAL</span>
                                        )}
                                    </div>
                                    <p className="text-purple-300 text-sm">{unidad.periodo}</p>
                                </div>
                            </div>

                            {/* Barra de clases */}
                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-purple-200">Clases completadas</span>
                                    <span className="text-white font-semibold">{clasesConActividad}/{unidad.clases.length}</span>
                                </div>
                                <div className="w-full bg-purple-900/50 rounded-full h-3">
                                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all"
                                        style={{ width: progClases + '%' }}></div>
                                </div>
                            </div>

                            {/* Vocabulario */}
                            {vocabTotal > 0 && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-purple-200">Vocabulario descubierto</span>
                                        <span className="text-white font-semibold">{vocabFound}/{vocabTotal}</span>
                                    </div>
                                    <div className="w-full bg-purple-900/50 rounded-full h-3">
                                        <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all"
                                            style={{ width: (vocabTotal > 0 ? (vocabFound / vocabTotal) * 100 : 0) + '%' }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Evaluacion */}
                            {unidad.evaluacionSumativa && (
                                <div className="flex items-center gap-2 mt-2 bg-white/5 rounded-lg p-2">
                                    <span className="text-lg">📝</span>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-semibold">{unidad.evaluacionSumativa.nombre}</p>
                                        <p className="text-purple-300 text-xs">{unidad.evaluacionSumativa.descripcion}</p>
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
    // TAB: VOCABULARIO
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
                {/* Contador total */}
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

                {/* Por unidad */}
                {unidadesData.map(unidad => {
                    var vocab = unidad.vocabulario || [];
                    if (vocab.length === 0) return null;
                    var found = vocab.filter(v => vocabDescubierto.includes(v.termino)).length;
                    var isOpen = expandedUnidades[unidad.id] !== false; // abierto por defecto

                    return (
                        <div key={unidad.id} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                            {/* Header colapsable */}
                            <button
                                onClick={() => toggleUnidad(unidad.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{unidad.emoji}</span>
                                    <div className="text-left">
                                        <h4 className="text-white font-bold text-sm">{unidad.nombre}</h4>
                                        <span className="text-cyan-400 text-sm font-semibold">{found}/{vocab.length} descubierto</span>
                                    </div>
                                </div>
                                <span className={`text-white text-xl transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                                    ▶
                                </span>
                            </button>

                            {/* Contenido */}
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
        // Estadisticas por tipo
        var tipoCount = {};
        myActivities.forEach(a => {
            tipoCount[a.tipo] = (tipoCount[a.tipo] || 0) + 1;
        });

        // Habilidad mas fuerte
        var habPoints = currentUser.habilidades || {};
        var strongestHab = null;
        var maxPts = 0;
        window.HABILIDADES.forEach(h => {
            var pts = habPoints[h.id] || 0;
            if (pts > maxPts) {
                maxPts = pts;
                strongestHab = h;
            }
        });

        var maxTipoCount = 0;
        Object.values(tipoCount).forEach(c => { if (c > maxTipoCount) maxTipoCount = c; });

        return (
            <div className="space-y-4">
                {/* Estadisticas resumen */}
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

                {/* Grafico de barras por tipo */}
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

                {/* Lista de actividades recientes */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h3 className="text-white font-bold mb-3">Actividades Recientes</h3>
                    {myActivities.length === 0 ? (
                        <p className="text-purple-300 text-center text-sm">No tienes actividades registradas aun.</p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {myActivities.slice(0, 20).map((act, i) => {
                                var tipoInfo = getActividadTipo(act.tipo);
                                var unidad = unidadesData.find(u => u.id === act.unidadId);
                                return (
                                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors">
                                        <span className="text-2xl">{tipoInfo.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-semibold truncate">{act.nombre || act.notas || tipoInfo.nombre}</p>
                                            <p className="text-purple-300 text-xs">
                                                {unidad ? unidad.emoji + ' ' + unidad.nombre : ''}{(act.date || act.fecha) ? ' - ' + new Date(act.date || act.fecha).toLocaleDateString() : ''}
                                            </p>
                                        </div>
                                        <span className="bg-yellow-500/20 text-yellow-400 text-sm font-bold px-2 py-1 rounded-lg">
                                            +{act.xp || 0} XP
                                        </span>
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
    // TAB: ARTEFACTOS
    // ============================================================
    const renderArtefactos = () => {
        var inventario = currentUser.inventarioArtefactos || currentUser.artefactos || [];

        // Map inventario items to full artifact info
        var items = inventario.map(item => {
            var artefactoId = typeof item === 'string' ? item : (item.id || item.artefactoId);
            var usado = typeof item === 'object' ? (item.usado || false) : false;
            var artefacto = window.ARTEFACTOS.find(a => a.id === artefactoId);
            return artefacto ? { ...artefacto, usado: usado } : null;
        }).filter(Boolean);

        return (
            <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
                    <div className="text-4xl mb-2">🏺</div>
                    <h3 className="text-xl font-bold text-white">Inventario de Artefactos</h3>
                    <p className="text-purple-300 text-sm">{items.length} artefacto{items.length !== 1 ? 's' : ''} en tu coleccion</p>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
                        <div className="text-5xl mb-3 opacity-50">🔮</div>
                        <p className="text-purple-300">No tienes artefactos aun.</p>
                        <p className="text-purple-400 text-sm mt-1">Completa actividades y logros para obtener artefactos filosoficos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map((art, i) => {
                            var rarezaClasses = art.rareza === 'legendario'
                                ? 'border-yellow-400/50 bg-yellow-500/10'
                                : art.rareza === 'epico'
                                    ? 'border-purple-400/50 bg-purple-500/10'
                                    : 'border-blue-400/50 bg-blue-500/10';
                            var rarezaLabel = art.rareza === 'legendario' ? '⭐ Legendario'
                                : art.rareza === 'epico' ? '💜 Epico' : '💙 Raro';

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
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Catalogo de todos los artefactos */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h3 className="text-white font-bold mb-3">Catalogo Completo</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {window.ARTEFACTOS.map(art => {
                            var owned = items.some(it => it.id === art.id);
                            return (
                                <div key={art.id}
                                    className={`rounded-xl p-3 text-center border transition-all ${
                                        owned
                                            ? 'border-yellow-400/30 bg-yellow-500/10'
                                            : 'border-gray-600/30 bg-gray-800/30 opacity-50'
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
            case 'progreso': return renderProgreso();
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
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{clase.emoji}</span>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">{currentUser.nombre}</h1>
                            <p className="text-purple-300 text-xs">Nivel {nivel.nivel} - {nivel.titulo}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-yellow-500/20 text-yellow-400 text-sm font-bold px-3 py-1 rounded-full">
                            {currentUser.xp || 0} XP
                        </span>
                        <button onClick={onLogout}
                            className="text-purple-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                            title="Cerrar sesion">
                            <window.Icons.LogOut size={20} />
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
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white/20 text-white shadow-lg'
                                    : 'text-purple-300 hover:bg-white/10 hover:text-white'
                            }`}>
                            <span>{tab.emoji}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Main content */}
                <main className="flex-1 p-4 pb-24 md:pb-4 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>

            {/* Bottom tab bar (mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 z-50">
                <div className="flex justify-around py-2">
                    {tabs.map(tab => (
                        <button key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                                activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-purple-400'
                            }`}>
                            <span className={`text-lg ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
                            <span className="text-xs font-medium">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5"></div>
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};
