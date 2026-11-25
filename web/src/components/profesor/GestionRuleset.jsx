// Editor de la "progresión de habilidades" (ruleset) de un curso.
// El docente parte de un preset y lo ajusta a la realidad etaria y de madurez:
// habilidades, niveles de dificultad y actividades (XP y habilidades que trabajan).
// Lo editado se guarda como progresión personalizada del curso.
import React from 'react';
import { rulesetEditable } from '../../domain/rulesets.js';
import { nextId } from '../../domain/ids.js';
import { Icons } from '../shared/Icons.jsx';

const { useState, useEffect } = React;

const inputClass = 'input-pixel w-full px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold';
const labelClass = 'block text-[11px] font-semibold uppercase text-arcane mb-1';
const NIVELES_XP = ['basico', 'competente', 'avanzado', 'excepcional'];
const NIVELES_XP_LABEL = { basico: 'Básico', competente: 'Competente', avanzado: 'Avanzado', excepcional: 'Excepcional' };

export function GestionRuleset({ cursoId, ruleset, esPersonalizado, onGuardar, onReset }) {
    const [draft, setDraft] = useState(() => rulesetEditable(ruleset));
    const [guardado, setGuardado] = useState(false);

    // Al cambiar de curso, o al entrar/salir del modo personalizado, recarga el
    // borrador desde la progresión efectiva actual.
    useEffect(() => {
        setDraft(rulesetEditable(ruleset));
        setGuardado(false);
    }, [cursoId, esPersonalizado]);

    const categorias = draft.categorias || [];

    // ---- helpers de edición (inmutables) ----
    const setCampo = (campo, valor) => setDraft((d) => ({ ...d, [campo]: valor }));

    const updHab = (id, campo, valor) =>
        setDraft((d) => ({ ...d, habilidades: d.habilidades.map((h) => h.id === id ? { ...h, [campo]: valor } : h) }));
    const addHab = () => setDraft((d) => ({
        ...d,
        habilidades: [...d.habilidades, { id: 'h' + nextId(), nombre: 'Nueva habilidad', shortName: 'Nueva', emoji: '⭐', color: '#9d6bd8', descripcion: '', comoMejora: '' }]
    }));
    const delHab = (id) => setDraft((d) => {
        const rh = {};
        for (const [tipo, mapa] of Object.entries(d.rubricsHabilidades || {})) {
            const limpio = {};
            for (const [hid, pts] of Object.entries(mapa || {})) if (hid !== id) limpio[hid] = pts;
            rh[tipo] = limpio;
        }
        return { ...d, habilidades: d.habilidades.filter((h) => h.id !== id), rubricsHabilidades: rh };
    });

    const updNivel = (idx, campo, valor) =>
        setDraft((d) => ({ ...d, habilidadNiveles: d.habilidadNiveles.map((n, i) => i === idx ? { ...n, [campo]: valor } : n) }));
    const addNivel = () => setDraft((d) => {
        const ultimo = d.habilidadNiveles[d.habilidadNiveles.length - 1];
        const nivel = (ultimo ? ultimo.nivel : 0) + 1;
        const min = (ultimo ? Number(ultimo.min) || 0 : 0) + 10;
        return { ...d, habilidadNiveles: [...d.habilidadNiveles, { nivel, nombre: 'Nivel ' + nivel, min, max: 9999 }] };
    });
    const delNivel = (idx) =>
        setDraft((d) => ({ ...d, habilidadNiveles: d.habilidadNiveles.filter((_, i) => i !== idx) }));

    const updTipo = (id, campo, valor) =>
        setDraft((d) => ({ ...d, tipos: d.tipos.map((t) => t.id === id ? { ...t, [campo]: valor } : t) }));
    const updTipoXP = (id, nivel, valor) =>
        setDraft((d) => ({ ...d, rubricsXP: { ...d.rubricsXP, [id]: { ...(d.rubricsXP[id] || {}), [nivel]: Number(valor) || 0 } } }));
    const updTipoHab = (id, habId, valor) =>
        setDraft((d) => ({ ...d, rubricsHabilidades: { ...d.rubricsHabilidades, [id]: { ...(d.rubricsHabilidades[id] || {}), [habId]: Number(valor) || 0 } } }));
    const addTipo = () => setDraft((d) => {
        const id = 't' + nextId();
        return {
            ...d,
            tipos: [...d.tipos, { id, nombre: 'Nueva actividad', icon: '📌', categoria: (categorias[0] && categorias[0].id) || 'cotidiana' }],
            rubricsXP: { ...d.rubricsXP, [id]: { basico: 10, competente: 20, avanzado: 30, excepcional: 40 } },
            rubricsHabilidades: { ...d.rubricsHabilidades, [id]: {} }
        };
    });
    const delTipo = (id) => setDraft((d) => {
        const xp = { ...d.rubricsXP }; delete xp[id];
        const rh = { ...d.rubricsHabilidades }; delete rh[id];
        return { ...d, tipos: d.tipos.filter((t) => t.id !== id), rubricsXP: xp, rubricsHabilidades: rh };
    });

    const guardar = () => {
        // Limpia los puntos de habilidad en 0 para no guardar ruido.
        const rh = {};
        for (const [tipo, mapa] of Object.entries(draft.rubricsHabilidades || {})) {
            const limpio = {};
            for (const [hid, pts] of Object.entries(mapa || {})) if (Number(pts) > 0) limpio[hid] = Number(pts);
            rh[tipo] = limpio;
        }
        onGuardar({ ...draft, rubricsHabilidades: rh });
        setGuardado(true);
    };

    // ---- modo no personalizado: invitar a personalizar ----
    if (!esPersonalizado) {
        return (
            <div>
                <Encabezado />
                <div className="panel-pixel p-6">
                    <div className="text-sm text-parchment/90 mb-1">
                        Este curso usa la progresión <strong>{ruleset.nombre}</strong>
                        {ruleset.grupoEtario ? ' · ' + ruleset.grupoEtario : ''}.
                    </div>
                    <p className="text-sm text-arcane mb-4">
                        {(ruleset.habilidades || []).length} habilidades · {(ruleset.tipos || []).length} tipos de actividad.
                        Para ajustarla a tu curso (habilidades, dificultad, actividades), personalízala. Partirás de una copia
                        de esta progresión y nadie más se ve afectado.
                    </p>
                    <button onClick={() => onGuardar(rulesetEditable(ruleset))}
                        className="flex items-center gap-2 bg-arcane hover:bg-arcane/80 text-white font-bold py-2.5 px-4 rounded-none shadow transition">
                        <Icons.Edit2 size={16} /> Personalizar esta progresión
                    </button>
                </div>
            </div>
        );
    }

    // ---- modo personalizado: editor ----
    return (
        <div>
            <Encabezado />

            <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={guardar}
                    className="flex items-center gap-2 bg-emerald hover:bg-emerald/80 text-white font-bold py-2 px-4 rounded-none transition">
                    <Icons.Check size={16} /> Guardar cambios
                </button>
                <button onClick={() => { if (confirm('¿Descartar los cambios no guardados y recargar?')) { setDraft(rulesetEditable(ruleset)); setGuardado(false); } }}
                    className="bg-dungeon-800 hover:bg-dungeon-600 text-parchment/90 font-semibold py-2 px-4 rounded-none transition">
                    Descartar cambios
                </button>
                <button onClick={() => { if (confirm('¿Volver al preset original y borrar la progresión personalizada de este curso?')) onReset(); }}
                    className="bg-ruby/10 hover:bg-ruby/20 text-ruby font-semibold py-2 px-4 rounded-none transition ml-auto">
                    Volver al preset
                </button>
            </div>
            {guardado && <p className="text-sm text-emerald mb-4" role="status">Cambios guardados. Se aplican a este curso.</p>}

            {/* Datos generales */}
            <section className="panel-pixel p-5 mb-5">
                <h3 className="font-bold text-parchment mb-3">Datos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Nombre</label>
                        <input className={inputClass} value={draft.nombre || ''} onChange={(e) => setCampo('nombre', e.target.value)} aria-label="Nombre de la progresión" />
                    </div>
                    <div>
                        <label className={labelClass}>Grupo etario</label>
                        <input className={inputClass} value={draft.grupoEtario || ''} onChange={(e) => setCampo('grupoEtario', e.target.value)} placeholder="Ej: 7° básico (12-13 años)" aria-label="Grupo etario" />
                    </div>
                </div>
            </section>

            {/* Habilidades */}
            <section className="panel-pixel p-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-parchment">Habilidades ({draft.habilidades.length})</h3>
                    <button onClick={addHab} className="flex items-center gap-1 text-xs bg-arcane/20 text-arcane font-semibold px-2.5 py-1.5 rounded-none"><Icons.Plus size={14} /> Agregar</button>
                </div>
                <div className="space-y-3">
                    {draft.habilidades.map((h) => (
                        <div key={h.id} className="bg-dungeon-800 p-3 rounded-none">
                            <div className="grid grid-cols-[3rem_1fr_1fr_auto] gap-2 items-end">
                                <div>
                                    <label className={labelClass}>Emoji</label>
                                    <input className={inputClass} value={h.emoji || ''} maxLength={3} onChange={(e) => updHab(h.id, 'emoji', e.target.value)} aria-label="Emoji de habilidad" />
                                </div>
                                <div>
                                    <label className={labelClass}>Nombre</label>
                                    <input className={inputClass} value={h.nombre || ''} onChange={(e) => updHab(h.id, 'nombre', e.target.value)} aria-label="Nombre de habilidad" />
                                </div>
                                <div>
                                    <label className={labelClass}>Nombre corto</label>
                                    <input className={inputClass} value={h.shortName || ''} onChange={(e) => updHab(h.id, 'shortName', e.target.value)} aria-label="Nombre corto" />
                                </div>
                                <button onClick={() => { if (confirm('¿Quitar la habilidad "' + h.nombre + '"?')) delHab(h.id); }}
                                    className="text-ruby hover:bg-ruby/20 p-2 rounded-none" aria-label="Quitar habilidad"><Icons.Trash2 size={16} /></button>
                            </div>
                            <div className="mt-2">
                                <label className={labelClass}>Descripción</label>
                                <input className={inputClass} value={h.descripcion || ''} onChange={(e) => updHab(h.id, 'descripcion', e.target.value)} aria-label="Descripción de habilidad" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Niveles de dificultad */}
            <section className="panel-pixel p-5 mb-5">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-parchment">Niveles de dificultad</h3>
                    <button onClick={addNivel} className="flex items-center gap-1 text-xs bg-arcane/20 text-arcane font-semibold px-2.5 py-1.5 rounded-none"><Icons.Plus size={14} /> Agregar</button>
                </div>
                <p className="text-xs text-arcane mb-3">Puntos mínimos para alcanzar cada nivel en una habilidad. Para un curso más joven, usa umbrales más bajos.</p>
                <div className="space-y-2">
                    {draft.habilidadNiveles.map((n, i) => (
                        <div key={i} className="grid grid-cols-[1fr_7rem_auto] gap-2 items-end bg-dungeon-800 p-2 rounded-none">
                            <div>
                                <label className={labelClass}>Nombre del nivel</label>
                                <input className={inputClass} value={n.nombre || ''} onChange={(e) => updNivel(i, 'nombre', e.target.value)} aria-label="Nombre del nivel" />
                            </div>
                            <div>
                                <label className={labelClass}>Puntos mín.</label>
                                <input type="number" min="0" className={inputClass} value={n.min} onChange={(e) => updNivel(i, 'min', Number(e.target.value) || 0)} aria-label="Puntos mínimos" />
                            </div>
                            <button onClick={() => delNivel(i)} className="text-ruby hover:bg-ruby/20 p-2 rounded-none" aria-label="Quitar nivel"><Icons.Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tipos de actividad */}
            <section className="panel-pixel p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-parchment">Actividades ({draft.tipos.length})</h3>
                    <button onClick={addTipo} className="flex items-center gap-1 text-xs bg-arcane/20 text-arcane font-semibold px-2.5 py-1.5 rounded-none"><Icons.Plus size={14} /> Agregar</button>
                </div>
                <div className="space-y-4">
                    {draft.tipos.map((t) => (
                        <div key={t.id} className="bg-dungeon-800 p-3 rounded-none">
                            <div className="grid grid-cols-[3rem_1fr_1fr_auto] gap-2 items-end">
                                <div>
                                    <label className={labelClass}>Icono</label>
                                    <input className={inputClass} value={t.icon || ''} maxLength={3} onChange={(e) => updTipo(t.id, 'icon', e.target.value)} aria-label="Icono de actividad" />
                                </div>
                                <div>
                                    <label className={labelClass}>Nombre</label>
                                    <input className={inputClass} value={t.nombre || ''} onChange={(e) => updTipo(t.id, 'nombre', e.target.value)} aria-label="Nombre de actividad" />
                                </div>
                                <div>
                                    <label className={labelClass}>Categoría</label>
                                    <select className={inputClass} value={t.categoria} onChange={(e) => updTipo(t.id, 'categoria', e.target.value)} aria-label="Categoría">
                                        {categorias.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>)}
                                    </select>
                                </div>
                                <button onClick={() => { if (confirm('¿Quitar la actividad "' + t.nombre + '"?')) delTipo(t.id); }}
                                    className="text-ruby hover:bg-ruby/20 p-2 rounded-none" aria-label="Quitar actividad"><Icons.Trash2 size={16} /></button>
                            </div>

                            <div className="mt-3">
                                <label className={labelClass}>XP por desempeño</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {NIVELES_XP.map((nv) => (
                                        <div key={nv}>
                                            <div className="text-[10px] text-arcane mb-0.5">{NIVELES_XP_LABEL[nv]}</div>
                                            <input type="number" min="0" className={inputClass}
                                                value={(draft.rubricsXP[t.id] && draft.rubricsXP[t.id][nv]) || 0}
                                                onChange={(e) => updTipoXP(t.id, nv, e.target.value)} aria-label={'XP ' + NIVELES_XP_LABEL[nv]} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className={labelClass}>Habilidades que trabaja (+puntos)</label>
                                <div className="flex flex-wrap gap-2">
                                    {draft.habilidades.map((h) => (
                                        <label key={h.id} className="flex items-center gap-1 bg-dungeon-700 px-2 py-1 rounded-none text-xs">
                                            <span>{h.emoji} {h.shortName || h.nombre}</span>
                                            <input type="number" min="0" className="input-pixel w-14 px-1 py-0.5 text-xs"
                                                value={(draft.rubricsHabilidades[t.id] && draft.rubricsHabilidades[t.id][h.id]) || 0}
                                                onChange={(e) => updTipoHab(t.id, h.id, e.target.value)} aria-label={'Puntos de ' + (h.nombre) + ' en ' + t.nombre} />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function Encabezado() {
    return (
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-parchment">Progresión de habilidades</h2>
            <p className="text-sm text-arcane mt-1">
                Ajusta las habilidades, la dificultad y las actividades a la edad y madurez de tu curso.
                Los cambios son de este curso y no afectan a los demás.
            </p>
        </div>
    );
}
