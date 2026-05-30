// Radar de 6 habilidades filosóficas (react-native-svg)
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { HABILIDADES } from '../../domain';
import type { Habilidades } from '../../domain/types';

interface Props {
  habilidades: Habilidades;
  size?: number;
  max?: number;
}

export function RadarChart({ habilidades, size = 280, max = 100 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const n = HABILIDADES.length; // 6

  // Ángulo de cada vértice (empezando arriba)
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  // Anillos de referencia (25/50/75/100%)
  const rings = [0.25, 0.5, 0.75, 1].map((f) =>
    HABILIDADES.map((_, i) => {
      const p = point(i, radius * f);
      return `${p.x},${p.y}`;
    }).join(' '),
  );

  // Polígono de datos
  const dataPoints = HABILIDADES.map((h, i) => {
    const valor = Math.min(habilidades[h.id] ?? 0, max) / max;
    const p = point(i, radius * valor);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        {/* anillos */}
        {rings.map((r, idx) => (
          <Polygon
            key={idx}
            points={r}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />
        ))}
        {/* ejes + etiquetas */}
        {HABILIDADES.map((h, i) => {
          const edge = point(i, radius);
          const label = point(i, radius + 18);
          return (
            <React.Fragment key={h.id}>
              <Line x1={cx} y1={cy} x2={edge.x} y2={edge.y} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
              <SvgText
                x={label.x}
                y={label.y}
                fill="#e9d5ff"
                fontSize={11}
                fontWeight="bold"
                textAnchor="middle"
              >
                {h.emoji}
              </SvgText>
            </React.Fragment>
          );
        })}
        {/* datos */}
        <Polygon points={dataPoints} fill="rgba(168,85,247,0.45)" stroke="#c084fc" strokeWidth={2} />
        {HABILIDADES.map((h, i) => {
          const valor = Math.min(habilidades[h.id] ?? 0, max) / max;
          const p = point(i, radius * valor);
          return <Circle key={h.id} cx={p.x} cy={p.y} r={3} fill={h.color} />;
        })}
      </Svg>
      {/* leyenda */}
      <View className="mt-2 flex-row flex-wrap justify-center gap-x-3 gap-y-1">
        {HABILIDADES.map((h) => (
          <Text key={h.id} className="text-xs text-purple-200">
            {h.emoji} {h.shortName} {habilidades[h.id] ?? 0}
          </Text>
        ))}
      </View>
    </View>
  );
}
