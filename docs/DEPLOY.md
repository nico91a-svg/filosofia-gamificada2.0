# Publicar la aplicación

El sitio se publica con **GitHub Pages desde la rama `main`**. No hay que
instalar nada: publicar es mergear a `main`.

## Direcciones

| Qué | Dirección |
|---|---|
| App actual (la que usan hoy los estudiantes) | `https://nico91a-svg.github.io/filosofia-gamificada2.0/filosofia-gamificada-main/` |
| App nueva | `https://nico91a-svg.github.io/filosofia-gamificada2.0/app/` |
| App nueva con datos de ensayo | `https://nico91a-svg.github.io/filosofia-gamificada2.0/app/?db=sandbox` |

Las dos apps leen la misma base de datos y pueden convivir.

## Cómo se publica la app nueva

1. Se cambia el código en `web/` y se mergea a `main`.
2. El workflow **Publicar web** verifica (lint, pruebas, build), compila y guarda
   el resultado en `app/`.
3. GitHub Pages sirve `app/`.

Si la verificación falla no se publica nada y sigue en línea la versión
anterior. La carpeta `app/` es generada: no se edita a mano.

## Paso a la app nueva (recomendado en este orden)

1. **Respaldo.** En la app actual: panel docente → Exportar.
2. **Ensayo sin riesgo.** Abre la app nueva con `?db=sandbox` en dos dispositivos
   (por ejemplo computador y celular). Crea un estudiante de prueba, regístrale
   actividades desde uno y mira cómo se actualiza el otro. Nada de eso toca tus
   cursos reales.
3. **Datos reales.** Abre la app nueva sin `?db=sandbox`, entra como docente y
   revisa que estudiantes, XP y actividades coincidan con la app actual.
4. **Cambio.** Cuando estés conforme, se reemplaza la app actual por una
   redirección a `app/`, de modo que el enlace que ya tienen los estudiantes
   los lleve a la nueva. Es un cambio pequeño de código; pídelo cuando quieras.

Para volver de los datos de ensayo a los reales: enlace del aviso superior, o
abrir con `?db=real`.

## App instalable (PWA)

La app nueva se puede instalar desde el navegador del teléfono ("Agregar a
pantalla de inicio"). Tras la primera visita abre sin red y se actualiza sola.

## APK de Android

### Desde GitHub

1. Pestaña **Actions** → **Web APK (Android)** → **Run workflow**.
2. Al terminar, descarga el artifact `filosofo-en-formacion-apk`.
3. Copia el `.apk` al teléfono e instálalo.

También se genera con cada cambio de `web/` en `main`.

### En tu computador (requiere Android Studio)

```bash
cd web
npm install
npm run android:apk
# resultado: android/app/build/outputs/apk/debug/app-debug.apk
```

Es un APK de depuración: sirve para instalarlo directamente, no para Google
Play. Publicar en la tienda requiere una clave de firma propia.

## Cuentas reales y reglas de la base de datos

Ver `docs/SEGURIDAD.md` para el contexto. En resumen, para activar las
cuentas reales y cerrar el acceso anónimo a la base de datos:

```bash
cd web
export GOOGLE_APPLICATION_CREDENTIALS=/ruta/fuera-del-repo/clave-de-servicio.json
npm run gestionar-cuentas -- ayuda
```

Orden recomendado: crear tu cuenta docente, crear una cuenta de estudiante de
prueba y probar ambos roles contra `?db=sandbox`, recién después
`migrar-roster` sobre el curso real, y por último subir `database.rules.json`
(raíz del repositorio) desde Firebase Console → Realtime Database → Reglas,
o con `firebase deploy --only database` si tienes `firebase-tools` instalado.

## Cambiar la clave docente (app nueva)

```bash
cd web
npm run hash-password -- profesor "clave nueva"
```

Pega el resultado en `web/src/config.js` (`profesor.passwordHash`) y mergea.

## Trabajar en el código

```bash
cd web
npm install
npm run dev      # servidor local con recarga automática
npm run check    # lint + pruebas unitarias + build
npm run e2e      # pruebas en navegador real
```
