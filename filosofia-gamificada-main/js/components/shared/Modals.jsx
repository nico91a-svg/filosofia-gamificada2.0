// Modals compartidos
const { useState, useEffect } = React;

// Modal para agregar estudiante
window.AddStudentModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({ nombre: '', clase: '', password: '' });
    const clases = window.CLASES_FILOSOFICAS;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-5 sm:p-6 max-w-md w-full my-4">
                <h3 className="text-xl font-bold mb-4">Agregar Nuevo Estudiante</h3>
                <input type="text" placeholder="Nombre completo" value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-3" />
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
                        if (formData.nombre && formData.clase && formData.password) { onAdd(formData); }
                        else { alert('Por favor completa todos los campos'); }
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
                <h3 className="text-xl font-bold mb-4">Editar: {student.nombre}</h3>
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
    const rubrics = window.RUBRICS_XP;
    const currentUnidad = unidades.find(u => u.id === formData.unidadId);

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
                    {students.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
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
                <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg mb-3">
                    <option value="">Tipo de actividad</option>
                    {tiposActividad.map(t => <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>)}
                </select>
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
                    placeholder="💬 Comentario/feedback para el estudiante (opcional)" className="w-full px-4 py-2 border rounded-lg mb-4 h-16 bg-blue-50 border-blue-200 placeholder-blue-400" />
                <div className="flex gap-2">
                    <button onClick={() => {
                        if (formData.studentId && formData.tipo) {
                            onAdd({ ...formData, habilidades: window.RUBRICS_HABILIDADES[formData.tipo] || {} });
                        } else { alert('Por favor completa estudiante y tipo de actividad'); }
                    }} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold">Registrar</button>
                    <button onClick={onClose} className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// Modal de detalle de estudiante
window.StudentDetailModal = ({ student, activities, onClose }) => {
    const nivel = window.getNivel(student.xp);
    const clase = window.CLASES_FILOSOFICAS.find(c => c.id === student.clase);
    const studentActivities = activities.filter(a => a.studentId === student.id).slice(0, 10);
    const badges = window.BADGES;
    const habilidades = window.HABILIDADES;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{student.nombre}</h2>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold mt-2 ${clase?.color}`}>
                            <span className="text-lg">{clase?.emoji}</span> {clase?.nombre}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">x</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <window.Icons.Trophy className="text-purple-600" size={32} />
                            <div>
                                <div className="text-2xl font-bold text-gray-800">Nivel {nivel.nivel}</div>
                                <div className="text-sm text-gray-600">{nivel.titulo}</div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-4 mb-2">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(((student.xp - nivel.xp_min) / (nivel.xp_max - nivel.xp_min)) * 100, 100)}%` }}></div>
                        </div>
                        <div className="text-sm text-gray-600 text-center">{student.xp} / {nivel.xp_max} XP</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <window.Icons.Award className="text-blue-600" size={32} />
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{student.badges.length}</div>
                                <div className="text-sm text-gray-600">Badges Desbloqueados</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {student.badges.map(badgeId => {
                                const badge = badges.find(b => b.id === badgeId);
                                return badge ? (
                                    <div key={badgeId} className="bg-white rounded-lg px-3 py-1 text-xs font-semibold shadow" title={badge.descripcion}>
                                        {badge.icon} {badge.nombre}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Poligono de Habilidades</h3>
                    <window.RadarChart student={student} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                        {habilidades.map(hab => {
                            const puntos = student.habilidades[hab.id] || 0;
                            const nivelHab = window.getHabilidadNivel(puntos);
                            return (
                                <div key={hab.id} className="bg-white rounded-lg p-3 shadow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{hab.emoji}</span>
                                        <span className="font-semibold text-xs text-gray-700">{hab.nombre}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1,2,3,4,5].map(star => (
                                                <span key={star} className={`text-sm ${star <= nivelHab ? 'text-yellow-400' : 'text-gray-300'}`}>&#9733;</span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600">({puntos}p)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Actividades</h3>
                    {studentActivities.length > 0 ? (
                        <div className="space-y-2">
                            {studentActivities.map(activity => {
                                const tipo = window.TIPOS_ACTIVIDAD.find(t => t.id === activity.tipo);
                                const unidad = window.UNIDADES_DEFAULT.find(u => u.id === activity.unidadId);
                                return (
                                    <div key={activity.id} className="bg-white rounded-lg p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{tipo?.icon}</span>
                                            <div>
                                                <div className="font-semibold text-sm text-gray-800">{tipo?.nombre}</div>
                                                <div className="text-xs text-gray-600">
                                                    {unidad ? unidad.emoji + ' ' + unidad.id : ''} {' '}
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-purple-600">+{activity.xp} XP</div>
                                            <div className="text-xs text-gray-600 capitalize">{activity.nivel}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">No hay actividades registradas aun</div>
                    )}
                </div>
                <div className="mt-6">
                    <button onClick={onClose} className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
