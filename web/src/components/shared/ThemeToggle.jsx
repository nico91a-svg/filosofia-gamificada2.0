// Alterna el tema claro/oscuro y lo persiste. Claro es el default (ver script
// inline en index.html que evita el parpadeo al recargar con tema oscuro).
import React, { useEffect, useState } from 'react';
import { PixelSprite } from '../pixel/PixelSprite.jsx';
import { SUN_SPRITE, MOON_SPRITE } from '../pixel/sprites.js';

const THEME_KEY = 'filosofo_theme';

function readStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}

function saveStoredTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* */ }
}

export function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState(() => (readStoredTheme() === 'dark' ? 'dark' : 'light'));

    useEffect(() => {
        if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
        else delete document.documentElement.dataset.theme;
        saveStoredTheme(theme);
    }, [theme]);

    const esOscuro = theme === 'dark';

    return (
        <button
            type="button"
            onClick={() => setTheme(esOscuro ? 'light' : 'dark')}
            className={'btn-pixel-ghost p-2 ' + className}
            aria-label={esOscuro ? 'Modo claro' : 'Modo oscuro'}
            title={esOscuro ? 'Modo claro' : 'Modo oscuro'}
        >
            <PixelSprite sprite={esOscuro ? MOON_SPRITE : SUN_SPRITE} size={18} />
        </button>
    );
}
