// Modals compartidos
const { useState, useEffect } = React;

// Modal para agregar estudiante
window.AddStudentModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        nombreSocial: '', nombreLegal: '', genero: '', clase: '', password: ''
    });
    const clases = window.CLASES_FILOSOFICAS;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-5 sm:p-6 max-w-md w-full my-4">
                <h3 className="text-xl font-bold mb-4">Agregar Nuevo Estudiante</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-700 text-xs">El <strong>nombre social</strong> es el que aparecera visible en la plataforma. El nombre legal se guarda solo como referencia interna.</p>
                </div>
                <input type="text" placeholder="Nombre social (como quiere ser llamado/a)" value={formData.nombreSocial}
                    onChange={(e) => setFormData({ ...formData, nombreSocial: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-3" />
                <input type="text" placeholder="Nombre legal / dado por sus padres" value={formData.nombreLegal}
                    onChange={(e) => setFormData({ ...formData, nombreLegal: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-3" />
                <select value={formData.genero} onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-3">
                    <option value="">Seleccionar genero</option>
                    <option value="femenino">👩 Femenino</option>
                    <option value="masculino">👨 Masculino</option>
                    <option value="no-binario">🧑 No binario</option>
                </select>
                <select value={formData.clase} onChange={(e) => setFormData({ ...formData, clase: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-3">
                    <option value="">Seleccionar clase</option>
                    {clases.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>)}
                </select>
                <input type="password" placeholder="Contraseña" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-4" />
                <div className="flex gap-2">
                    <button onClick={() => {
                        if (formData.nombreSocial && formData.genero && formData.clase && formData.password) {
                            onAdd({
                                nombre: formData.nombreSocial,
                                nombreSocial: formData.nombreSocial,
                                nombreLegal: formData.nombreLegal || formData.nombreSocial,
                                genero: formData.genero,
                                clase: formData.clase,
                                password: formData.password
                            });
                        } else { alert('Por favor completa nombre social, genero, clase y contraseña'); }
                    }} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">Agregar</button>
                    <button onClick={onClose} className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// Modal para editar estudiante
window.EditStudentModal = ({ student, onClose, onAddXP, onAddHabilidadPoints, onAddBadge, onAddArtefacto }) => {
    const [xpToAdd, setXpToAdd] = useState('');
    const [selectedHab, setSelectedHab] = useState('');
    const [pointsToAdd, setPointsToAdd] = useState('');
    const [newArtefacto, setNewArtefacto] = useState('');
    const [selectedBadge, setSelectedBadge] = useState('');
    const habilidades = window.HABILIDADES;
    const badges = window.BADGES;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
                <h3 className="text-xl font-bold mb-4">Editar: {student.nombreSocial || student.nombre}</h3>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Agregar XP</label>
                    <div className="flex gap-2">
                        <input type="number" value={xpToAdd} onChange={(e) => setXpToAdd(e.target.value)}
                            placeholder="Cantidad de XP" className="flex-1 px-4 py-2 border rounded-lg" />
                        <button onClick={() => { if (xpToAdd && Number(xpToAdd) > 0) { onAddXP(student.id, Number(xpToAdd)); setXpToAdd(''); } }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">+XP</button>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Agregar Puntos de Habilidad</label>
                    <select value={selectedHab} onChange={(e) => setSelectedHab(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg mb-2">
                        <option value="">Seleccionar habilidad</option>
                        {habilidades.map(h => <option key={h.id} value={h.id}>{h.emoji} {h.nombre}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <input type="number" value={pointsToAdd} onChange={(e) => setPointsToAdd(e.target.value)}
                            placeholder="Puntos" className="flex-1 px-4 py-2 border rounded-lg" />
                        <button onClick={() => {
                            if (selectedHab && pointsToAdd && Number(pointsToAdd) > 0) {
                                onAddHabilidadPoints(student.id, selectedHab, Number(pointsToAdd));
                                setPointsToAdd(''); setSelectedHab('');
                            }
                        }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">+Pts</button>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Agregar Badge</label>
                    <div className="flex gap-2">
                        <select value={selectedBadge} onChange={(e) => setSelectedBadge(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg">
                            <option value="">Seleccionar badge</option>
                            {badges.filter(b => !student.badges.includes(b.id)).map(b => (
                                <option key={b.id} value={b.id}>{b.icon} {b.nombre}</option>
                            ))}
                        </select>
                        <button onClick={() => { if (selectedBadge) { onAddBadge(student.id, selectedBadge); setSelectedBadge(''); } }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">+</button>
                    </div>
                </div>
                <button onClick={onClose} className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg">Cerrar</button>
            </div>
        </div>
    );
};

// Modal para registrar actividad individual
window.AddActivityModal = ({ students, onClose, onAdd, unidades }) => {
    const [formData, setFormData] = useState({
        studentId: '', tipo: '', nivel: 'competente', xp: 0, notas: '', comentario: '', unidadId: 'U1', claseNum: 1
    });
    const tiposActividad = window.TIPOS_ACTIVIDAD;
    const categorias = window.CATEGORIAS_ACTIVIDAD || [];
    const rubrics = window.RUBRICS_XP;
    const currentUnidad = unidades.find(u => u.id === formData.unidadId);

    // Obtener categoria del tipo seleccionado
    const tipoSeleccionado = tiposActividad.find(t => t.id === formData.tipo);
    const categoriaActual = tipoSeleccionado ? (categorias.find(c => c.id === tipoSeleccionado.categoria) || null) : null;

    // Info de cofre
    const cofreInfo = formData.tipo ? window.getCofre(formData.tipo, formData.nivel) : null;

    useEffect(() => {
        if (formData.tipo && formData.nivel) {
            const xp = rubrics[formData.tipo]?.[formData.nivel] || 0;
            setFormData(prev => ({ ...prev, xp }));
        }
    }, [formData.tipo, formData.nivel]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
                <h3 className="text-xl font-bold mb-4">Registrar Actividad</h3>
                <select value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg mb-3">
                    <option value="">Seleccionar estudiante</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.nombreSocial || s.nombre}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <select value={formData.unidadId} onChange={(e) => setFormData({ ...formData, unidadId: e.target.value, claseNum: 1 })}
                        className="px-4 py-2 border rounded-lg">
                        {unidades.map(u => <option key={u.id} value={u.id}>{u.emoji} {u.nombre.substring(0, 20)}</option>)}
                    </select>
                    <select value={formData.claseNum} onChange={(e) => setFormData({ ...formData, claseNum: Number(e.target.value) })}
                        className="px-4 py-2 border rounded-lg">
                        {currentUnidad && currentUnidad.clases.map(c => (
                            <option key={c.num} value={c.num}>Clase {c.num}</option>
                        ))}
                    </select>
                </div>
                {/* Tipo de actividad agrupado por categoria */}
                <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-2">
                    <option value="">Tipo de actividad</option>
                    {categorias.map(cat => (
                        <optgroup key={cat.id} label={cat.emoji + ' ' + cat.nombre}>
                            {tiposActividad.filter(t => t.categoria === cat.id).map(t =>
                                <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>
                            )}
                        </optgroup>
                    ))}
                </select>
                {/* Indicador de categoria y cofre */}
                {categoriaActual && (
                    <div className="flex items-center gap-2 mb-3 text-xs">
                        <span className={`px-2 py-1 rounded-full font-semibold ${
                            categoriaActual.id === 'cotidiana' ? 'bg-gray-100 text-gray-600' :
                            categoriaActual.id === 'proceso' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>{categoriaActual.emoji} {categoriaActual.nombre}</span>
                        {cofreInfo && (
                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                                {window.COFRES[cofreInfo].emoji} Da {window.COFRES[cofreInfo].nombre}
                            </span>
                        )}
                        {!cofreInfo && formData.tipo && (
                            <span className="text-gray-400">Sin cofre</span>
                        )}
                    </div>
                )}
                <select value={formData.nivel} onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-3">
                    <option value="basico">Basico</option>
                    <option value="competente">Competente</option>
                    <option value="avanzado">Avanzado</option>
                    <option value="excepcional">Excepcional</option>
                </select>
                <div className="bg-purple-50 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">XP a otorgar:</span>
                        <span className="text-2xl font-bold text-purple-600">{formData.xp} XP</span>
                    </div>
                    {formData.tipo && window.RUBRICS_HABILIDADES[formData.tipo] && (
                        <div className="mt-2 pt-2 border-t border-purple-200">
                            <div className="text-xs text-gray-500 mb-1.5">Habilidades que mejora:</div>
                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(window.RUBRICS_HABILIDADES[formData.tipo]).map(([habId, pts]) => {
                                    var hab = window.HABILIDADES.find(h => h.id === habId);
                                    if (!hab) return null;
                                    return (
                                        <span key={habId} className="inline-flex items-center gap-1 bg-white rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm border">
                                            {hab.emoji} {hab.shortName} <span className="text-purple-600">+{pts}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <textarea value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    placeholder="Notas adicionales (opcional)" className="w-full px-4 py-2 border rounded-lg mb-3 h-20" />
                <textarea value={formData.comentario || ''} onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                    placeholder="Comentario/feedback para el estudiante (opcional)" className="w-full px-4 py-2 border rounded-lg mb-4 h-16 bg-blue-50 border-blue-200 placeholder-blue-400" />
                <div className="flex gap-2">
                    <button onClick={() => {
                        if (formData.studentId && formData.tipo) {
                            onAdd({
                                ...formData,
                                categoria: tipoSeleccionado ? tipoSeleccionado.categoria : 'cotidiana',
                                habilidades: window.RUBRICS_HABILIDADES[formData.tipo] || {}
                            });
                        } else { alert('Por favor completa estudiante y tipo de actividad'); }
                    }} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold">Registrar</button>
                    <button onClick={onClose} className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// Modal de detalle de estudiante - compacto para 100% zoom
window.StudentDetailModal = ({ student, activities, onClose }) => {
    const nivel = window.getNivel(student.xp);
    const clase = window.CLASES_FILOSOFICAS.find(c => c.id === student.clase);
    const studentActivities = activities.filter(a => a.studentId === student.id).slice(0, 10);
    const badges = window.BADGES;
    const habilidades = window.HABILIDADES;
    const [tab, setTab] = React.useState('resumen');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[95vh] flex flex-col shadow-2xl">
                {/* Header compacto */}
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ${clase?.color || 'bg-purple-600'}`}>
                            {clase?.emoji || '🎓'}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-gray-800 truncate">{student.nombreSocial || student.nombre}</h2>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                {student.nombreLegal && student.nombreLegal !== (student.nombreSocial || student.nombre) && (
                                    <span className="truncate">{student.nombreLegal}</span>
                                )}
                                <span className="shrink-0">{student.genero === 'femenino' ? '👩' : student.genero === 'masculino' ? '👨' : '🧑'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0 text-xl">✕</button>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border-b shrink-0">
                    <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">Nv.{nivel.nivel}</div>
                        <div className="text-[10px] text-gray-500">{nivel.titulo}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(((student.xp - nivel.xp_min) / (nivel.xp_max - nivel.xp_min)) * 100, 100)}%` }}></div>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{student.xp}/{nivel.xp_max} XP</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{student.badges.length}</div>
                        <div className="text-[10px] text-gray-500">Badges</div>
                        <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                            {student.badges.slice(0, 4).map(bid => {
                                var b = badges.find(x => x.id === bid);
                                return b ? <span key={bid} className="text-xs" title={b.nombre}>{b.icon}</span> : null;
                            })}
                            {student.badges.length > 4 && <span className="text-[10px] text-gray-400">+{student.badges.length - 4}</span>}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{studentActivities.length}</div>
                        <div className="text-[10px] text-gray-500">Actividades</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                            {studentActivities.reduce((s, a) => s + (a.xp || 0), 0)} XP total
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b shrink-0">
                    {[
                        { id: 'resumen', label: 'Habilidades', emoji: '🎯' },
                        { id: 'actividades', label: 'Actividades', emoji: '📝' },
                        { id: 'badges', label: 'Badges', emoji: '🏅' }
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                                tab === t.id ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            {t.emoji} {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab content - scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                    {tab === 'resumen' && (
                        <div>
                            {/* Radar chart compacto */}
                            <div className="flex justify-center mb-3" style={{ maxHeight: '180px' }}>
                                <div style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                                    <window.RadarChart student={student} />
                                </div>
                            </div>
                            {/* Grid de habilidades compacto */}
                            <div className="grid grid-cols-3 gap-2">
                                {habilidades.map(hab => {
                                    const puntos = student.habilidades[hab.id] || 0;
                                    const nivelHab = window.getHabilidadNivel(puntos);
                                    return (
                                        <div key={hab.id} className="bg-gray-50 rounded-lg p-2 text-center">
                                            <span className="text-lg">{hab.emoji}</span>
                                            <p className="text-[10px] font-semibold text-gray-700 truncate">{hab.shortName || hab.nombre}</p>
                                            <div className="flex justify-center gap-px mt-0.5">
                                                {[1,2,3,4,5].map(star => (
                                                    <span key={star} className={`text-[10px] ${star <= nivelHab ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-gray-500">{puntos}pts</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {tab === 'actividades' && (
                        <div>
                            {studentActivities.length > 0 ? (
                                <div className="space-y-1.5">
                                    {studentActivities.map(activity => {
                                        const tipo = window.TIPOS_ACTIVIDAD.find(t => t.id === activity.tipo);
                                        return (
                                            <div key={activity.id} className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-lg shrink-0">{tipo?.icon || '📋'}</span>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-gray-800 truncate">{tipo?.nombre || activity.tipo}</p>
                                                        <p className="text-[10px] text-gray-500">
                                                            {activity.unidadId} C{activity.claseNum} · {new Date(activity.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 ml-2">
                                                    <span className="text-xs font-bold text-purple-600">+{activity.xp} XP</span>
                                                    <p className="text-[10px] text-gray-500 capitalize">{activity.nivel}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-8 text-sm">No hay actividades registradas</div>
                            )}
                        </div>
                    )}

                    {tab === 'badges' && (
                        <div className="grid grid-cols-2 gap-2">
                            {student.badges.map(badgeId => {
                                const badge = badges.find(b => b.id === badgeId);
                                return badge ? (
                                    <div key={badgeId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                        <span className="text-2xl">{badge.icon}</span>
                                        <p className="text-xs font-bold text-gray-800 mt-1">{badge.nombre}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{badge.descripcion}</p>
                                    </div>
                                ) : null;
                            })}
                            {student.badges.length === 0 && (
                                <div className="col-span-2 text-center text-gray-400 py-8 text-sm">Sin badges aun</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t shrink-0">
                    <button onClick={onClose} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition text-sm">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
