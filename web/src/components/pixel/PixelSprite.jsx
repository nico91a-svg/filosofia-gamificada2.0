// Renderiza un icono del catálogo (ver sprites.js). Antes dibujaba una grilla
// pixel-art; ahora envuelve un icono de Phosphor conservando la misma firma
// para no tocar a los consumidores.
//
// sprite: { Icon, color }  ·  tint: color que sobreescribe el por defecto.
// (tintKey se mantiene por compatibilidad de llamadas pero ya no se usa.)
import React from 'react';

export function PixelSprite({ sprite, size = 96, tint, className = '' }) {
    if (!sprite || !sprite.Icon) return null;
    const Icon = sprite.Icon;
    const color = tint || sprite.color || 'currentColor';
    return (
        <Icon
            size={size}
            color={color}
            weight="duotone"
            className={className}
            aria-hidden="true"
        />
    );
}
