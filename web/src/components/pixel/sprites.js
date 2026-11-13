// Sprites pixel-art dibujados a mano. Cada char = 1 pixel; '.'/' ' = transparente.
// Port de filosofia-app/src/components/pixel/sprites.ts (sin tipos TS).
// Arte original del proyecto: sin assets externos ni atribuciones pendientes.

// ---------------- COFRE ----------------
// Grilla base; las bandas metálicas (g/G) se recolorean según el tipo de cofre.
const CHEST_GRID = [
    '....oooooooo....',
    '..oohhhhhhhhoo..',
    '.ohhwwwwwwwwhho.',
    '.ohwGgwwwwgGwho.',
    '.ohwGgwwwwgGwho.',
    '.oooooooooooooo.',
    '.owwGgwwwwgGwwo.',
    '.owwGgwllwgGwwo.',
    '.owwGgwlpwgGwwo.',
    '.owwGgwllwgGwwo.',
    '.owwGgwwwwgGwwo.',
    '.owwGgwwwwgGwwo.',
    '.oooooooooooooo.',
    '..xxxxxxxxxxxx..'
];

const METAL = {
    bronce: { g: '#cd7f32', G: '#f0b27a' },
    plata: { g: '#b8c0cc', G: '#eef2f7' },
    oro: { g: '#f2c33d', G: '#ffe79a' }
};

// Cofre ABIERTO (tapa levantada + resplandor interior) para el frame final.
const CHEST_OPEN_GRID = [
    '................',
    '.Y............Y.',
    '.oooooooooooooo.',
    '.oWWWWWWWWWWWWo.',
    '.oYYYYYYYYYYYYo.',
    '.oYYYYYYYYYYYYo.',
    '.owwGgwwwwgGwwo.',
    '.owwGgwwwwgGwwo.',
    '.owwGgwwwwgGwwo.',
    '.owwGgwwwwgGwwo.',
    '.owwGgwwwwgGwwo.',
    '.owwGgwwwwgGwwo.',
    '.oooooooooooooo.',
    '..xxxxxxxxxxxx..'
];

function chestPalette(tipo) {
    const m = METAL[tipo] || METAL.bronce;
    return {
        o: '#20140a', h: '#c5904c', w: '#9c6b34', g: m.g, G: m.G,
        l: '#ece3c6', p: '#4a3a16', x: '#0e0b1e',
        W: '#7a4f24', Y: '#fff3b0' // tapa interior + resplandor
    };
}

export function chestSprite(tipo) {
    return { grid: CHEST_GRID, palette: chestPalette(tipo) };
}

export function chestOpenSprite(tipo) {
    return { grid: CHEST_OPEN_GRID, palette: chestPalette(tipo) };
}

// ---------------- LECHUZA DE ATENEA (mascota / guía) ----------------
export const OWL_SPRITE = {
    grid: [
        '...o........o...',
        '..oBo......oBo..',
        '.oBBBBBBBBBBBBo.',
        'oBBBBBBBBBBBBBBo',
        'oBgggBBBBBBgggBo',
        'oBgegBBBBBBgegBo',
        'oBgpgBBBBBBgpgBo',
        'oBgggBBkkBBgggBo',
        'oBBBBBBkkBBBBBBo',
        'oBffffffffffffBo',
        'oBffFFffffFFffBo',
        '.oBffffffffffBo.',
        '.oBBffffffffBBo.',
        '..oBBBBBBBBBBo..',
        '...oBBBBBBBBo...',
        '....kk..kk.....'
    ],
    palette: {
        o: '#0b0a14', // contorno
        B: '#6a5aa6', // plumas
        f: '#cfc4ea', // pecho
        F: '#9d8fd0', // patrón pecho
        g: '#f2c33d', // anillo dorado del ojo
        e: '#f5f0ff', // blanco del ojo
        p: '#0b0a14', // pupila
        k: '#f2a93d'  // pico / patas
    }
};

// ---------------- GEMA (artefactos / rareza) ----------------
// 'c' es tintable según rareza; 'L' es el brillo.
export const GEM_SPRITE = {
    grid: [
        '...oooooo...',
        '..oLLcccco..',
        '.oLccccccco.',
        'occcccccccco',
        'occcccccccco',
        '.occcccccco.',
        '.occcccccco.',
        '..occcccco..',
        '..occcccco..',
        '...occcco...',
        '....occo....',
        '.....oo.....'
    ],
    palette: {
        o: '#1c1538',
        c: '#b06bf2', // por defecto épico (se sobreescribe con tint)
        L: '#ffffff'
    }
};

