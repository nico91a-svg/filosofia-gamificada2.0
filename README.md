# Filósofo en Formación

Sistema gamificado para clases de Filosofía: XP, niveles, habilidades, misiones,
cofres y artefactos. Un panel para el docente y otro para cada estudiante.

## Estructura

| Carpeta | Qué contiene |
|---|---|
| `web/` | **Código de la app nueva.** Un solo código para sitio web, app instalable (PWA) y APK de Android. |
| `web/src/domain/` | Reglas del juego: niveles, XP, cofres, misiones, insignias. |
| `web/src/content/` | Contenido por curso ("packs"): unidades, clases, vocabulario. Ver `docs/CONTENIDO.md`. |
| `web/src/services/` | Datos: sincronización con Firebase, acceso, copia local. |
| `web/src/components/` | Pantallas (login, panel docente, panel estudiante). |
| `app/` | La app nueva ya compilada, tal como se publica. Generada; no se edita. |
| `filosofia-gamificada-main/` | La app anterior, en uso hasta completar el cambio. No recibe mejoras. |
| `docs/` | Guías: publicar, crear contenido, seguridad. |

Publicación, direcciones y APK: `docs/DEPLOY.md`.

## Decisiones de arquitectura

1. **Un solo código para web y móvil.** La web se compila con Vite y se empaqueta
   con Capacitor para Android. Mantener una segunda app nativa aparte duplicaba
   cada función; la rama `claude/web-to-mobile-app-3J0Il` (Expo) queda como
   prototipo de arte.
2. **Se escribe solo lo que cambia.** Cada dispositivo guarda únicamente los
   campos modificados, así un celular con datos viejos no puede pisar el
   progreso del curso. Sin conexión al abrir, la app queda en solo lectura.
3. **Contenido separado de las reglas.** Un curso = sus datos + un pack de
   contenido + su identidad visual. Crear un curso nuevo no requiere programar.
4. **Pruebas automáticas** en cada cambio (GitHub Actions): unitarias y en
   navegador real sobre el build de producción.
5. **Cambio gradual.** La app nueva se publica junto a la anterior y tiene un
   modo de ensayo (`?db=sandbox`), para probarla antes de mover a los estudiantes.

## Pendiente importante

La base de datos todavía acepta lecturas y escrituras sin autenticación, y este
repositorio se publica completo. Leer `docs/SEGURIDAD.md`.
