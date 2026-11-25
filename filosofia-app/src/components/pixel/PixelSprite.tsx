// Renderiza un sprite pixel-art a partir de una grilla de texto.
// Cada carácter = un pixel; el espacio = transparente. Escala nítida (crispEdges).
import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export interface SpriteDef {
  grid: string[];               // filas; cada char es un pixel
  palette: Record<string, string>; // char -> color hex
}

interface Props {
  sprite: SpriteDef;
  size?: number;     // tamaño del lado en px de pantalla
  tint?: string;     // sobreescribe un color (para gemas por rareza)
  tintKey?: string;  // qué char tintar
}

export function PixelSprite({ sprite, size = 96, tint, tintKey }: Props) {
  const rows = sprite.grid;
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const cell = size / Math.max(w, h);
  const offsetX = (size - w * cell) / 2;
  const offsetY = (size - h * cell) / 2;

  const rects: React.ReactNode[] = [];
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === ' ' || ch === '.') continue;
      let color = sprite.palette[ch];
      if (!color) continue;
      if (tint && tintKey && ch === tintKey) color = tint;
      rects.push(
        <Rect
          key={`${x}-${y}`}
          x={offsetX + x * cell}
          y={offsetY + y * cell}
          width={cell + 0.5}
          height={cell + 0.5}
          fill={color}
        />,
      );
    }
  }

  // Nota: en nativo los rects se dibujan nítidos; en web añadimos crispEdges.
  const webProps = { shapeRendering: 'crispEdges' } as Record<string, string>;
  return (
    <Svg width={size} height={size} {...webProps}>
      {rects}
    </Svg>
  );
}
