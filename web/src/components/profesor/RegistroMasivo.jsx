import React from 'react';
import { CATEGORIAS_ACTIVIDAD, RUBRICS_HABILIDADES, RUBRICS_XP, TIPOS_ACTIVIDAD } from '../../domain/tipos-actividad.js';
import { CLASES_FILOSOFICAS } from '../../domain/clases-filosoficas.js';
import { COFRES, getCofre } from '../../domain/artefactos.js';
import { PixelSprite } from '../pixel/PixelSprite.jsx';
import { catIcon } from '../pixel/icons.js';

// Registro masivo de actividades
export const RegistroMasivo = ({ students, unidades, addActivity, setStudents, activities, unidadActual, claseActual }) => {
    const { useState } = React;
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [tipo, setTipo] = useState('');
    const [nivel, setNivel] = useState('competente');
    // Por defecto, la unidad y clase en curso (antes siempre U1 / clase 1).
    const [unidadId, setUnidadId] = useState(unidadActual || (unidades[0] ? unidades[0].id : 'U1'));
    const [claseNum, setClaseNum] = useState(claseActual || 1);
    const [notas, setNotas] = useState('');
    const [nivelIndividual, setNivelIndividual] = useState(false);
    const [nivelesIndividuales, setNivelesIndividuales] = useState({});
    const [vocabularioTerminos, setVocabularioTerminos] = useState([]);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [registroCount, setRegistroCount] = useState(0);

    const tiposActividad = TIPOS_ACTIVIDAD;
    const categorias = CATEGORIAS_ACTIVIDAD || [];
    const rubrics = RUBRICS_XP;
    const currentUnidad = unidades.find(u => u.id === unidadId);
    const xpBase = rubrics[tipo]?.[nivel] || 0;
    const tipoSeleccionado = tiposActividad.find(t => t.id === tipo);
    const categoriaActual = tipoSeleccionado ? (categorias.find(c => c.id === tipoSeleccionado.categoria) || null) : null;
    const cofreInfo = tipo ? getCofre(tipo, nivel) : null;

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

        const registrados = selectedStudents.length;

        selectedStudents.forEach(studentId => {
            const studentNivel = nivelIndividual ? (nivelesIndividuales[studentId] || nivel) : nivel;
            const xp = rubrics[tipo]?.[studentNivel] || 0;
            addActivity({
                studentId,
                tipo,
                categoria: tipoSeleccionado ? tipoSeleccionado.categoria : 'cotidiana',
                nivel: studentNivel,
                xp,
                unidadId,
                claseNum,
                notas,
                habilidades: RUBRICS_HABILIDADES[tipo] || {}
            });
        });

        // Otorgar vocabulario si se seleccionaron terminos
        if (vocabularioTerminos.length > 0 && setStudents) {
            setStudents(prev => prev.map(s => {
                if (!selectedStudents.includes(s.id)) return s;
                var vocab = s.vocabularioDescubierto || [];
                var nuevos = vocabularioTerminos.filter(t => !vocab.includes(t));
                if (nuevos.length === 0) return s;
                return { ...s, vocabularioDescubierto: vocab.concat(nuevos) };
            }));
        }

        setRegistroExitoso(true);
        setRegistroCount(registrados);
        setTimeout(() => setRegistroExitoso(false), 3000);
        setSelectedStudents([]);
        setTipo('');
        setNotas('');
        setVocabularioTerminos([]);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-parchment">Registro Masivo de Actividades</h2>
            <p className="text-arcane">Registra actividades para multiples estudiantes a la vez. Ideal para participacion en clase y actividades grupales.</p>

            {registroExitoso && (
                <div className="bg-emerald/20 border border-emerald text-emerald px-4 py-3 rounded-none">
                    Actividades registradas exitosamente para {registroCount} estudiante{registroCount !== 1 ? 's' : ''}.
                </div>
            )}

            {/* Configuracion de actividad */}
            <div className="panel-pixel p-6">
                <h3 className="text-lg font-bold text-parchment mb-4">Configuracion de la Actividad</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Unidad</label>
                        <select value={unidadId} onChange={(e) => { setUnidadId(e.target.value); setClaseNum(1); }}
                            className="input-pixel w-full px-4 py-2">
                            {unidades.map(u => <option key={u.id} value={u.id}>{u.emoji} {u.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Clase</label>
                        <select value={claseNum} onChange={(e) => setClaseNum(Number(e.target.value))}
                            className="input-pixel w-full px-4 py-2">
                            {(currentUnidad?.clases || []).map(c => (
                                <option key={c.num} value={c.num}>Clase {c.num}: {c.titulo.substring(0, 35)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Tipo de Actividad</label>
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                            className="input-pixel w-full px-4 py-2">
                            <option value="">Seleccionar...</option>
                            {categorias.map(cat => (
                                <optgroup key={cat.id} label={cat.emoji + ' ' + cat.nombre}>
                                    {tiposActividad.filter(t => t.categoria === cat.id).map(t =>
                                        <option key={t.id} value={t.id}>{t.icon} {t.nombre}</option>
                                    )}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Nivel de Desempeno {!nivelIndividual && <span className="text-arcane/70">(para todos)</span>}
                        </label>
                        <div className="flex gap-2">
                            <select value={nivel} onChange={(e) => setNivel(e.target.value)}
                                className="flex-1 input-pixel px-4 py-2" disabled={nivelIndividual}>
                                <option value="basico">Basico</option>
                                <option value="competente">Competente</option>
                                <option value="avanzado">Avanzado</option>
                                <option value="excepcional">Excepcional</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs text-arcane cursor-pointer">
                                <input type="checkbox" checked={nivelIndividual}
                                    onChange={(e) => setNivelIndividual(e.target.checked)} />
                                Individual
                            </label>
                        </div>
                    </div>
                </div>
                {tipo && !nivelIndividual && (
                    <div className="mt-4 bg-arcane/10 rounded-none p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span className="text-sm text-arcane">XP por estudiante: </span>
                                <span className="text-2xl font-bold text-gold">{xpBase} XP</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {categoriaActual && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                                        categoriaActual.id === 'cotidiana' ? 'bg-dungeon-600 text-arcane' :
                                        categoriaActual.id === 'proceso' ? 'bg-gold/15 text-gold' :
                                        'bg-blue-950/60 text-blue-300'
                                    }`}>
                                        {catIcon(categoriaActual.id)
                                            ? <PixelSprite sprite={catIcon(categoriaActual.id)} size={14} />
                                            : categoriaActual.emoji}{' '}
                                        {categoriaActual.nombre}
                                    </span>
                                )}
                                {cofreInfo && (
                                    <span className="px-2 py-1 rounded-full bg-gold/15 text-gold text-xs font-semibold">
                                        {COFRES[cofreInfo].emoji} {COFRES[cofreInfo].nombre}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                    placeholder="Notas adicionales (opcional)" className="input-pixel w-full px-4 py-2 mt-4 h-16" />

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
                                            ? 'bg-arcane/150 text-white'
                                            : 'bg-dungeon-800 text-parchment/90 hover:bg-dungeon-600'
                                    }`}>
                                    {v.termino}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Seleccion de estudiantes */}
            <div className="panel-pixel p-6">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-parchment">
                        Estudiantes ({selectedStudents.length}/{students.length} seleccionados)
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={selectAll} className="text-sm bg-indigo-950/60 text-indigo-300 px-3 py-1 rounded hover:bg-indigo-900/60">
                            Todos
                        </button>
                        <button onClick={selectNone} className="text-sm bg-dungeon-800 text-parchment/90 px-3 py-1 rounded hover:bg-dungeon-600">
                            Ninguno
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {students.map(student => {
                        const isSelected = selectedStudents.includes(student.id);
                        const clase = CLASES_FILOSOFICAS.find(c => c.id === student.clase);
                        return (
                            <div key={student.id}
                                onClick={() => toggleStudent(student.id)}
                                className={`p-3 rounded-none border-2 cursor-pointer transition ${
                                    isSelected ? 'border-gold bg-arcane/15' : 'border-stone-dark hover:border-stone'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={isSelected} onChange={() => {}} className="pointer-events-none" />
                                    <div className="flex-1">
                                        <span className="font-semibold text-sm text-parchment">{student.nombre}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${clase?.color}`}>
                                                {clase?.emoji} {clase?.nombre}
                                            </span>
                                            <span className="text-xs text-arcane">{student.xp} XP</span>
                                            {tipo === 'participacion' && (() => {
                                                var hoy = new Date().toISOString().split('T')[0];
                                                var count = (activities || []).filter(a =>
                                                    a.studentId === student.id &&
                                                    a.tipo === 'participacion' &&
                                                    a.date && a.date.split('T')[0] === hoy
                                                ).length;
                                                return count >= 2 ? (
                                                    <span className="text-xs text-gold font-semibold ml-2">⚠️ {count}/2 hoy</span>
                                                ) : count > 0 ? (
                                                    <span className="text-xs text-arcane/70 ml-2">{count}/2 hoy</span>
                                                ) : null;
                                            })()}
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
                className={`w-full py-4 rounded-none font-bold text-lg transition ${
                    selectedStudents.length > 0 && tipo
                        ? 'bg-emerald hover:bg-emerald/80 text-white'
                        : 'bg-dungeon-600 text-arcane cursor-not-allowed'
                }`}>
                Registrar Actividad para {selectedStudents.length} estudiante{selectedStudents.length !== 1 ? 's' : ''}
            </button>
        </div>
    );
};
