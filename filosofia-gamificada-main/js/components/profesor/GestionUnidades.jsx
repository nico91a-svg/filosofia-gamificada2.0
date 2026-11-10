// Panel de gestión de unidades (ver y editar)
window.GestionUnidades = ({ unidades, setUnidades, currentUnidad, setCurrentUnidad, currentClase, setCurrentClase }) => {
    const { useState } = React;
    const [editingUnidad, setEditingUnidad] = useState(null);
    const [editingClase, setEditingClase] = useState(null);
    const [editingVocab, setEditingVocab] = useState(null);
    const [newTermino, setNewTermino] = useState({ termino: '', definicion: '' });
    const [showAddTermino, setShowAddTermino] = useState(null);

    const updateUnidadField = (unidadId, field, value) => {
        setUnidades(unidades.map(u => u.id === unidadId ? { ...u, [field]: value } : u));
    };

    const updateClase = (unidadId, claseNum, field, value) => {
        setUnidades(unidades.map(u => {
            if (u.id === unidadId) {
                return { ...u, clases: u.clases.map(c => c.num === claseNum ? { ...c, [field]: value } : c) };
            }
            return u;
        }));
    };

    const addVocabulario = (unidadId) => {
        if (!newTermino.termino.trim() || !newTermino.definicion.trim()) {
            alert('Completa termino y definicion');
            return;
        }
        setUnidades(unidades.map(u => {
            if (u.id === unidadId) {
                return { ...u, vocabulario: [...u.vocabulario, { ...newTermino }] };
            }
            return u;
        }));
        setNewTermino({ termino: '', definicion: '' });
        setShowAddTermino(null);
    };

    const removeVocabulario = (unidadId, index) => {
        if (!window.confirm('Eliminar este termino del vocabulario?')) return;
        setUnidades(unidades.map(u => {
            if (u.id === unidadId) {
                const newVocab = [...u.vocabulario];
                newVocab.splice(index, 1);
                return { ...u, vocabulario: newVocab };
            }
            return u;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestion de Unidades</h2>
                <div className="text-sm text-gray-500">
                    Unidad actual: <span className="font-bold text-indigo-600">{currentUnidad}</span> | Clase: <span className="font-bold text-indigo-600">{currentClase}</span>
                </div>
            </div>

            {/* Selector de unidad actual */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-3">Unidad y Clase Actual</h3>
                <div className="grid grid-cols-2 gap-4">
                    <select value={currentUnidad} onChange={(e) => { setCurrentUnidad(e.target.value); setCurrentClase(1); }}
                        className="px-4 py-2 rounded-lg text-gray-800">
                        {unidades.map(u => <option key={u.id} value={u.id}>{u.emoji} {u.nombre}</option>)}
                    </select>
                    <select value={currentClase} onChange={(e) => setCurrentClase(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg text-gray-800">
                        {(unidades.find(u => u.id === currentUnidad)?.clases || []).map(c => (
                            <option key={c.num} value={c.num}>Clase {c.num}: {c.titulo.substring(0, 30)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lista de unidades */}
            {unidades.map(unidad => (
                <div key={unidad.id} className={`bg-white rounded-xl shadow-lg overflow-hidden border-l-4 ${unidad.id === currentUnidad ? 'border-indigo-500' : 'border-gray-200'}`}>
                    {/* Header de unidad */}
                    <div className={`bg-gradient-to-r ${unidad.color} text-white p-6`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold">{unidad.emoji} {unidad.nombre}</h3>
                                <p className="text-white text-opacity-80">{unidad.periodo} | {unidad.totalClases} clases</p>
                            </div>
                            <button onClick={() => setEditingUnidad(editingUnidad === unidad.id ? null : unidad.id)}
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition text-sm font-bold">
                                {editingUnidad === unidad.id ? 'Cerrar' : 'Editar'}
                            </button>
                        </div>
                    </div>

                    {editingUnidad === unidad.id && (
                        <div className="p-6 space-y-6">
                            {/* Objetivos */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Objetivos de Aprendizaje</h4>
                                {unidad.objetivos.map((obj, i) => (
                                    <p key={i} className="text-sm text-gray-600 mb-1">- {obj}</p>
                                ))}
                            </div>

                            {/* Evaluacion */}
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <h4 className="font-bold text-gray-800 mb-2">Evaluacion Sumativa</h4>
                                <p className="font-semibold text-gray-700">{unidad.evaluacionSumativa.nombre}</p>
                                <p className="text-sm text-gray-600">{unidad.evaluacionSumativa.descripcion}</p>
                            </div>

                            {/* Clases */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3">Clases ({unidad.clases.length})</h4>
                                <div className="space-y-2">
                                    {unidad.clases.map(clase => (
                                        <div key={clase.num} className={`rounded-lg p-3 border ${currentUnidad === unidad.id && currentClase === clase.num ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
                                            {editingClase === `${unidad.id}-${clase.num}` ? (
                                                <div className="space-y-2">
                                                    <input type="text" value={clase.titulo}
                                                        onChange={(e) => updateClase(unidad.id, clase.num, 'titulo', e.target.value)}
                                                        className="w-full px-3 py-1 border rounded text-sm" />
                                                    <textarea value={clase.descripcion}
                                                        onChange={(e) => updateClase(unidad.id, clase.num, 'descripcion', e.target.value)}
                                                        className="w-full px-3 py-1 border rounded text-sm h-16" />
                                                    <button onClick={() => setEditingClase(null)}
                                                        className="text-xs bg-green-500 text-white px-3 py-1 rounded">Listo</button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-bold text-sm text-gray-800">{clase.emoji} Clase {clase.num}: {clase.titulo}</span>
                                                        <p className="text-xs text-gray-600 mt-1">{clase.descripcion}</p>
                                                    </div>
                                                    <button onClick={() => setEditingClase(`${unidad.id}-${clase.num}`)}
                                                        className="text-gray-400 hover:text-gray-600 text-xs ml-2">editar</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vocabulario */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-gray-800">Vocabulario ({unidad.vocabulario.length} terminos)</h4>
                                    <button onClick={() => setShowAddTermino(showAddTermino === unidad.id ? null : unidad.id)}
                                        className="text-sm bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600">
                                        + Agregar termino
                                    </button>
                                </div>
                                {showAddTermino === unidad.id && (
                                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                        <input type="text" placeholder="Termino" value={newTermino.termino}
                                            onChange={(e) => setNewTermino({ ...newTermino, termino: e.target.value })}
                                            className="w-full px-3 py-1 border rounded text-sm mb-2" />
                                        <textarea placeholder="Definicion" value={newTermino.definicion}
                                            onChange={(e) => setNewTermino({ ...newTermino, definicion: e.target.value })}
                                            className="w-full px-3 py-1 border rounded text-sm h-16 mb-2" />
                                        <button onClick={() => addVocabulario(unidad.id)}
                                            className="bg-green-500 text-white px-4 py-1 rounded text-sm">Agregar</button>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {unidad.vocabulario.map((v, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-bold text-sm text-indigo-700">{v.termino}</span>
                                                    <p className="text-xs text-gray-600 mt-1">{v.definicion.substring(0, 100)}...</p>
                                                </div>
                                                <button onClick={() => removeVocabulario(unidad.id, i)}
                                                    className="text-red-400 hover:text-red-600 text-xs ml-2">x</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
