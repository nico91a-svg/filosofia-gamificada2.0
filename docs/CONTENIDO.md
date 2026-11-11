# Contenido: packs por curso

Un **pack** es el contenido de un curso: unidades, clases y vocabulario. Las
reglas del juego (XP, niveles, cofres, misiones) son comunes y no van aquí.

Packs incluidos (`web/src/content/packs/`):

- `filosofia-3medio.js` — Filosofía III Medio, 4 unidades, 31 clases.
- `etica-introduccion.js` — ejemplo y plantilla, marcado como borrador.

## Crear un pack

1. Copia `etica-introduccion.js` con otro nombre y edítalo.
2. Regístralo en `web/src/content/index.js`:

   ```js
   import miPack from './packs/mi-pack.js';
   export const CONTENT_PACKS = [filosofia3Medio, eticaIntroduccion, miPack];
   ```

3. Ejecuta `npm test` dentro de `web/`. La prueba revisa la estructura y explica
   qué falta.

## Forma de una unidad

```js
{
    id: 'U1',                               // U1, U2, ... en orden
    nombre: 'Nombre de la unidad',
    emoji: '🧭',
    color: 'from-amber-500 to-orange-600',  // uno de COLORES_UNIDAD (index.js)
    periodo: 'Marzo - Mayo',
    totalClases: 2,                         // debe coincidir con clases.length
    objetivos: ['...'],
    evaluacionSumativa: { nombre: '...', descripcion: '...', porcentaje: null },
    instrumentosEvaluacion: { sumativa: [], formativa: [], diagnostica: [] },
    clases: [
        { num: 1, titulo: '...', descripcion: '...', emoji: '🚋' },
        { num: 2, titulo: '...', descripcion: '...', emoji: '🏛️' }
    ],
    vocabulario: [{ termino: '...', definicion: '...' }]
}
```

## Usar un pack en un curso

Panel docente → **Cursos** → elegir el pack en **Contenido**.

- El docente puede ajustar títulos, descripciones y vocabulario en **Unidades**;
  esos cambios se guardan solo para ese curso.
- **Restaurar contenido del pack** descarta esos ajustes. Es también la forma de
  recibir una versión nueva del pack en un curso que ya tenía ediciones.
- El vocabulario descubierto por cada estudiante se guarda por nombre del
  término: renombrar un término lo deja como no descubierto.
