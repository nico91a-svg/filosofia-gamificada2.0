// Registro masivo de actividades
window.RegistroMasivo = ({ students, unidades, onRegisterBatch }) => {
    const { useState, useEffect } = React;
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [tipo, setTipo] = useState('');
    const [nivel, setNivel] = useState('competente');
    const [unidadId, setUnidadId] = useState('U1');
    const [claseNum, setClaseNum] = useState(1);
    const [notas, setNotas] = useState('');
    const [nivelIndividual, setNivelIndividual] = useState(false);
    const [nivelesIndividuales, setNivelesIndividuales] = useState({});
    const [vocabularioTerminos, setVocabularioTerminos] = useState([]);
    const [registroExitoso, setRegistroExitoso] = useState(false);

    const tiposActividad = window.TIPOS_ACTIVIDAD;
    const rubrics = window.RUBRICS_XP;
    const currentUnidad = unidades.find(u => u.id === unidadId);
    const xpBase = rubrics[tipo]?.[nivel] || 0;

    const toggleStudent = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const selectAll = () => setSelectedStudents(students.map(s => s.id));
    const selectNone = () => setSelectedStudents([]);

    const handleRegister = () => {
        if (selectedStudents.length === 0) {
            alert('Selecciona al menos un estudiante');
            return;
        }
        if (!tipo) {
            alert('Selecciona un tipo de actividad');
            return;
        }

        const batch = selectedStudents.map(studentId => {
            const studentNivel = nivelIndividual ? (nivelesIndividuales[studentId] || nivel) : nivel;
            const xp = rubrics[tipo]?.[studentNivel] || 0;
            return {
                studentId,
                tipo,
                nivel: studentNivel,
                xp,
                unidadId,
                claseNum,
                notas,
                habilidades: window.RUBRICS_HABILIDADES[tipo] || {},
                vocabularioTerminos
            };
        });

        onRegisterBatch(batch);
        setRegistroExitoso(true);
        setTimeout(() => setRegistroExitoso(false), 3000);
        setSelectedStudents([]);
        setTipo('');
        setNotas('');
        setVocabularioTerminos([]);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Registro Masivo de Actividades</h2>
            <p className="text-gray-600">Registra actividades para multiples estudiantes a la vez. Ideal para participacion en clase y actividades grupales.</p>

            {registroExitoso && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    Actividades registradas exitosamente para {selectedStudents.length || 'los'} estudiantes seleccionados.
                </div>
            )}

            {/* Configuracion de actividad */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Configuracion de la Actividad</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Unidad</label>
                        <select value={unidadId} onChange={(e) => { setUnidadId(e.target.value); setClaseNum(1); }}
                            className="w-full px-4 py-2 border rounded-lg">
                            {unidades.map(u => <option key={u.id} value={u.id}>{u.emoji} {u.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Clase</label>
                        <select value={claseNum} onChange={(e) => setClaseNum(Number(e.target.value))}
                            className="w-full px-4 py-2 border rounded-lg">
                            {(currentUnidad?.clases || []).map(c => (
                                <option key={c.num} value={c.num}>Clase {c.num}: {c.titulo.substring(0, 35)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Tipo de Actividad</label>
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg">
                            <option value="">Seleccionar...</option>
                            {tiposActividad.map(t => <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Nivel de Desempeno {!nivelIndividual && <span className="text-gray-400">(para todos)</span>}
                        </label>
                        <div className="flex gap-2">
                            <select value={nivel} onChange={(e) => setNivel(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg" disabled={nivelIndividual}>
                                <option value="basico">Basico</option>
                                <option value="competente">Competente</option>
                                <option value="avanzado">Avanzado</option>
                                <option value="excepcional">Excepcional</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                                <input type="checkbox" checked={nivelIndividual}
                                    onChange={(e) => setNivelIndividual(e.target.checked)} />
                                Individual
                            </label>
                        </div>
                    </div>
                </div>
                {tipo && !nivelIndividual && (
                    <div className="mt-4 bg-purple-50 rounded-lg p-4">
                        <span className="text-sm text-gray-600">XP por estudiante: </span>
                        <span className="text-2xl font-bold text-purple-600">{xpBase} XP</span>
                    </div>
                )}
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                    placeholder="Notas adicionales (opcional)" className="w-full px-4 py-2 border rounded-lg mt-4 h-16" />

                {/* Vocabulario a otorgar */}
                {currentUnidad && currentUnidad.vocabulario.length > 0 && (
                    <div className="mt-4">
                        <label className="block text-sm font-semibold mb-2">Otorgar vocabulario (opcional)</label>
                        <div className="flex flex-wrap gap-2">
                            {currentUnidad.vocabulario.map((v, i) => (
                                <button key={i}
                                    onClick={() => {
                                        setVocabularioTerminos(prev =>
                                            prev.includes(v.termino) ? prev.filter(t => t !== v.termino) : [...prev, v.termino]
                                        );
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                        vocabularioTerminos.includes(v.termino)
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}>
                                    {v.termino}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Seleccion de estudiantes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                        Estudiantes ({selectedStudents.length}/{students.length} seleccionados)
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={selectAll} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200">
                            Todos
                        </button>
                        <button onClick={selectNone} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                            Ninguno
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {students.map(student => {
                        const isSelected = selectedStudents.includes(student.id);
                        const clase = window.CLASES_FILOSOFICAS.find(c => c.id === student.clase);
                        return (
                            <div key={student.id}
                                onClick={() => toggleStudent(student.id)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                                    isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={isSelected} onChange={() => {}} className="pointer-events-none" />
                                    <div className="flex-1">
                                        <span className="font-semibold text-sm text-gray-800">{student.nombre}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${clase?.color}`}>
                                                {clase?.emoji} {clase?.nombre}
                                            </span>
                                            <span className="text-xs text-gray-500">{student.xp} XP</span>
                                        </div>
                                    </div>
                                    {nivelIndividual && isSelected && (
                                        <select value={nivelesIndividuales[student.id] || nivel}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setNivelesIndividuales(prev => ({ ...prev, [student.id]: e.target.value }));
                                            }}
                                            className="text-xs px-2 py-1 border rounded">
                                            <option value="basico">Basico</option>
                                            <option value="competente">Competente</option>
                                            <option value="avanzado">Avanzado</option>
                                            <option value="excepcional">Excepcional</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Boton de registro */}
            <button onClick={handleRegister}
                disabled={selectedStudents.length === 0 || !tipo}
                className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                    selectedStudents.length > 0 && tipo
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}>
                Registrar Actividad para {selectedStudents.length} estudiante{selectedStudents.length !== 1 ? 's' : ''}
            </button>
        </div>
    );
};