export function gemColor(rareza) {
    return { comun: '#9ca3af', raro: '#5aa9f2', epico: '#b06bf2', legendario: '#f2c33d' }[rareza] || '#9ca3af';
}

// ---------------- CRISTAL DE XP ----------------
export const CRYSTAL_SPRITE = {
    grid: [
        '....oo....',
        '...oLco...',
        '..oLccco..',
        '..oLccco..',
        '.oLccccco.',
        '.oLccccco.',
        '.occcccco.',
        '.occcccco.',
        '..occcco..',
        '..occcco..',
        '...occo...',
        '...occo...',
        '....oo....'
    ],
    palette: {
        o: '#1c1538',
        c: '#5aa9f2',
        L: '#cfe8ff'
    }
};

// ---------------- CORONA (accesorio nivel alto) ----------------
export const CROWN_SPRITE = {
    grid: [
        '.g..g..g..g.',
        '.gGgGgGgGGg.',
        '.gggggggggg.',
        '.grgggggrg..'
    ],
    palette: { g: '#f2c33d', G: '#ffe79a', r: '#e0506a' }
};

// ---------------- CORAZÓN ----------------
export const HEART_SPRITE = {
    grid: [
        '.oo..oo...',
        'oLLrooorro',
        'oLrrrrrrro',
        'oLrrrrrrro',
        '.orrrrrro.',
        '..orrrro..',
        '...orro...',
        '....oo....'
    ],
    palette: {
        o: '#1c1538',
        r: '#e0506a',
        L: '#ff9fb0'
    }
};

// ---------------- ARTEFACTOS (catalogo filosofico, src/domain/artefactos.js) ----------------
// 18 sprites nuevos a mano; A19 (gema) y A20 (corona) reusan GEM_SPRITE/CROWN_SPRITE.

// A1: Cuaderno de Notas
export const NOTEBOOK_SPRITE = {
    grid: [
        'oooooooooooo',
        'occccccccccl',
        'occccccccccl',
        'occ.......cl',
        'occ.ggggg.cl',
        'occ.......cl',
        'occ.ggggg.cl',
        'occ.......cl',
        'occ.ggggg.cl',
        'occ.......cl',
        'occccccccccl',
        'oooooooooooo'
    ],
    palette: { o: '#20140a', c: '#d8c48a', l: '#8a6a3a', g: '#6b5636' }
};

// A2: Vela del Estudio (angosta y alta, para no confundirse con la copa A8)
export const CANDLE_SPRITE = {
    grid: [
        '....o....',
        '...oyo...',
        '..oyRyo..',
        '...oyo...',
        '...ooo...',
        '...ccc...',
        '...ccc...',
        '...ccc...',
        '...ccc...',
        '...ccc...',
        '...ccc...',
        '..ooooo..'
    ],
    palette: { o: '#20140a', y: '#ffe79a', R: '#f2a93d', c: '#e8c98a' }
};

// A3: Reloj de Arena
export const HOURGLASS_SPRITE = {
    grid: [
        'ooooooooo',
        'occccccco',
        '.occccco.',
        '..occco..',
        '...ooo...',
        '....o....',
        '...ooo...',
        '..oSSSo..',
        '.oSSSSSo.',
        'occccccco',
        'ooooooooo'
    ],
    palette: { o: '#4a3a1a', c: '#e8d9a0', S: '#c99517' }
};

// A4: Tintero Antiguo (frasco con corcho, sin pluma: la pluma ya es A11)
export const INKWELL_SPRITE = {
    grid: [
        '...ooo...',
        '...oco...',
        '..ooooo..',
        '.obbbbbo.',
        'obggggbo.',
        'obggggbo.',
        'obggggbo.',
        '.obbbbbo.',
        '..ooooo..'
    ],
    palette: { o: '#20140a', c: '#6b4a24', b: '#5aa9f2', g: '#12162e' }
};

// A5: Moneda del Agora
export const COIN_SPRITE = {
    grid: [
        '..ooooo..',
        '.oGGGGGo.',
        'oGGgggGGo',
        'oGgsssgGo',
        'oGgsssgGo',
        'oGgsssgGo',
        'oGGgggGGo',
        '.oGGGGGo.',
        '..ooooo..'
    ],
    palette: { o: '#4a2e06', G: '#f2c33d', g: '#b07d18', s: '#ffe79a' }
};

