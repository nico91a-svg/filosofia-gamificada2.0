# Filósofo en Formación

Sistema gamificado para clases de Filosofía: XP, niveles, habilidades, misiones,
cofres y artefactos. Un panel para el docente y otro para cada estudiante.

## Estructura

| Carpeta | Qué contiene |
|---|---|
| `web/` | **La aplicación.** Un solo código que se publica como sitio web, app instalable (PWA) y APK de Android. |
| `web/src/domain/` | Reglas del juego: niveles, XP, cofres, misiones, insignias. |
| `web/src/content/` | Contenido por curso ("packs"): unidades, clases, vocabulario. Ver `docs/CONTENIDO.md`. |
| `web/src/services/` | Datos: sincronización con Firebase, acceso, respaldo local. |
| `web/src/components/` | Pantallas (login, panel docente, panel estudiante). |
| `datos-privados/` | Nómina inicial. No se publica. |
| `docs/` | Guías: publicar, crear contenido, seguridad. |

## Uso rápido

```bash
cd web
npm install
npm run dev      # servidor local con recarga automática
npm run check    # lint + pruebas unitarias + build
npm run e2e      # pruebas en navegador real
```

Publicar la web y generar el APK: `docs/DEPLOY.md`.

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
4. **Pruebas automáticas** en cada cambio (GitHub Actions): 45 unitarias y 16 en
   navegador real sobre el build de producción.

## Pendiente importante

La base de datos todavía acepta lecturas y escrituras sin autenticación. Antes
de dar a conocer la dirección pública del sitio, leer `docs/SEGURIDAD.md`.
