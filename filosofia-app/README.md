# Filósofo en Formación — App móvil (Expo / React Native)

App móvil del sistema gamificado de Filosofía, reconstruida desde la web con
**Expo Router + NativeWind + Reanimated + Firebase**. Reutiliza la lógica de
juego original (niveles, XP, habilidades, cofres, artefactos, misiones).

## Modelo de roles

- **Game Master (GM):** único administrador (el docente). Crea estudiantes,
  registra actividades/XP, controla la posición de clase. Login con clave.
- **Estudiante:** inicia sesión con su usuario y contraseña (creados por el GM),
  ve su perfil, XP, radar de habilidades, ranking, vocabulario y abre cofres.

> El roster arranca **vacío**: el GM inscribe a cada estudiante desde la app.
> No se incluye el curso III-B sembrado ni se toca la base de datos de la web.

## Requisitos

- Node 18+ y `npm`
- App **Expo Go** en tu teléfono (o un emulador Android/iOS)

## Puesta en marcha

```bash
cd filosofia-app
npm install
npx expo start         # escanea el QR con Expo Go
```

Sin credenciales de Firebase, la app corre en **modo local** (AsyncStorage):
todo se guarda solo en ese dispositivo. Perfecto para probar.

## Conectar tu Firebase NUEVO (recomendado)

1. Crea un proyecto en <https://console.firebase.google.com> (uno **nuevo**,
   distinto al de la web).
2. Agrega una **app Web** y habilita **Realtime Database**.
3. Copia `.env.example` a `.env` y rellena los valores `EXPO_PUBLIC_FIREBASE_*`.
4. Cambia `EXPO_PUBLIC_GM_PASSWORD` por tu clave de Game Master.
5. Reglas RTDB sugeridas para empezar (ajústalas antes de producción):

   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

   > ⚠️ Estas reglas son abiertas (igual que la web actual). Antes de publicar
   > en una tienda conviene restringir por autenticación/rol.

6. Reinicia: `npx expo start -c`.

## Estructura

```
app/                      # rutas (expo-router)
  _layout.tsx             # raíz: gestos + safe area + init del store
  index.tsx               # redirección según sesión
  login.tsx               # GM o estudiante
  (estudiante)/           # tabs: perfil, aventura, actividades, ranking, mas
  (gm)/                   # tabs: panel, estudiantes, registro
src/
  domain/                 # LÓGICA DE JUEGO (portada de la web)
    data/*.json           # datos migrados (niveles, artefactos, unidades…)
    cofres.ts niveles.ts habilidades.ts xp.ts misiones.ts types.ts
  components/game/        # ChestOpening, RadarChart, XPBar
  components/ui/          # Button, Screen
  services/               # firebase.ts, database.ts
  store/                  # useGameStore (Zustand)
  theme/                  # colores / avatares
```

## Regenerar los datos desde la web

Si actualizas `filosofia-gamificada-main/js/data/*.js`:

```bash
npm run convert-data      # reescribe src/domain/data/*.json
```

## Próximo paso: estética

La base visual es funcional (paleta indigo/púrpura/ámbar heredada). Para el
rediseño fino (ilustraciones, íconos de nivel, tipografías, splash, animaciones
de marca) se documentarán recomendaciones aparte y se puede apoyar con un
asistente de diseño. Ver `docs/plans/2026-05-30-plan-maestro-app-movil.md`.
