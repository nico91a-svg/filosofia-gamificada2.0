# Estética pixel-art / mazmorra — app web (`web/`)

Port a la web del sistema visual "El Liceo de los Filósofos" diseñado para la
app móvil (art bible original: `docs/design/art-bible-pixel-dungeon.md` en la
rama `claude/web-to-mobile-app-3J0Il`). Todo es CSS + SVG generado en código:
no hay imágenes descargadas.

## Paleta (en `web/tailwind.config.js`)

| Rol | Clase | Hex |
|---|---|---|
| Fondo profundo | `dungeon-950` | `#0e0b1e` |
| Paneles | `dungeon-800` / `dungeon-700` / `dungeon-600` | `#221a45` / `#2e2458` / `#3b2f6e` |
| Bisel claro / oscuro | `stone-light` / `stone-dark` | `#6b5fa3` / `#1c1538` |
| Acentos y XP | `gold` (`-light`/`-dark`) | `#f2c33d` |
| Texto principal | `parchment` | `#e8d9a0` |
| Texto secundario | `arcane` | `#9d6bd8` |
| Peligro / éxito | `ruby` / `emerald` | `#e0506a` / `#3fb27f` |
| Rareza | `rareza-comun/raro/epico/legendario` | gris/azul/morado/oro |

Las 4 paletas elegibles por curso (`web/src/data/cursos.js`) se re-tonaron a
esta gama; siguen siendo configurables desde el panel docente.

## Tipografía

Las familias de Tailwind están **remapeadas** (no hubo que tocar componentes):

- `font-serif` → **Press Start 2P** (titulares; usar `text-sm`-`text-2xl`,
  es muy ancha).
- `font-sans` (default) → **Silkscreen** (todo lo demás; legible en texto
  largo desde ~14px).

Se cargan vía `@fontsource` en `web/src/main.jsx` (solo subset latin;
reemplazaron a Inter/Lora y pesan menos).

## Clases del sistema (en `web/src/index.css`, `@layer components`)

- `.panel-pixel` / `.panel-pixel-dark` — caja con marco de piedra biselado
  (luz arriba/izq, sombra abajo/der) + sombra dura sin blur. Para resaltar un
  panel (p. ej. cofres) se sobreescribe el borde: `!border-gold-dark`.
- `.btn-pixel-primary` (oro) / `.btn-pixel-ghost` (piedra) /
  `.btn-pixel-danger` (rubí) — botón 3D con bisel; se "hunde" 2px en `:active`.
- `.input-pixel` — input/select plano con borde stone y foco gold.

## Sprites e íconos (en `web/src/components/pixel/`)

`PixelSprite.jsx` renderiza una grilla de texto (1 carácter = 1 píxel) como
`<svg>` nítido. Definiciones en `sprites.js` (cofres bronce/plata/oro cerrados
y abiertos, gema tintable por rareza, cristal XP, corazón, corona, lechuza) e
`icons.json` (16×16: 6 habilidades + 3 categorías de actividad, accesibles con
`skillIcon(id)` / `catIcon(id)` de `icons.js`).

Para agregar un sprite: define `{ grid: ['...'], palette: { char: '#hex' } }`
en `sprites.js` y úsalo con `<PixelSprite sprite={...} size={48} />`.
`tint`/`tintKey` recolorean un carácter (así se pinta la gema por rareza).

Dónde se usan hoy: cofres e inventario del estudiante (incluido el modal de
apertura, cerrado → abierto por fase), gemas de artefactos, tarjetas de
habilidades, badge de categoría en Registro Masivo, lechuza en splash/errores.

## Restricciones que no se deben romper (vienen de los tests e2e)

- Los modales deben conservar la clase `fixed` en su contenedor
  (`page.locator('div.fixed')` en `web/e2e/app.spec.js`).
- El contenedor `max-w-7xl` del panel docente también es un selector de test.
- El test `@movil` falla con cualquier desborde horizontal: las fuentes pixel
  son anchas — títulos en tamaños contenidos y filas de
  encabezado con `flex-wrap`.

## Licencias

| Recurso | Autor | Licencia | Atribución |
|---|---|---|---|
| Press Start 2P | CodeMan38 (via Google Fonts / @fontsource) | SIL OFL 1.1 | No requerida |
| Silkscreen | Jason Kottke (via Google Fonts / @fontsource) | SIL OFL 1.1 | No requerida |
| Sprites, íconos, paleta, logo | Originales de este proyecto | — (propios) | — |

No se usa ningún asset externo CC0/CC BY en esta fase. Si más adelante se
agrega un tile de fondo de Kenney.nl (CC0) u otros íconos de game-icons.net
(CC BY 3.0 — esa SÍ exige atribución), anotar aquí autor, licencia y enlace.

## Iteraciones futuras (fuera de esta fase)

1. Redibujar como sprites los ~70 emojis restantes (misiones, niveles,
   navegación).
2. Tile de fondo de mazmorra con `background-repeat` (CC0 de Kenney o
   generado por script como en la app móvil).
3. Portar los avatares pixel por estudiante de la app móvil (toca el modelo
   `Estudiante.avatar`: es un cambio funcional, no solo visual).
