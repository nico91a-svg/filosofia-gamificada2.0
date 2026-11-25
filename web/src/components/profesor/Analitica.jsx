// Analítica del curso para el docente: números clave, distribución de niveles,
// mapa de calor de habilidades, progreso en el tiempo, actividades por unidad y
// alerta de rezago. Gráficos livianos (barras CSS + una línea SVG), sin
// librerías externas. "Imprimir" permite guardar un PDF para el portafolio.
import React from 'react';
import { NIVELES, getNivel } from '../../domain/niveles.js';
import { Icons } from '../shared/Icons.jsx';

const { useMemo } = React;
const DIA = 24 * 60 * 60 * 1000;

function lunesDe(fecha) {
    const d = new Date(fecha);
    if (isNaN(d)) return null;
    d.setHours(0, 0, 0, 0);
    const dow = (d.getDay() + 6) % 7; // 0 = lunes
    d.setDate(d.getDate() - dow);
    return d;
}

const fmtFecha = (ms) => new Date(ms).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });

export function Analitica({ students, activities, unidades, ruleset }) {
    const habilidades = (ruleset && ruleset.habilidades) || [];
    const getNivelHab = (ruleset && ruleset.getHabilidadNivel) || (() => 1);
    const maxNivelHab = ((ruleset && ruleset.habilidadNiveles) ? ruleset.habilidadNiveles.length : 5);

    const stats = useMemo(() => {
        const n = students.length;
        const totalXP = students.reduce((s, e) => s + (e.xp || 0), 0);
        const avgXP = n ? Math.round(totalXP / n) : 0;
        const avgLevel = n ? (students.reduce((s, e) => s + getNivel(e.xp || 0).nivel, 0) / n).toFixed(1) : '0';
        const ahora = Date.now();
        const fechas = {}; // studentId -> última fecha (ms)
        let ultimos7 = 0;
        for (const a of activities) {
            const t = a.date ? new Date(a.date).getTime() : NaN;
            if (isNaN(t)) continue;
            if (ahora - t <= 7 * DIA) ultimos7 += 1;
            if (!fechas[a.studentId] || t > fechas[a.studentId]) fechas[a.studentId] = t;
        }
        const activos14 = students.filter((e) => fechas[e.id] && ahora - fechas[e.id] <= 14 * DIA).length;
        return { n, avgXP, avgLevel, totalAct: activities.length, ultimos7, activos14, fechas };
    }, [students, activities]);

    // Distribución por nivel de XP.
    const distNiveles = useMemo(() => {
        const cuenta = {};
        for (const e of students) {
            const nv = getNivel(e.xp || 0).nivel;
            cuenta[nv] = (cuenta[nv] || 0) + 1;
        }
        const max = Math.max(1, ...Object.values(cuenta));
        return NIVELES.filter((nv) => cuenta[nv.nivel]).map((nv) => ({
            label: 'Nv.' + nv.nivel + ' ' + nv.titulo, value: cuenta[nv.nivel] || 0, max
        }));
    }, [students]);

    // Actividades por unidad.
    const porUnidad = useMemo(() => {
        const cuenta = {};
        for (const a of activities) cuenta[a.unidadId] = (cuenta[a.unidadId] || 0) + 1;
        const max = Math.max(1, ...Object.values(cuenta));
        return unidades.map((u) => ({ label: (u.emoji || '') + ' ' + u.id, nombre: u.nombre, value: cuenta[u.id] || 0, max }))
            .filter((r) => r.value > 0);
    }, [activities, unidades]);

    // Progreso: actividades por semana (hasta 8 semanas con datos).
    const porSemana = useMemo(() => {
        const cuenta = new Map();
        for (const a of activities) {
            const l = lunesDe(a.date);
            if (!l) continue;
            const k = l.getTime();
            cuenta.set(k, (cuenta.get(k) || 0) + 1);
        }
        const keys = [...cuenta.keys()].sort((x, y) => x - y).slice(-8);
        return keys.map((k) => ({ x: k, value: cuenta.get(k) }));
    }, [activities]);

    // Rezago: sin actividad en 14 días (o sin registros), ordenado por antigüedad.
    const rezago = useMemo(() => {
        const ahora = Date.now();
        return students
            .map((e) => ({ e, ultima: stats.fechas[e.id] || 0 }))
            .filter((r) => !r.ultima || ahora - r.ultima > 14 * DIA)
            .sort((a, b) => a.ultima - b.ultima);
    }, [students, stats.fechas]);

    const heatStudents = useMemo(
        () => [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0)),
        [students]);

    if (!students.length) {
        return (
            <div>
                <Cabecera />
                <div className="panel-pixel p-8 text-center text-arcane/70">
                    Este curso aún no tiene estudiantes. Agrega estudiantes y registra actividades para ver estadísticas.
                </div>
            </div>
        );
    }

    return (
        <div>
            <Cabecera />

            {/* Números clave */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <Tile valor={stats.n} etiqueta="Estudiantes" />
                <Tile valor={stats.avgXP} etiqueta="XP promedio" />
                <Tile valor={stats.avgLevel} etiqueta="Nivel promedio" />
                <Tile valor={stats.totalAct} etiqueta="Actividades" />
                <Tile valor={stats.ultimos7} etiqueta="Últimos 7 días" />
                <Tile valor={stats.n ? Math.round((stats.activos14 / stats.n) * 100) + '%' : '0%'} etiqueta="Activos (14 días)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Distribución de niveles */}
                <Panel titulo="Distribución por nivel">
                    {distNiveles.length ? <Barras items={distNiveles} color="#9d6bd8" /> : <Vacio />}
                </Panel>

                {/* Progreso en el tiempo */}
                <Panel titulo="Actividades por semana">
                    {porSemana.length ? <LineaArea puntos={porSemana} /> : <Vacio texto="Aún no hay actividades con fecha." />}
                </Panel>

                {/* Actividades por unidad */}
                <Panel titulo="Actividades por unidad">
                    {porUnidad.length ? <Barras items={porUnidad} color="#10b981" /> : <Vacio />}
                </Panel>

                {/* Rezago */}
                <Panel titulo={'Necesitan seguimiento (' + rezago.length + ')'}>
                    {rezago.length === 0 ? (
                        <p className="text-sm text-emerald">Toda la clase registró actividad en los últimos 14 días. 🎉</p>
                    ) : (
                        <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                            {rezago.map(({ e, ultima }) => (
                                <li key={e.id} className="flex items-center justify-between text-sm bg-dungeon-800 px-3 py-2 rounded-none">
                                    <span className="text-parchment/90 truncate">{e.nombreSocial || e.nombre}</span>
                                    <span className="text-xs text-arcane shrink-0 ml-2">
                                        {ultima ? 'última: ' + fmtFecha(ultima) : 'sin registros'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            {/* Mapa de calor de habilidades */}
            <Panel titulo="Mapa de calor de habilidades" className="mt-5">
                {habilidades.length ? (
                    <Heatmap students={heatStudents} habilidades={habilidades} getNivelHab={getNivelHab} maxNivel={maxNivelHab} />
                ) : <Vacio />}
            </Panel>
        </div>
    );
}

function Cabecera() {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
                <h2 className="text-2xl font-bold text-parchment">Analítica</h2>
                <p className="text-sm text-arcane mt-1">Una mirada rápida al avance del curso. Pasa el cursor por el mapa de calor para ver el detalle.</p>
            </div>
            <button onClick={() => window.print()}
                className="flex items-center gap-2 bg-dungeon-800 hover:bg-dungeon-600 text-parchment/90 font-semibold py-2 px-4 rounded-none transition print:hidden">
                <Icons.Download size={16} /> Imprimir / Guardar PDF
            </button>
        </div>
    );
}

const Tile = ({ valor, etiqueta }) => (
    <div className="panel-pixel p-4">
        <div className="text-2xl font-bold text-parchment">{valor}</div>
        <div className="text-xs text-arcane mt-0.5">{etiqueta}</div>
    </div>
);

const Panel = ({ titulo, children, className = '' }) => (
    <section className={'panel-pixel p-5 ' + className}>
        <h3 className="font-bold text-parchment mb-3">{titulo}</h3>
        {children}
    </section>
);

const Vacio = ({ texto = 'Sin datos todavía.' }) => <p className="text-sm text-arcane/70">{texto}</p>;

// Barras horizontales (CSS): robustas y nítidas para etiquetas largas.
const Barras = ({ items, color }) => (
    <div className="space-y-2">
        {items.map((it, i) => (
            <div key={i}>
                <div className="flex justify-between text-xs text-parchment/90 mb-0.5">
                    <span className="truncate pr-2" title={it.nombre || it.label}>{it.label}</span>
                    <span className="text-arcane shrink-0">{it.value}</span>
                </div>
                <div className="h-2.5 bg-dungeon-800 rounded-none overflow-hidden">
                    <div className="h-full rounded-none" style={{ width: Math.round((it.value / it.max) * 100) + '%', background: color }} />
                </div>
            </div>
        ))}
    </div>
);

// Línea/área de una serie temporal pequeña (SVG).
const LineaArea = ({ puntos }) => {
    const w = 520, h = 140, pad = 24;
    const max = Math.max(1, ...puntos.map((p) => p.value));
    const n = puntos.length;
    const x = (i) => pad + (n <= 1 ? (w - 2 * pad) / 2 : (i * (w - 2 * pad)) / (n - 1));
    const y = (v) => h - pad - (v / max) * (h - 2 * pad);
    const linea = puntos.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
    const area = `${pad},${h - pad} ${linea} ${x(n - 1)},${h - pad}`;
    return (
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Actividades por semana">
            <polygon points={area} fill="rgba(157,107,216,0.18)" />
            <polyline points={linea} fill="none" stroke="#9d6bd8" strokeWidth="2.5" />
            {puntos.map((p, i) => (
                <g key={i}>
                    <circle cx={x(i)} cy={y(p.value)} r="4" fill="#f2c33d">
                        <title>{`Semana del ${fmtFecha(p.x)}: ${p.value} actividades`}</title>
                    </circle>
                    <text x={x(i)} y={h - 6} textAnchor="middle" style={{ fontSize: '9px', fill: '#9d6bd8' }}>{fmtFecha(p.x)}</text>
                </g>
            ))}
        </svg>
    );
};

// Mapa de calor estudiantes × habilidades (CSS grid). Celda = nivel de habilidad.
const Heatmap = ({ students, habilidades, getNivelHab, maxNivel }) => {
    const cols = '9rem repeat(' + habilidades.length + ', minmax(2rem, 1fr))';
    const colorDe = (nivel) => {
        const r = Math.max(0, Math.min(1, (nivel - 1) / Math.max(1, maxNivel - 1)));
        return `rgba(157,107,216,${(0.12 + 0.68 * r).toFixed(3)})`;
    };
    return (
        <div className="overflow-x-auto">
            <div style={{ minWidth: 'max-content' }}>
                <div className="grid gap-1 mb-1 items-end" style={{ gridTemplateColumns: cols }}>
                    <div />
                    {habilidades.map((h) => (
                        <div key={h.id} className="text-center text-xs text-arcane" title={h.nombre}>{h.emoji}</div>
                    ))}
                </div>
                {students.map((e) => (
                    <div key={e.id} className="grid gap-1 mb-1 items-center" style={{ gridTemplateColumns: cols }}>
                        <div className="text-xs text-parchment/90 truncate pr-1" title={e.nombreSocial || e.nombre}>{e.nombreSocial || e.nombre}</div>
                        {habilidades.map((h) => {
                            const pts = (e.habilidades && e.habilidades[h.id]) || 0;
                            const nv = getNivelHab(pts);
                            return (
                                <div key={h.id} className="h-7 rounded-none grid place-items-center text-[10px] font-semibold text-parchment"
                                    style={{ background: colorDe(nv) }} title={`${e.nombreSocial || e.nombre} · ${h.nombre}: nivel ${nv} (${pts} pts)`}>
                                    {nv}
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div className="flex items-center gap-2 mt-2 text-[11px] text-arcane">
                    <span>Menos</span>
                    {Array.from({ length: maxNivel }).map((_, i) => (
                        <span key={i} className="w-5 h-3 rounded-none" style={{ background: `rgba(157,107,216,${(0.12 + 0.68 * (i / Math.max(1, maxNivel - 1))).toFixed(3)})` }} />
                    ))}
                    <span>Más</span>
                </div>
            </div>
        </div>
    );
};
