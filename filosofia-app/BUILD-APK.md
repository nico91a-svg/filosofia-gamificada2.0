# Generar el APK (Android) — "El Liceo de los Filósofos"

El APK es una app instalable de verdad: **no necesita Expo Go ni red local**.
La forma más simple es con **EAS Build** (la nube de Expo: compila por ti, no
necesitas instalar Android Studio).

---

## Opción A — EAS Build en la nube (recomendada) ☁️

### 1. Cuenta de Expo (gratis)
Crea una cuenta en https://expo.dev (botón *Sign up*). Es gratis.

### 2. Instala la herramienta EAS (una vez)
En tu computador, en cualquier terminal:
```bash
npm install -g eas-cli
```

### 3. Entra al proyecto y haz login
```bash
cd filosofia-gamificada2.0/filosofia-app
eas login          # usa el correo y clave de tu cuenta Expo
```

### 4. Vincula el proyecto (una vez)
```bash
eas init
```
Acepta crear el proyecto. Esto rellena automáticamente el `projectId`.

### 5. ¡Compila el APK!
```bash
eas build -p android --profile preview
```
- Tardará ~10–15 min (compila en la nube).
- Al terminar te da un **enlace** para **descargar el `.apk`** (también queda en
  tu panel en https://expo.dev → tu proyecto → *Builds*).

### 6. Instálalo en el celular
1. Abre el enlace del `.apk` desde el **celular** (o pásalo por WhatsApp/Drive).
2. Toca el archivo para instalar.
3. Android pedirá permitir **"Instalar apps de fuentes desconocidas"** → acepta.
4. ¡Abre "Filósofo en Formación" y listo!

---

## Opción B — Build local (sin nube)

Requiere tener instalado **Android Studio + JDK 17** y un equipo Linux/macOS:
```bash
cd filosofia-app
eas build -p android --profile preview --local
```
Genera el `.apk` en tu disco. (Más complejo; usa la Opción A si puedes.)

---

## Clave de acceso

- **Game Master (tú):** modo *Game Master* → contraseña **`filosofia2026`**.
- **Estudiantes:** usuario y clave que tú creas desde el panel del GM.

> La clave del GM viene "horneada" en el APK desde `eas.json`
> (`build.preview.env.EXPO_PUBLIC_GM_PASSWORD`). Para cambiarla, edita ese valor
> antes de compilar.

## Datos y sincronización

- Sin Firebase configurado, la app guarda **todo en el propio teléfono** (modo
  local). Perfecto para probar.
- Para sincronizar entre dispositivos (tu celular + los de estudiantes), crea un
  proyecto Firebase nuevo y agrega sus credenciales `EXPO_PUBLIC_FIREBASE_*` en el
  bloque `env` de `eas.json` (perfil `preview`) y vuelve a compilar. Las claves de
  Firebase del cliente son públicas por diseño; aun así, configura las **reglas**
  de la Realtime Database antes de usarla con el curso.

## Subir versión

Para una nueva versión, sube `expo.android.versionCode` en `app.json` (1 → 2 → …)
y vuelve a ejecutar el build.
