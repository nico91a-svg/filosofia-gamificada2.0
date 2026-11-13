// Icono pixel-art de un artefacto del catalogo (src/domain/artefactos.js).
import React from 'react';
import { PixelSprite } from './PixelSprite.jsx';
import { GEM_SPRITE, artefactoSprite, gemColor } from './sprites.js';

// A19 "Gema de Aristoteles" es un caso especial: usa GEM_SPRITE tintada por
// rareza (igual que el resto de la UI) en vez de un sprite propio.
export function ArtefactoIcon({ art, size = 32, className = '' }) {
    if (art.id === 'A19') {
        return <PixelSprite sprite={GEM_SPRITE} tint={gemColor(art.rareza)} tintKey="c" size={size} className={className} />;
    }
    const sprite = artefactoSprite(art.id);
    if (!sprite) return null;
    return <PixelSprite sprite={sprite} size={size} className={className} />;
}
