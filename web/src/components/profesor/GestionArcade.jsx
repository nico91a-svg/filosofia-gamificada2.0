// Panel docente para curar la biblioteca de juegos/recursos externos (Arcade).
// El docente agrega, edita y borra enlaces; los estudiantes solo los ven.
import React from 'react';
import { HABILIDADES } from '../../domain/habilidades.js';
import {
    ARCADE_MAX_DESCRIPCION, ARCADE_MAX_TITULO, crearEnlace, normalizeEnlace, urlSegura
} from '../../domain/arcade.js';
import { Icons } from '../shared/Icons.jsx';

const { useState } = React;

const inputClass = 'input-pixel w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold';
const labelClass = 'block text-xs font-semibold uppercase text-arcane mb-1';

const DRAFT_VACIO = { id: null, titulo: '', url: '', descripcion: '', habilidadId: '', unidadId: '' };

export function GestionArcade({ enlaces, unidades, onSave, onDelete }) {
    const [draft, setDraft] = useState(null); // null = sin editor abierto
    const [error, setError] = useState('');

    const lista = Array.isArray(enlaces) ? enlaces : [];

    const abrirNuevo = () => { setError(''); setDraft({ ...DRAFT_VACIO }); };
    const abrirEditar = (e) => {
        setError('');
        setDraft({ id: e.id, titulo: e.titulo, url: e.url, descripcion: e.descripcion,
            habilidadId: e.habilidadId || '', unidadId: e.unidadId || '' });
    };
    const cerrar = () => { setDraft(null); setError(''); };

    const guardar = () => {
        if (!draft.titulo.trim()) { setError('Ponle un título al juego.'); return; }
        if (!urlSegura(draft.url)) {
            setError('El enlace no es válido. Debe empezar con http:// o https:// y apuntar a un sitio real.');
            return;
        }
        onSave(normalizeEnlace({
            id: draft.id != null ? draft.id : crearEnlace().id,
            titulo: draft.titulo, url: draft.url, descripcion: draft.descripcion,
            habilidadId: draft.habilidadId || null, unidadId: draft.unidadId || null
        }));
        cerrar();
    };

    const set = (campo) => (e) => setDraft((d) => ({ ...d, [campo]: e.target.value }));

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-parchment">Arcade</h2>
                    <p className="text-sm text-arcane mt-1">
                        Enlaces a juegos y recursos que suman a la clase. Los estudiantes los ven en su sección <strong>Arcade</strong> y se abren en una pestaña nueva.
                    </p>
                </div>
                {!draft && (
                    <button onClick={abrirNuevo}
                        className="flex items-center gap-2 bg-arcane hover:bg-arcane/80 text-white font-bold py-2.5 px-4 rounded-none shadow transition">
                        <Icons.Plus size={16} /> Nuevo enlace
                    </button>
                )}
            </div>

            {draft && (
                <div className="panel-pixel p-5 mb-6" data-testid="arcade-editor">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Título</label>
                            <input type="text" value={draft.titulo} onChange={set('titulo')} maxLength={ARCADE_MAX_TITULO}
                                placeholder="Ej: El dilema del tranvía (juego interactivo)" className={inputClass} aria-label="Título del juego" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Enlace (URL)</label>
                            <input type="url" inputMode="url" value={draft.url} onChange={set('url')}
                                placeholder="https://..." className={inputClass} aria-label="Enlace del juego" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Descripción (opcional)</label>
                            <textarea value={draft.descripcion} onChange={set('descripcion')} maxLength={ARCADE_MAX_DESCRIPCION}
                                rows={2} placeholder="¿Qué trabaja este juego? ¿Cómo lo usan?" className={inputClass} aria-label="Descripción" />
                        </div>
                        <div>
                            <label className={labelClass}>Habilidad (opcional)</label>
                            <select value={draft.habilidadId} onChange={set('habilidadId')} className={inputClass} aria-label="Habilidad relacionada">
                                <option value="">— Ninguna —</option>
                                {HABILIDADES.map((h) => <option key={h.id} value={h.id}>{h.emoji} {h.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Unidad (opcional)</label>
                            <select value={draft.unidadId} onChange={set('unidadId')} className={inputClass} aria-label="Unidad relacionada">
                                <option value="">— Ninguna —</option>
                                {(unidades || []).map((u) => <option key={u.id} value={u.id}>{u.emoji} {u.id} · {u.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-sm text-ruby mt-3" role="alert">{error}</p>}

                    <div className="flex gap-2 mt-4">
                        <button onClick={guardar}
                            className="flex items-center gap-2 bg-emerald hover:bg-emerald/80 text-white font-bold py-2 px-4 rounded-none transition">
                            <Icons.Check size={16} /> Guardar
                        </button>
                        <button onClick={cerrar}
                            className="bg-dungeon-800 hover:bg-dungeon-600 text-parchment/90 font-semibold py-2 px-4 rounded-none transition">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {lista.length === 0 && !draft ? (
                <div className="panel-pixel p-8 text-center text-arcane/70">
                    Aún no hay juegos en el Arcade. Agrega el primero con <strong>Nuevo enlace</strong>.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {lista.map((e) => {
                        const hab = HABILIDADES.find((h) => h.id === e.habilidadId);
                        const uni = (unidades || []).find((u) => u.id === e.unidadId);
                        const valido = !!urlSegura(e.url);
                        return (
                            <div key={e.id} className="panel-pixel p-5" data-testid={'arcade-item-' + e.id}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="font-bold text-parchment min-w-0 break-words">{e.titulo}</div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => abrirEditar(e)} aria-label="Editar"
                                            className="text-xs bg-dungeon-800 hover:bg-dungeon-600 text-parchment/90 font-semibold p-1.5 rounded-none transition">
                                            <Icons.Edit2 size={14} />
                                        </button>
                                        <button onClick={() => { if (confirm('¿Eliminar "' + e.titulo + '" del Arcade?')) onDelete(e.id); }}
                                            aria-label="Eliminar"
                                            className="text-xs bg-ruby/10 hover:bg-ruby/20 text-ruby font-semibold p-1.5 rounded-none transition">
                                            <Icons.Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                {e.descripcion && <p className="text-sm text-arcane mb-2 break-words">{e.descripcion}</p>}
                                {valido ? (
                                    <a href={urlSegura(e.url)} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-indigo-300 hover:text-indigo-200 underline break-all">
                                        {e.url}
                                    </a>
                                ) : (
                                    <span className="text-xs text-ruby">⚠ Enlace no válido: edítalo para corregirlo.</span>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {hab && <span className="text-xs bg-arcane/20 text-arcane font-semibold px-2 py-1 rounded">{hab.emoji} {hab.nombre}</span>}
                                    {uni && <span className="text-xs bg-dungeon-800 text-parchment/80 font-semibold px-2 py-1 rounded">{uni.emoji} {uni.id}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
