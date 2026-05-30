# Art Bible — "El Liceo de los Filósofos" (pixel-art / mazmorra)

Dirección de arte de la app móvil. Estilo: **RPG de mazmorra tipo Zelda**, pixel-art
con marcos de piedra, oro y pergamino. Todo está **implementado en código** (no son
mockups): fuentes pixel reales, paleta en `tailwind.config.js`, sprites SVG dibujados
a mano y componentes reutilizables.

![Sprites](./sprites-preview.png)

## 1. Paleta (en `tailwind.config.js` y `src/theme/pixel.ts`)

| Rol | Hex | Uso |
|---|---|---|
| dungeon-950 | `#0e0b1e` | Fondo profundo de pantalla |
| dungeon-800/700 | `#221a45` / `#2e2458` | Cara de paneles |
| stone-light / dark | `#6b5fa3` / `#1c1538` | Bisel del marco (luz / sombra) |
| gold / light / dark | `#f2c33d` / `#ffe79a` / `#b07d18` | Acentos, botones, XP |
| parchment | `#e8d9a0` | Texto principal sobre madera/piedra |
| arcane | `#9d6bd8` | Texto secundario |
| ruby / emerald | `#e0506a` / `#3fb27f` | Peligro / éxito |
| rareza | gris/azul/morado/oro | Común·Raro·Épico·Legendario |

## 2. Tipografía

- **Titulares y números:** `Press Start 2P` (clase `font-pixel`) — chunky, en MAYÚSCULAS, con `letterSpacing`.
- **Etiquetas y UI:** `Silkscreen` (clase `font-body`) — pixel legible.
- **Texto largo** (definiciones, descripciones de clase): se mantiene en `font-body`
  a tamaño cómodo para preservar legibilidad a los 17-18 años.

Cargadas en `app/_layout.tsx` con `expo-font` + splash gestionado.

## 3. Componentes del sistema

- **`PixelPanel`** (`src/components/pixel/`): caja con marco de piedra biselado
  (luz arriba/izq, sombra abajo/der) + **sombra dura** sin blur. Variante `rivets`
  añade remaches dorados en las esquinas. Tonos: `stone`, `gold`, `arcane`.
- **`Button`** (`src/components/ui/`): botón 3D con bisel y efecto **hundido** al
  presionar (se mueve 4px). Variantes `primary` (oro), `ghost` (piedra), `danger` (rubí).
- **`PixelSprite`**: renderiza cualquier sprite desde una grilla de texto (1 char = 1 píxel)
  con `react-native-svg`. Soporta `tint` para recolorear (p. ej. gemas por rareza).
- **`XPBar`**: barra segmentada con marco de piedra y relleno dorado animado.

## 4. Sprites (en `src/components/pixel/sprites.ts`)

Dibujados como grillas de caracteres → fáciles de editar pixel a pixel.

| Sprite | Grilla | Notas |
|---|---|---|
| Cofre | 16×14 | 3 variantes metálicas: bronce / plata / oro |
| Gema | 12×12 | Tintable; se usa para artefactos según rareza |
| Cristal XP | 10×13 | Acento de experiencia |
| Corazón | 10×8 | Reserva para vidas/participación |

**Cómo agregar un sprite nuevo:** define una grilla (filas del mismo ancho, `.`=transparente)
y una `palette` `{char: '#hex'}`, expórtala como `SpriteDef` y úsala con
`<PixelSprite sprite={MI_SPRITE} size={…} />`. Regenera la preview con
`node scripts/preview-sprites.js docs/design/sprites-preview.png`.

## 5. Pantallas reskininadas

Login, Perfil, Aventura (mapa), Actividades (bitácora), Ranking (salón de héroes),
Mochila/Grimorio, y todo el panel del Game Master (panel, héroes, registrar hazaña),
además del modal de apertura de cofre.

## 5.b Avatares de héroe (✅ implementado)

![Avatares](./avatars-preview.png)

4 personajes pixel **futuristas con pelo teñido** (neón) que el estudiante elige
(`src/components/pixel/avatars.ts`):

| ID | Nombre | Peinado | Pelo | Piel |
|---|---|---|---|---|
| `nova` | Nova | Cresta | Rosa neón | Clara |
| `zeph` | Zeph | Flequillo | Cian eléctrico | Media |
| `lux` | Lux | Melena | Violeta | Tostada |
| `vex` | Vex | Undercut | Lima | Oscura |

Construcción por capas: una **cara/cuello base** (traje con visera y trim de neón,
ojos neón) + 4 **peinados** que se combinan; cada avatar redefine pelo, ojos, trim y
tono de piel. Selección con `AvatarPicker` (en el perfil del estudiante y al crear
héroe desde el GM). Aparece en perfil, ranking y lista de héroes. Persistido en
`Estudiante.avatar`. Para añadir más: agrega un peinado y una entrada a `AVATARS`.

## 6. Próximos assets recomendados (para subir de nivel el acabado)

Prioridad alta → baja. Tamaño objetivo entre paréntesis (se escalan nítidos):

1. ~~Avatares de héroe~~ ✅ hecho (ver 5.b). Posible extensión: accesorios
   desbloqueables por nivel (casco, aura) superpuestos al avatar.
2. **Cofre animado por frames** (lid abriéndose, 3-4 frames) para reemplazar el
   escalado actual en el reveal.
3. **Owl/Lechuza de Atenea** como mascota guía (16×16) — ideal para tips/onboarding.
4. **Tile de fondo de mazmorra** (32×32, repetible) para dar textura a `Screen`.
5. **Íconos pixel** de las 6 habilidades y de los tipos de actividad (16×16),
   reemplazando emojis en radar y registro.
6. **Splash e ícono de app** en estilo del cofre dorado.

> Pipeline: exporta cada sprite como PNG transparente a escala 1x (sin antialias) y
> colócalo en `filosofia-app/assets/sprites/`. Para arte vectorizado-pixel se puede
> seguir usando grillas en `sprites.ts`. Si se generan PNGs, se cargan con
> `expo-asset` y se muestran con `<Image>` (RN) con `resizeMode="contain"`.
