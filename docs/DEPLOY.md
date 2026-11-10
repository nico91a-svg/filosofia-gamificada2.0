# Publicar la aplicación

Todo el código vive en `web/`. Un mismo build sirve para el sitio y para el APK.

## 1. Sitio web (Firebase Hosting)

Una sola vez en tu computador:

```bash
npm install -g firebase-tools
firebase login
```

Cada vez que quieras publicar, desde la raíz del repositorio:

```bash
./deploy.sh
```

El script instala dependencias, corre las verificaciones y publica en
`https://filosofia-gamificada.web.app`. Si una verificación falla, no publica.

Para probar el resultado antes de publicar:

```bash
cd web && npm run build && npm run preview
```

### App instalable (PWA)

El sitio publicado se puede instalar desde el navegador del teléfono
("Agregar a pantalla de inicio"). Después de la primera visita abre sin red y se
actualiza sola cuando publicas una versión nueva.

## 2. APK de Android

### Desde GitHub (sin instalar nada)

1. Pestaña **Actions** → **Web APK (Android)** → **Run workflow**.
2. Al terminar, descarga el artifact `filosofo-en-formacion-apk`.
3. Copia el `.apk` al teléfono e instálalo.

También se genera solo con cada cambio de `web/` en `main`.

### En tu computador (requiere Android Studio)

```bash
cd web
npm run android:apk
# resultado: android/app/build/outputs/apk/debug/app-debug.apk
```

Es un APK de depuración: sirve para instalarlo directamente, no para Google
Play. Publicar en la tienda requiere una clave de firma propia.

## 3. Probar contra Firebase sin tocar datos reales

Crea `web/.env.local` con:

```
VITE_DB_NAMESPACE=sandbox
```

La app leerá y escribirá bajo `sandbox/...` en la misma base de datos, separada
de los cursos reales.

## 4. Cambiar la clave docente

```bash
cd web
npm run hash-password -- profesor "clave nueva"
```

Pega el resultado en `web/src/config.js` (`profesor.passwordHash`) y publica.
