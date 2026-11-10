// Gráfico de radar para habilidades filosóficas
// Soporta dark mode (dashboard estudiante) y light mode (modal profesor)
window.RadarChart = ({ student, darkMode }) => {
    const habilidades = window.HABILIDADES;
    const size = 280;
    const center = size / 2;
    const maxRadius = size / 2 - 45;
    const levels = 5;

    const getPoint = (index, value) => {
        const angle = (Math.PI * 2 * index) / habilidades.length - Math.PI / 2;
        const radius = (maxRadius * value) / levels;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle)
        };
    };

    // Colores adaptados al modo
    const gridColor = darkMode ? 'rgba(255,255,255,0.15)' : '#e0e0e0';
    const fillColor = darkMode ? 'rgba(168, 85, 247, 0.35)' : 'rgba(139, 92, 246, 0.3)';
    const strokeColor = darkMode ? '#C084FC' : '#8B5CF6';
    const dotColor = darkMode ? '#E9D5FF' : '#8B5CF6';

    const levelLines = [];
    for (let level = 1; level <= levels; level++) {
        const points = habilidades.map((_, i) => getPoint(i, level)).map(p => `${p.x},${p.y}`).join(' ');
        levelLines.push(
            <polygon key={level} points={points} fill="none" stroke={gridColor} strokeWidth="1" />
        );
    }

    const axisLines = habilidades.map((_, index) => {
        const point = getPoint(index, levels);
        return <line key={index} x1={center} y1={center} x2={point.x} y2={point.y} stroke={gridColor} strokeWidth="1" />;
    });

    const studentHabs = student.habilidades || {};
    const dataPoints = habilidades.map((hab, index) => {
        const pts = studentHabs[hab.id] || 0;
        const value = window.getHabilidadNivel(pts);
        return getPoint(index, value);
    });

    const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    const labels = habilidades.map((hab, index) => {
        const point = getPoint(index, levels + 0.7);
        const pts = studentHabs[hab.id] || 0;
        const nivelH = window.getHabilidadNivel(pts);
        return (
            <g key={hab.id}>
                <text x={point.x} y={point.y - 7} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: '11px', fontWeight: '600', fill: darkMode ? '#E9D5FF' : '#374151' }}>
                    {hab.emoji} {hab.shortName}
                </text>
                <text x={point.x} y={point.y + 7} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: '9px', fill: darkMode ? '#A78BFA' : '#6B7280' }}>
                    Nv.{nivelH} ({pts}p)
                </text>
            </g>
        );
    });

    return (
        <svg width="100%" height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto" style={{ maxWidth: size + 'px' }}>
            {levelLines}
            {axisLines}
            <polygon points={dataPolygon} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            {dataPoints.map((point, index) => (
                <circle key={index} cx={point.x} cy={point.y} r="5" fill={dotColor} stroke={strokeColor} strokeWidth="1.5" />
            ))}
            {labels}
        </svg>
    );
};
