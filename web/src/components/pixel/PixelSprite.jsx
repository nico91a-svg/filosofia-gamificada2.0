// Renderiza un sprite pixel-art a partir de una grilla de texto.
// Cada carácter = un pixel; el espacio o '.' = transparente. Escala nítida.
// Port del componente homónimo de la app móvil (react-native-svg -> svg nativo).
import React from 'react';

// sprite: { grid: string[], palette: {char: '#hex'} }
// tint/tintKey: recolorea un char (p. ej. la gema según rareza).
export function PixelSprite({ sprite, size = 96, tint, tintKey, className = '' }) {
    const rows = sprite.grid;
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    const cell = size / Math.max(w, h);
    const offsetX = (size - w * cell) / 2;
    const offsetY = (size - h * cell) / 2;

    const rects = [];
    for (let y = 0; y < h; y++) {
        const row = rows[y];
        for (let x = 0; x < row.length; x++) {
            const ch = row[x];
            if (ch === ' ' || ch === '.') continue;
            let color = sprite.palette[ch];
            if (!color) continue;
            if (tint && tintKey && ch === tintKey) color = tint;
            rects.push(
                <rect
                    key={x + '-' + y}
                    x={offsetX + x * cell}
                    y={offsetY + y * cell}
                    width={cell + 0.5}
                    height={cell + 0.5}
                    fill={color}
                />
            );
        }
    }

    return (
        <svg width={size} height={size} shapeRendering="crispEdges" className={className} aria-hidden="true">
            {rects}
        </svg>
    );
}
