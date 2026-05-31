# Cómo obtener el APK (sin instalar nada en tu computador)

Ya dejé configurado un **build automático en GitHub** (GitHub Actions). GitHub
compila el APK en sus servidores y te lo deja para descargar. **No necesitas
Expo Go, ni Android Studio, ni cuenta de Expo.**

## Paso 1 — Activar GitHub Actions (solo la primera vez)

1. Entra a tu repo: https://github.com/nico91a-svg/filosofia-gamificada2.0
2. Pestaña **Actions** (arriba).
3. Si te aparece un botón verde **"I understand my workflows, go ahead and enable them"**, púlsalo.

## Paso 2 — Lanzar la compilación

1. En la pestaña **Actions**, en la lista de la izquierda elige **"Build Android APK"**.
2. Botón **"Run workflow"** (a la derecha) → selecciona la rama
   **`claude/web-to-mobile-app-3J0Il`** → **"Run workflow"** (verde).
3. Espera ~10–15 min (verás una bolita amarilla girando → luego un ✓ verde).

## Paso 3 — Descargar el APK

1. Entra a la ejecución que terminó (el ✓ verde).
2. Abajo, sección **"Artifacts"** → descarga **`filosofo-en-formacion-apk`**.
   (Es un `.zip`; ábrelo y dentro está `filosofo-en-formacion.apk`.)

## Paso 4 — Instalar en el celular

1. Pasa el `.apk` al teléfono (WhatsApp a ti mismo, Google Drive, cable…).
2. Tócalo para instalar.
3. Android pedirá permitir **"Instalar apps de fuentes desconocidas"** → acepta.
4. Abre **"Filósofo en Formación"**. ¡Listo!

---

## Clave de acceso

- **Game Master (tú):** modo *Game Master* → **`filosofia2026`**
- **Estudiantes:** usuario y clave que tú creas desde el panel del GM.

La app arranca en **modo local** (datos en el propio teléfono). Para sincronizar
entre dispositivos más adelante, ver `BUILD-APK.md` (sección Firebase).

---

## ¿Prefieres compilar tú mismo? (alternativas)

- **EAS (nube de Expo):** ver `BUILD-APK.md` → Opción A.
- **Local con Android Studio:** ver `BUILD-APK.md` → Opción B.
