// Catálogo de iconos del juego. Antes eran sprites pixel-art dibujados a mano;
// ahora se apoyan en Phosphor Icons (peso duotone) para una estética moderna.
// Se conserva la API pública (OWL_SPRITE, GEM_SPRITE, chestSprite, gemColor,
// artefactoSprite, SUN/MOON...) para no tocar los componentes consumidores.
//
// Un "sprite" aquí es { Icon, color }: Icon es un componente de Phosphor y
// color el tinte por defecto (PixelSprite lo pinta; `tint` puede sobreescribir).
import {
    Brain, Diamond, Sparkle, Crown, Sun, Moon, TreasureChest,
    Notebook, Flame, Hourglass, Feather, PenNib, Coin, MapTrifold,
    Mountains, Trophy, Scroll, MaskHappy, Book, Scales, Sphere,
    Compass, Key, Aperture, Flask
} from '@phosphor-icons/react';

// Colores de rareza (convención de juego: gris / azul / púrpura / dorado).
const RAREZA = {
    comun: '#94A3B8',
    raro: '#3B9EE5',
    epico: '#A855F7',
    legendario: '#F6B13C'
};

export function gemColor(rareza) {
    return RAREZA[rareza] || RAREZA.comun;
}

// Marca de la app (antes la lechuza pixel): cerebro = conocimiento/filosofía.
export const OWL_SPRITE = { Icon: Brain, color: '#6D5AE6' };

// Gema genérica tintada por rareza en la UI.
export const GEM_SPRITE = { Icon: Diamond, color: RAREZA.epico };

export const CRYSTAL_SPRITE = { Icon: Sparkle, color: '#3B9EE5' };
export const CROWN_SPRITE = { Icon: Crown, color: '#F6B13C' };
export const SUN_SPRITE = { Icon: Sun, color: '#F6B13C' };
export const MOON_SPRITE = { Icon: Moon, color: '#8B7BF0' };

// Cofres: mismo icono, color según metal. La versión "abierta" usa un tono
// más claro para sugerir el resplandor del contenido.
const CHEST_COLOR = { bronce: '#C97B3A', plata: '#9AA3B2', oro: '#E0A422' };
const CHEST_OPEN_COLOR = { bronce: '#E39A5C', plata: '#C3CAD6', oro: '#F6C64A' };

export function chestSprite(tipo) {
    return { Icon: TreasureChest, color: CHEST_COLOR[tipo] || CHEST_COLOR.bronce };
}

export function chestOpenSprite(tipo) {
    return { Icon: TreasureChest, color: CHEST_OPEN_COLOR[tipo] || CHEST_OPEN_COLOR.bronce };
}

// Mapa de los 20 artefactos del catálogo (src/domain/artefactos.js) a iconos.
// El color lo pone ArtefactoIcon según la rareza, así que aquí solo va el glifo.
const ARTEFACTO_ICONS = {
    A1: Notebook,      // Cuaderno de Notas
    A2: Flame,         // Vela del Estudio
    A3: Hourglass,     // Reloj de Arena
    A4: Feather,       // Tintero Antiguo
    A5: Coin,          // Moneda del Ágora
    A6: MapTrifold,    // Mapa de Atenas
    A7: Mountains,     // Piedra de Sísifo
    A8: Trophy,        // Copa de Sócrates
    A9: Scroll,        // Pergamino Antiguo
    A10: MaskHappy,    // Máscara de Diógenes
    A11: PenNib,       // Pluma de Platón
    A12: Book,         // Libro de Tales
    A13: Scales,       // Balanza de Justicia
    A14: Sphere,       // Orbe del Conocimiento
    A15: Compass,      // Brújula de Descartes
    A16: Key,          // Llave de Sócrates
    A17: Aperture,     // Espejo de Aristóteles
    A18: Flask,        // Ánfora de la Sabiduría
    A19: Diamond,      // Gema de Aristóteles
    A20: Crown         // Corona del Filósofo
};

export function artefactoSprite(id) {
    const Icon = ARTEFACTO_ICONS[id];
    return Icon ? { Icon } : null;
}