// A6: Mapa de Atenas (pergamino enrollado)
export const MAP_SCROLL_SPRITE = {
    grid: [
        '.oo........oo.',
        'occ........cco',
        'occmmmmmmmmcco',
        'occmm.xx.mmcco',
        'occmmmmmmmmcco',
        'occ........cco',
        '.oo........oo.'
    ],
    palette: { o: '#20140a', c: '#6b4a24', m: '#e8d9a0', x: '#b82a42' }
};

// A7: Piedra de Sisifo
export const BOULDER_SPRITE = {
    grid: [
        '...ooooo...',
        '..occccco..',
        '.occccccco.',
        'occccccccco',
        'occGcccGcco',
        'occccccccco',
        '.occccccco.',
        '..occccco..',
        '...ooooo...'
    ],
    palette: { o: '#1c1538', c: '#6b6b73', G: '#8f8f99' }
};

// A8: Copa de Socrates
export const GOBLET_SPRITE = {
    grid: [
        'ooooooooo',
        'occccccco',
        '.occccco.',
        '..occco..',
        '...ooo...',
        '...ogo...',
        '...ogo...',
        '...ogo...',
        '..ooooo..',
        '.ooooooo.'
    ],
    palette: { o: '#20140a', c: '#f2c33d', g: '#b07d18' }
};

// A9: Pergamino Antiguo (distinto del mapa: desplegado, con texto)
const PARCHMENT_FILL_ROW = 'o' + 'c'.repeat(8) + 'o';
export const PARCHMENT_SPRITE = {
    grid: [
        '.oooooooo.',
        PARCHMENT_FILL_ROW,
        'occggggcco',
        PARCHMENT_FILL_ROW,
        'occggggcco',
        PARCHMENT_FILL_ROW,
        'occggggcco',
        '.oooooooo.'
    ],
    palette: { o: '#20140a', c: '#e8d9a0', g: '#8a6a3a' }
};

// A10: Mascara de Diogenes (mascara de teatro: ojos y boca bien marcados)
export const MASK_SPRITE = {
    grid: [
        '.oooooooo.',
        'o' + 'c'.repeat(8) + 'o',
        'oc.dd.dd.o',
        'oc.dd.dd.o',
        'o' + 'c'.repeat(8) + 'o',
        'o' + 'c'.repeat(8) + 'o',
        'oc' + 'd'.repeat(6) + 'co',
        '.occcccco.',
        '..oooooo..'
    ],
    palette: { o: '#20140a', c: '#ece3c6', d: '#1c1538' }
};

// A11: Pluma de Platon
export const QUILL_SPRITE = {
    grid: [
        '.......oo.',
        '......oyo.',
        '.....oyyo.',
        '....oyyo..',
        '...oyyo...',
        '..oyyo....',
        '.oyyo.....',
        'oyyo......',
        'oyo.......',
        'o.o.......'
    ],
    palette: { o: '#20140a', y: '#e8d9a0' }
};

// A12: Libro de Tales (cerrado, distinto color del cuaderno)
export const BOOK_SPRITE = {
    grid: [
        'oooooooooooo',
        'obbbbbbbbbbo',
        'obbbbbbbbrbo',
        'obbbbbbbbrbo',
        'obbbbbbbbrbo',
        'obbbbbbbbrbo',
        'obbbbbbbbrbo',
        'obbbbbbbbrbo',
        'oooooooooooo'
    ],
    palette: { o: '#20140a', b: '#5a4ab0', r: '#e0506a' }
};

// A13: Balanza de la Justicia
export const SCALES_SPRITE = {
    grid: [
        '......o.......',
        '.ooooooooooo..',
        '..o...o...o...',
        '.o....o....o..',
        'oo....o....oo.',
        'o.o...o...o.o.',
        'ooo...o...ooo.',
        '......o.......',
        '.....ooo......'
    ],
    palette: { o: '#b07d18' }
};

// A14: Orbe del Conocimiento
export const ORB_SPRITE = {
    grid: [
        '..ooooo..',
        '.oLaaaao.',
        'oaaaaaaao',
        'oaaLaaaao',
        'oaaaaaaao',
        'oaaaaaaao',
        '.oaaaaao.',
        '..ooooo..',
        '.ogggggo.'
    ],
    palette: { o: '#1c1538', a: '#9d6bd8', L: '#e3d2ff', g: '#b07d18' }
};

