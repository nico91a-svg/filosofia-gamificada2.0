// Icono de un artefacto del catálogo (src/domain/artefactos.js), tintado según
// su rareza para que el color comunique el valor de un vistazo.
import React from 'react';
import { PixelSprite } from './PixelSprite.jsx';
import { artefactoSprite, gemColor } from './sprites.js';

export function ArtefactoIcon({ art, size = 32, className = '' }) {
    const sprite = artefactoSprite(art.id);
    if (!sprite) return null;
    return <PixelSprite sprite={sprite} tint={gemColor(art.rareza)} size={size} className={className} />;
}
