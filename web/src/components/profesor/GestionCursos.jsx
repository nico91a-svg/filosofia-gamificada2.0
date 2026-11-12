// Panel docente para crear y configurar cursos (ediciones del juego).
import React from 'react';
import { CONTENT_PACKS, getContentPack } from '../../content/index.js';
import { PALETAS, getPaleta } from '../../data/cursos.js';
import { Icons } from '../shared/Icons.jsx';

const inputClass = 'input-pixel w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold';
const labelClass = 'block text-xs font-semibold uppercase text-arcane mb-1';

export function GestionCursos({ cursos, currentCursoId, onActivar, onAdd, onDuplicar, onUpdate, onDelete }) {
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-parchment">Gestión de cursos</h2>
                    <p className="text-sm text-arcane mt-1">
                        Cada curso es una edición independiente del juego, con sus propios estudiantes, progreso y contenido.
                    </p>
                </div>
                <button onClick={onAdd}
                    className="flex items-center gap-2 bg-arcane hover:bg-arcane/80 text-white font-bold py-2.5 px-4 rounded-none shadow transition">
                    <Icons.Plus size={16} /> Nuevo curso
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {cursos.map((c) => {
                    const paleta = getPaleta(c.paleta);
                    const pack = getContentPack(c.contentPackId);
                    const activo = c.id === currentCursoId;
                    return (
                        <div key={c.id} data-testid={'curso-' + c.id}
                            className="panel-pixel overflow-hidden">
                            <div className="h-3" style={{ background: paleta.card }}></div>
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-none grid place-items-center text-2xl shadow shrink-0" style={{ background: paleta.card }}>
                                            <span>{c.emoji}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-parchment truncate">{c.nombre} · {c.anio}</div>
                                            <div className="text-xs text-arcane truncate">{pack.nombre}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {activo && <span className="text-xs bg-emerald/20 text-emerald font-semibold px-2 py-1 rounded">ACTIVO</span>}
                                        {c.esDefault && <span className="text-xs bg-dungeon-800 text-arcane font-semibold px-2 py-1 rounded" title="Curso original: conserva las rutas históricas de la base de datos">ORIGINAL</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className={labelClass}>Nombre</label>
                                        <input type="text" value={c.nombre} aria-label="Nombre del curso"
                                            onChange={(e) => onUpdate(c.id, { nombre: e.target.value })} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Año</label>
                                        <input type="number" value={c.anio} aria-label="Año"
                                            onChange={(e) => onUpdate(c.id, { anio: parseInt(e.target.value, 10) || c.anio })} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Colegio</label>
                                        <input type="text" value={c.colegio || ''} aria-label="Colegio"
                                            onChange={(e) => onUpdate(c.id, { colegio: e.target.value })} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Emoji</label>
                                        <input type="text" value={c.emoji || ''} maxLength="4" aria-label="Emoji"
                                            onChange={(e) => onUpdate(c.id, { emoji: e.target.value })} className={inputClass} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className={labelClass}>Contenido</label>
                                    <select value={pack.id} aria-label="Pack de contenido"
                                        onChange={(e) => onUpdate(c.id, { contentPackId: e.target.value })} className={inputClass}>
                                        {CONTENT_PACKS.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}{p.borrador ? ' · borrador' : ''}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-arcane mt-1">{pack.descripcion}</p>
                                </div>

                                <div className="mb-3">
                                    <label className={labelClass}>Paleta</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PALETAS.map((p) => (
                                            <button key={p.id} type="button" title={p.label} aria-label={p.label}
                                                onClick={() => onUpdate(c.id, { paleta: p.id })}
                                                className={'h-8 w-14 rounded-md transition ' + (paleta.id === p.id ? 'ring-2 ring-gold ring-offset-2' : 'hover:scale-105')}
                                                style={{ background: p.card }}></button>
                                        ))}
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 text-sm text-parchment/90 cursor-pointer mb-4">
                                    <input type="checkbox" checked={c.activo !== false}
                                        onChange={(e) => onUpdate(c.id, { activo: e.target.checked })} />
                                    Visible en la pantalla de acceso
                                </label>

                                <div className="flex flex-wrap gap-2 pt-3 border-t">
                                    {!activo && (
                                        <button onClick={() => onActivar(c.id)}
                                            className="text-xs bg-arcane/15 hover:bg-indigo-900/50 text-indigo-300 font-semibold px-3 py-1.5 rounded-none transition">
                                            Activar
                                        </button>
                                    )}
                                    <button onClick={() => onDuplicar(c.id)}
                                        className="text-xs bg-dungeon-800 hover:bg-dungeon-600 text-parchment/90 font-semibold px-3 py-1.5 rounded-none transition">
                                        Duplicar configuración
                                    </button>
                                    {!c.esDefault && (
                                        <button onClick={() => onDelete(c.id)}
                                            className="text-xs bg-ruby/10 hover:bg-ruby/20 text-ruby font-semibold px-3 py-1.5 rounded-none transition ml-auto flex items-center gap-1">
                                            <Icons.Trash2 size={12} /> Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 bg-arcane/15 border border-indigo-900 rounded-none p-4 text-sm text-indigo-200">
                <div className="font-semibold mb-1">Cómo funcionan los cursos</div>
                <ul className="list-disc pl-5 space-y-1 text-indigo-300">
                    <li>Un curso nuevo empieza sin estudiantes: agrégalos en <strong>Estudiantes</strong> o importa un respaldo.</li>
                    <li>El <strong>contenido</strong> (unidades, clases y vocabulario) viene del pack elegido; puedes ajustarlo en <strong>Unidades</strong>.</li>
                    <li>&quot;Duplicar configuración&quot; copia nombre, paleta y contenido, no los estudiantes.</li>
                    <li>Los estudiantes eligen su curso al entrar; los cursos ocultos no aparecen en esa lista.</li>
                </ul>
            </div>
        </div>
    );
}