// A15: Brujula de Descartes
export const COMPASS_SPRITE = {
    grid: [
        '..ooooo..',
        '.oGGGGGo.',
        'oG.....Go',
        'oG..r..Go',
        'oG.rwr..o',
        'oG..r..Go',
        'oG.....Go',
        '.oGGGGGo.',
        '..ooooo..'
    ],
    palette: { o: '#20140a', G: '#cd7f32', r: '#b82a42', w: '#ece3c6' }
};

// A16: Llave de Socrates (vertical: argolla + vastago + dientes, mas legible)
export const KEY_SPRITE = {
    grid: [
        '..oo....',
        '.oGGo...',
        '.oGgo...',
        '.oGGo...',
        '..oo....',
        '..oo....',
        '..oo....',
        '..oo....',
        '..oooo..',
        '..o..o..',
        '..oooo..',
        '..o..o..',
        '..oooo..'
    ],
    palette: { o: '#20140a', G: '#f2c33d', g: '#ffe79a' }
};

// A17: Espejo de Aristoteles
export const MIRROR_SPRITE = {
    grid: [
        '..ooooo..',
        '.oLLLLLo.',
        'oLLLLLLLo',
        'oLLLLLLLo',
        'oLLLLLLLo',
        '.oLLLLLo.',
        '..ooooo..',
        '....o....',
        '...ogo...',
        '...ogo...',
        '..ooooo..'
    ],
    palette: { o: '#20140a', L: '#cfe8ff', g: '#b07d18' }
};

// A18: Anfora de la Sabiduria (silueta clasica de vasija, sin asas para no
// leerse como orejas de animal)
export const AMPHORA_SPRITE = {
    grid: [
        '....oo...',
        '....oo...',
        '...oooo..',
        '..oooooo.',
        '.ohhhhho.',
        'ohhhhhhho',
        'ohhhGhhho',
        'ohhhhhhho',
        '.ohhhhho.',
        '..ohhho..',
        '...ooo...'
    ],
    palette: { o: '#20140a', h: '#e8d9a0', G: '#b07d18' }
};

const ARTEFACTO_SPRITES = {
    A1: NOTEBOOK_SPRITE,
    A2: CANDLE_SPRITE,
    A3: HOURGLASS_SPRITE,
    A4: INKWELL_SPRITE,
    A5: COIN_SPRITE,
    A6: MAP_SCROLL_SPRITE,
    A7: BOULDER_SPRITE,
    A8: GOBLET_SPRITE,
    A9: PARCHMENT_SPRITE,
    A10: MASK_SPRITE,
    A11: QUILL_SPRITE,
    A12: BOOK_SPRITE,
    A13: SCALES_SPRITE,
    A14: ORB_SPRITE,
    A15: COMPASS_SPRITE,
    A16: KEY_SPRITE,
    A17: MIRROR_SPRITE,
    A18: AMPHORA_SPRITE,
    A20: CROWN_SPRITE
};

// A19 (gema) se maneja aparte: usa GEM_SPRITE con tint por rareza (ver gemColor).
export function artefactoSprite(id) {
    return ARTEFACTO_SPRITES[id] || null;
}

// ---------------- SOL / LUNA (boton de tema claro/oscuro) ----------------
export const SUN_SPRITE = {
    grid: [
        '..o.....o..',
        '.o.o...o.o.',
        '...ooooo...',
        'o.oGGGGGo.o',
        '.oGGGGGGGo.',
        'ooGGGGGGGoo',
        'ooGGGGGGGoo',
        '.oGGGGGGGo.',
        'o.oGGGGGo.o',
        '...ooooo...',
        '.o.o...o.o.',
        '..o.....o..'
    ],
    palette: { o: '#b07d18', G: '#f2c33d' }
};

export const MOON_SPRITE = {
    grid: [
        '....oooo...',
        '..oommmo...',
        '.ommmmmo...',
        'ommmmmmo...',
        'ommmmmmo...',
        'ommmmmmo...',
        'ommmmmmo...',
        '.ommmmmo...',
        '..oommmo...',
        '....oooo...'
    ],
    palette: { o: '#5a4ab0', m: '#cfc4ea' }
};
