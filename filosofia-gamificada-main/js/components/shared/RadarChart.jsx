// Gráfico de radar para habilidades filosóficas
window.RadarChart = ({ student }) => {
    const habilidades = window.HABILIDADES;
    const size = 300;
    const center = size / 2;
    const maxRadius = size / 2 - 40;
    const levels = 5;

    const getPoint = (index, value) => {
        const angle = (Math.PI * 2 * index) / habilidades.length - Math.PI / 2;
        const radius = (maxRadius * value) / levels;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle)
        };
    };

    const levelLines = [];
    for (let level = 1; level <= levels; level++) {
        const points = habilidades.map((_, i) => getPoint(i, level)).map(p => `${p.x},${p.y}`).join(' ');
        levelLines.push(
            <polygon key={level} points={points} fill="none" stroke="#e0e0e0" strokeWidth="1" />
        );
    }

    const axisLines = habilidades.map((_, index) => {
        const point = getPoint(index, levels);
        return <line key={index} x1={center} y1={center} x2={point.x} y2={point.y} stroke="#e0e0e0" strokeWidth="1" />;
    });

    const dataPoints = habilidades.map((hab, index) => {
        const value = window.getHabilidadNivel(student.habilidades[hab.id] || 0);
        return getPoint(index, value);
    });

    const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    const labels = habilidades.map((hab, index) => {
        const point = getPoint(index, levels + 0.5);
        return (
            <text key={hab.id} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="middle" className="text-xs font-semibold fill-gray-700">
                {hab.shortName}
            </text>
        );
    });

    return (
        <svg width={size} height={size} className="mx-auto">
            {levelLines}
            {axisLines}
            <polygon points={dataPolygon} fill="rgba(139, 92, 246, 0.3)" stroke="#8B5CF6" strokeWidth="2" />
            {dataPoints.map((point, index) => (
                <circle key={index} cx={point.x} cy={point.y} r="4" fill="#8B5CF6" />
            ))}
            {labels}
        </svg>
    );
};
