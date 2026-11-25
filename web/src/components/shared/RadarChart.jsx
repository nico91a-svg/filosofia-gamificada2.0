import React from 'react';
import { HABILIDADES, getHabilidadNivel as getHabilidadNivelDefault } from '../../domain/habilidades.js';

// Gráfico de radar para habilidades filosóficas.
//
// Props:
//  - student: estudiante cuyo polígono se dibuja (lee student.habilidades[id]).
//  - habilidades, getHabilidadNivel: del ruleset del curso (con respaldo).
//  - maxLevel: cuántos anillos/niveles tiene la escala (según el ruleset). 5 por defecto.
//  - compare: polígonos extra superpuestos, p. ej. el promedio del curso:
//      [{ label, habilidades: { id: puntos }, color }]
//  - animate: animación de entrada (desactívala en capturas/tests si molesta).
//
// Soporta dark mode (dashboard estudiante) y light mode (modal profesor).
export const RadarChart = ({
    student, darkMode, habilidades = HABILIDADES, getHabilidadNivel = getHabilidadNivelDefault,
    maxLevel = 5, compare = [], animate = true
}) => {
    const size = 280;
    const center = size / 2;
    const maxRadius = size / 2 - 45;
    const levels = Math.max(1, maxLevel);
    const n = habilidades.length || 1;

    const getPoint = (index, value) => {
        const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
        const radius = (maxRadius * value) / levels;
        return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
    };

    const gridColor = darkMode ? 'rgba(107,95,163,0.4)' : 'rgba(107,95,163,0.35)';
    const fillColor = 'rgba(157, 107, 216, 0.35)';
    const strokeColor = '#9d6bd8';
    const dotColor = '#f2c33d';

    const levelLines = [];
    for (let level = 1; level <= levels; level++) {
        const points = habilidades.map((_, i) => getPoint(i, level)).map((p) => `${p.x},${p.y}`).join(' ');
        levelLines.push(<polygon key={level} points={points} fill="none" stroke={gridColor} strokeWidth="1" />);
    }

    const axisLines = habilidades.map((_, index) => {
        const point = getPoint(index, levels);
        return <line key={index} x1={center} y1={center} x2={point.x} y2={point.y} stroke={gridColor} strokeWidth="1" />;
    });

    // Polígono de un conjunto de puntos (estudiante o comparación).
    const poligono = (habsMap) => habilidades.map((hab, index) => {
        const pts = (habsMap && habsMap[hab.id]) || 0;
        return getPoint(index, getHabilidadNivel(pts));
    });

    const studentHabs = student.habilidades || {};
    const dataPoints = poligono(studentHabs);
    const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

    const labels = habilidades.map((hab, index) => {
        const point = getPoint(index, levels + 0.7);
        const pts = studentHabs[hab.id] || 0;
        const nivelH = getHabilidadNivel(pts);
        return (
            <g key={hab.id}>
                <text x={point.x} y={point.y - 7} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: '11px', fontWeight: '600', fill: '#e8d9a0' }}>
                    {hab.emoji} {hab.shortName || hab.nombre}
                </text>
                <text x={point.x} y={point.y + 7} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: '9px', fill: '#9d6bd8' }}>
                    Nv.{nivelH} ({pts}p)
                </text>
            </g>
        );
    });

    // Resumen accesible: "Análisis nivel 3, Crítico nivel 2, ...".
    const resumen = habilidades
        .map((h) => `${h.nombre} nivel ${getHabilidadNivel(studentHabs[h.id] || 0)}`)
        .join(', ');
    const nombre = student.nombreSocial || student.nombre || 'estudiante';

    const animClass = animate ? ' radar-anim' : '';

    return (
        <div className="mx-auto" style={{ maxWidth: size + 'px' }}>
            <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`}
                role="img" aria-label={`Radar de habilidades de ${nombre}: ${resumen}.`}>
                <style>{`
                    @keyframes radarIn { from { opacity: 0; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }
                    .radar-anim { animation: radarIn 500ms ease-out both; transform-origin: center; }
                `}</style>
                {levelLines}
                {axisLines}

                {/* Comparaciones (p. ej. promedio del curso) debajo del estudiante */}
                {compare.map((c, ci) => {
                    const pts = poligono(c.habilidades).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                        <polygon key={'cmp' + ci} points={pts} fill="none" stroke={c.color || '#f2c33d'}
                            strokeWidth="2" strokeDasharray="4 3" opacity="0.9">
                            <title>{c.label}</title>
                        </polygon>
                    );
                })}

                <g className={'radar-data' + animClass}>
                    <polygon points={dataPolygon} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
                    {dataPoints.map((point, index) => {
                        const hab = habilidades[index];
                        const pts = studentHabs[hab.id] || 0;
                        return (
                            <circle key={index} cx={point.x} cy={point.y} r="5" fill={dotColor} stroke={strokeColor} strokeWidth="1.5">
                                <title>{`${hab.nombre}: nivel ${getHabilidadNivel(pts)} (${pts} puntos)`}</title>
                            </circle>
                        );
                    })}
                </g>
                {labels}
            </svg>

            {compare.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mt-1 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                        <span style={{ width: 14, height: 3, background: strokeColor, display: 'inline-block' }} /> {nombre}
                    </span>
                    {compare.map((c, ci) => (
                        <span key={ci} className="inline-flex items-center gap-1 text-arcane">
                            <span style={{ width: 14, height: 0, borderTop: `3px dashed ${c.color || '#f2c33d'}`, display: 'inline-block' }} /> {c.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// Promedio de puntos por habilidad de una lista de estudiantes (para comparar).
export function promedioHabilidades(students, habilidades) {
    const lista = Array.isArray(students) ? students.filter(Boolean) : [];
    const mapa = {};
    for (const hab of habilidades) {
        if (!lista.length) { mapa[hab.id] = 0; continue; }
        const suma = lista.reduce((acc, s) => acc + ((s.habilidades && s.habilidades[hab.id]) || 0), 0);
        mapa[hab.id] = Math.round(suma / lista.length);
    }
    return mapa;
}
