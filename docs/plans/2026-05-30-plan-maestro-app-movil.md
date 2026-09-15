# Plan Maestro: De Web a App Móvil — "Filósofo en Formación"

> **Proyecto analizado:** Sistema gamificado de Filosofía III Medio (curso III-B, 35 estudiantes).
> **Público objetivo:** Estudiantes 17-18 años (nativos digitales, uso intensivo de móvil vertical) + 1 docente.
> **Stack actual:** React 18 (UMD) + Babel en navegador + Tailwind CDN + Firebase Realtime DB (compat). Roles: profesor / estudiante.
> **Mecánicas existentes:** XP, 10 niveles (variantes de género), radar de 6 habilidades (H1–H6), badges, **cofres con animación de apertura**, 20 artefactos por rareza, vocabulario descubrible, mapa de unidades/clases, misiones de clase, trueque de artefactos entre estudiantes.

---

## Diagnóstico previo (por qué el estado actual NO es apto para móvil)

| Problema actual | Impacto en móvil |
|---|---|
| Babel Standalone transpila JSX **en el navegador** en cada carga | 1–3 s de "pantalla blanca" + consumo de CPU/batería brutal en gama media. Crítico. |
| 9 scripts `data/*.js` + React/Tailwind por **CDN sin bundle ni caché** | Inutilizable sin red; cada apertura re-descarga ~500 KB. |
| `setTimeout(checkAndRender, 500)` como arranque | Arranque frágil y lento percibido. |
| Tailwind por CDN (JIT en runtime) | No funciona offline, recalcula estilos en cliente. |
| Credenciales Firebase y password docente **hardcodeadas en `config.js`** | Riesgo de seguridad: cualquiera lee la DB. Reglas RTDB deben revisarse. |
| Dashboards de 1.300+ líneas en un solo `.jsx` | Difícil de optimizar/memoizar; re-renders globales. |

**Conclusión:** la lógica de juego (`js/data/*`, `abrirCofre`, niveles, XP) es excelente y 100% reutilizable. Lo que hay que reconstruir es **la capa de presentación y el empaquetado**.

---

## Decisión de arquitectura (recomendada)

**Ruta elegida: Expo (React Native) + NativeWind + Reanimated**, reutilizando la lógica de dominio existente casi verbatim.

- **Por qué no solo PWA/Capacitor:** funcionaría (reusa el 100% del código web) y es la ruta "rápida", pero el público objetivo vive en el móvil y la experiencia táctil/animaciones (cofres, radar, swipes) se siente nativa solo con RN + Reanimated 60fps. Capacitor queda como **plan B** si el plazo es muy corto.
- **NativeWind** = Tailwind real en RN → migración 1:1 de las clases `from-indigo-900`, `text-purple-300`, etc. que ya usas.
- **Reanimated 3 + Moti** = animaciones de cofre/level-up corriendo en el hilo de UI (no JS), sin lag.
- **Firebase JS SDK (modular)** reemplaza el `compat` por CDN; los listeners `on('value')` migran casi idénticos.

> Plan B (PWA): `vite` + plugin PWA + Capacitor para envolver en APK/IPA. Reusa los `.jsx` actuales. Documentado al final.

---

# FASE 1 — Rediseño de UX/UI Mobile-First

### 1.1 Traducción de controles escritorio → gestos nativos

| Interacción web actual | Gesto móvil nativo | Dónde aplica en TU app |
|---|---|---|
| Click en tab inferior | **Tap** (ya existe bottom-nav de 6 tabs) | `EstudianteDashboard` — reducir a **5 tabs** (ver 1.2) |
| Click "🔓 Abrir Cofre" | **Long-press para "forzar"** + tap normal; animación de apertura con **arrastre hacia arriba** opcional | Pestaña Artefactos |
| Hover sobre artefacto (tooltip) | **Tap → bottom sheet** con detalle/efecto/rareza | Inventario |
| Acordeón unidades (`toggleUnidad`) | **Tap para expandir** + el mapa como scroll vertical con snap | Pestaña Aventura/Mapa |
| Selección de estudiante para trueque (`select`) | **Bottom sheet con buscador** (35 nombres no caben en dropdown) | Modal de trueque |
| Radar chart estático | **Pinch-to-zoom + tap en vértice** muestra valor de la habilidad | Pestaña Perfil |
| Registro masivo del profe (tabla) | **Swipe en fila** → asignar XP / eliminar; **+XP con stepper** táctil | `RegistroMasivo` |
| Cierre de modales con X | **Swipe-down to dismiss** en todos los bottom sheets | `Modals.jsx` |
| `alert()` de "Credenciales incorrectas" | **Toast/Haptic feedback** (vibración) | Login |

**Regla de oro táctil:** todo target ≥ 44×44 pt. Los botones de cofre y los tabs ya están cerca; auditarlos.

### 1.2 Jerarquía visual y uso del espacio

**Estudiante (vista principal).** Hoy hay **6 tabs** (Perfil, Aventura, Ranking, Vocabulario, Actividades, Artefactos). En móvil 6 ítems aprietan demasiado:

- **Bottom-nav = 5 ítems máximo:** `Perfil` · `Aventura` · `Actividades` · `Ranking` · `Más`.
- **"Más"** = bottom sheet que agrupa **Vocabulario** + **Artefactos/Cofres** + ajustes/logout.
- **Excepción:** si hay **cofres pendientes** (`pendingChests > 0`), Artefactos sube a la barra con **badge numérico** y animación de rebote → el premio nunca se esconde.

**Header del estudiante (sticky, compacto):** avatar de nivel (emoji) + nombre social + barra de XP delgada con el nivel a la izquierda. Nada más. El logout va dentro de "Más".

**Qué queda a la vista vs. oculto:**
- A la vista siempre: nivel, XP, tab actual, cofres pendientes.
- En bottom sheet (on-demand): detalle de artefacto, trueque, confirmación de uso, detalle de vocabulario, ajustes.
- El **mapa de unidades** pasa a scroll vertical con tarjetas-clase tipo "camino" (snap), no acordeón denso.

**Profesor.** Es un panel de gestión → prioridad **tablet/horizontal** y "modo escritorio" tolerado. En teléfono:
- Acción primaria **"Registrar actividad"** como **FAB** (botón flotante).
- Lista de estudiantes con **búsqueda fija arriba** + filas con swipe-actions.
- Gestión de unidades y registro masivo detrás de un **drawer lateral**.

### 1.3 User Flow optimizado (acción principal del estudiante)

La acción principal del estudiante es **revisar su progreso y abrir cofres ganados**. Flujo objetivo: **≤ 3 taps desde abrir la app hasta el premio**.

```
[Abrir app]
   └─ Splash nativo (assets locales, sin Babel) ── <800ms
        └─ ¿Sesión guardada? ──No──► Login (nombre social + pass) ─┐
              │Sí                                                  │
              ▼                                                    ▼
        [Home = Perfil]  ◄───────────────────────────────────────┘
              │  Banner contextual si hay cofre: "🎁 ¡Tienes 2 cofres!" (tap)
              ▼
        [Tab Artefactos]  →  tap "Abrir Cofre"
              ▼
        [Animación de apertura 1.5s + haptics]  →  Reveal artefacto (rareza)
              ▼
        [Bottom sheet: "Usar" / "Guardar" / "Intercambiar"]
```

Micro-decisiones de fricción cero:
- **Persistencia de sesión** (AsyncStorage) → estudiantes 17-18 no quieren re-loguearse a diario.
- **Login por nombre social** ya implementado; añadir autocompletado de los 35 nombres.
- **Haptics** en level-up, apertura de cofre y badge nuevo (refuerzo de recompensa variable, clave a esta edad).

---

# FASE 2 — Optimización de Rendimiento

### 2.1 Gestión de recursos

1. **Eliminar Babel-in-browser** (causa #1 de lag/batería). Pasar a build precompilado de Expo/Metro. Solo este cambio multiplica el rendimiento percibido.
2. **Emojis como assets, no como recompute:** los emojis de nivel/artefacto son texto Unicode (barato). Mantenerlos como texto; **no** convertir a imágenes salvo el splash y el ícono de app.
3. **Animaciones en hilo UI:** Reanimated 3 corre en el hilo nativo → la animación del cofre y el level-up no bloquean JS ni disparan re-renders de los 35 estudiantes.
4. **Memoización del ranking:** `Ranking` ordena 35 estudiantes en cada render. Envolver en `useMemo([students])` y las filas en `React.memo`. Usar **`FlatList`** (virtualización) en ranking, inventario y mapa.
5. **Selector de estudiante actual:** hoy `App.jsx` re-renderiza todo al cambiar `students`. Separar el estado del estudiante logueado del array global, o usar Zustand con selectores para que un cambio de XP no re-renderice el mapa entero.
6. **Listeners Firebase acotados:** en vez de `ref('students').on('value')` (descarga los 35 en cada cambio), el estudiante escucha **solo su nodo** `ref('students/<id>')`; el ranking lee un nodo agregado liviano `{id, nombre, xp, nivel}`. Reduce ancho de banda y batería de radio.
7. **Throttle de escrituras:** los `useEffect` que hacen `save()` en cada cambio deben **debounce 500–800ms** para no martillar la red al sumar XP en ráfaga.

### 2.2 Estrategia de Caché / Offline

El aula puede tener wifi inestable → **offline-first** es requisito, no lujo. Buena noticia: ya existe fallback a `localStorage`; lo formalizamos.

| Función | ¿Offline? | Mecanismo |
|---|---|---|
| Ver perfil, nivel, XP, radar | ✅ Total | Snapshot local (AsyncStorage / `firebase` persistence) |
| Ver inventario y **abrir cofres** | ✅ Total | `abrirCofre()` es lógica pura local; el resultado se encola y sincroniza al reconectar |
| Ver ranking | ✅ Cacheado | Último snapshot conocido + sello "actualizado hace X" |
| Ver vocabulario / mapa | ✅ Total | Data estática empaquetada en la app (`js/data/*`) |
| Trueque entre estudiantes | ❌ Requiere red | Necesita consenso entre dos cuentas → bloquear con mensaje claro |
| Profesor asigna XP | ⚠️ Cola | Escribir en cola local; aplicar al reconectar con resolución por timestamp |

Implementación: **Firebase RTDB con `setPersistenceEnabled(true)`** (RN) + cola de mutaciones propia para acciones críticas (cofre abierto, XP ganado) con `id` idempotente, para no duplicar premios si se reenvía.

---

# FASE 3 — Arquitectura y Componentes

### 3.1 Estructura de archivos recomendada (Expo + RN)

```
filosofia-app/
├── app/                          # expo-router (file-based routing)
│   ├── _layout.tsx               # Stack raíz + AuthProvider + carga de fuentes
│   ├── login.tsx
│   ├── (estudiante)/
│   │   ├── _layout.tsx           # Bottom tabs (5)
│   │   ├── perfil.tsx
│   │   ├── aventura.tsx          # mapa de unidades/clases
│   │   ├── actividades.tsx
│   │   ├── ranking.tsx
│   │   └── mas.tsx               # vocabulario + artefactos + ajustes
│   └── (profesor)/
│       ├── _layout.tsx           # drawer
│       ├── registro.tsx
│       ├── unidades.tsx
│       └── estudiantes.tsx
├── src/
│   ├── domain/                   # ← LÓGICA REUTILIZADA del proyecto web
│   │   ├── data/                 # niveles, habilidades, badges, artefactos,
│   │   │   ├── artefactos.ts     #   misiones, unidades, tipos-actividad...
│   │   │   └── ...               #   (migrados de js/data/*.js casi 1:1)
│   │   ├── cofres.ts             # abrirCofre(), COFRES, getRarezaColor()
│   │   ├── niveles.ts            # cálculo de nivel a partir de XP
│   │   └── xp.ts                 # efectos de artefactos, multiplicadores
│   ├── components/
│   │   ├── ui/                   # Button, Sheet, Toast, Stepper (44pt targets)
│   │   ├── game/
│   │   │   ├── ChestOpening.tsx  # ← componente estrella (Fase 4)
│   │   │   ├── RadarChart.tsx    # con react-native-svg
│   │   │   ├── XPBar.tsx
│   │   │   ├── LevelUpModal.tsx
│   │   │   └── ArtefactoCard.tsx
│   ├── services/
│   │   ├── firebase.ts           # init modular + persistence
│   │   ├── database.ts           # save/load/loadOnce (API igual a la web)
│   │   └── syncQueue.ts          # cola offline idempotente
│   ├── store/
│   │   └── useGameStore.ts       # Zustand: user, students, activities
│   ├── hooks/
│   │   ├── useHaptics.ts
│   │   └── useStudent.ts
│   └── theme/
│       └── colors.ts             # paleta indigo/purple/pink existente
├── assets/                       # icon, splash, fuentes
├── tailwind.config.js            # NativeWind
├── app.json                      # config Expo (nombre, splash, permisos)
└── package.json
```

**Principio:** `src/domain/` se copia desde `js/data/` con cambios mínimos (export ES modules + tipos). Es el activo que NO se reescribe.

### 3.2 Los 3 componentes interactivos más críticos

**1. `ChestOpening` (apertura de cofre) — el momento de dopamina del producto.**
Lógica: recibe `tipoCofre` (bronce/plata/oro). Al montar → fase *idle* (cofre flotando). Al tap → fase *shake* (vibración + temblor 1s, intensidad según rareza esperada) → llama `abrirCofre(tipo)` (puro, ya existe la tabla de probabilidades 70/22/7/1 etc.) → fase *burst* (destello + partículas, color = `getRarezaColor`) → fase *reveal* (artefacto sube con spring). Estado: máquina de 4 estados con Reanimated `withSequence/withSpring`. Idempotencia: marca el cofre como abierto en la cola de sync ANTES de animar para no duplicar premio si se cierra la app.

**2. `RadarChart` de 6 habilidades — diagnóstico visual del estudiante.**
Lógica: recibe `habilidades {H1..H6}`. Calcula 6 vértices con trigonometría (`cos/sin` cada 60°), normaliza valor/máximo a radio. Render con `react-native-svg` (`Polygon` animado). Interacción: tap en vértice → tooltip con nombre de la habilidad (`window.HABILIDADES`) y valor; pinch-to-zoom. Anima el polígono cuando suben los puntos (transición de `points`).

**3. `RegistroMasivo` / asignación de XP del profesor — el motor de datos.**
Lógica: lista virtualizada (`FlatList`) de 35 estudiantes; cada fila con **stepper de XP** y selector de tipo de actividad (`window.TIPOS_ACTIVIDAD`). Al confirmar: aplica efectos de artefactos activos (x1.3, x1.5, doble XP, +XP fijos), recalcula nivel, detecta level-up y **otorga cofre** según reglas, registra `activity` con timestamp. Debe ser **transaccional y encolable** (offline). Es el componente con más reglas de negocio → vive apoyado en `src/domain/xp.ts`.

---

# FASE 4 — Código de Muestra (Prototipo Funcional)

Componente elegido: **`ChestOpening`** — el más interactivo y el corazón emocional de la gamificación. React Native + NativeWind + Reanimated 3 + Haptics. Reutiliza tu `abrirCofre()` y `getRarezaColor()` sin cambios de lógica.

```tsx
// src/components/game/ChestOpening.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { abrirCofre, COFRES, RAREZA_GLOW } from '../../domain/cofres';
import type { TipoCofre, Artefacto } from '../../domain/types';

type Fase = 'idle' | 'shake' | 'burst' | 'reveal';

interface Props {
  tipoCofre: TipoCofre;                 // 'bronce' | 'plata' | 'oro'
  onClaim: (art: Artefacto) => void;    // persiste + cierra (debe ser idempotente)
}

export function ChestOpening({ tipoCofre, onClaim }: Props) {
  const [fase, setFase] = useState<Fase>('idle');
  const [premio, setPremio] = useState<Artefacto | null>(null);
  const cofre = COFRES[tipoCofre];

  // ---- Valores animados (corren en el hilo de UI, no en JS) ----
  const rotation = useSharedValue(0);   // temblor del cofre
  const scale = useSharedValue(1);      // "respiración" idle / pop final
  const glow = useSharedValue(0.4);     // halo de luz
  const burst = useSharedValue(0);      // destello de apertura
  const revealY = useSharedValue(40);   // entrada del artefacto
  const revealOpacity = useSharedValue(0);

  // Respiración sutil mientras está cerrado (feedback de "tócame")
  React.useEffect(() => {
    if (fase === 'idle') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
      glow.value = withRepeat(withTiming(0.7, { duration: 900 }), -1, true);
    }
  }, [fase]);

  // ---- Secuencia principal de apertura ----
  const abrir = useCallback(() => {
    if (fase !== 'idle') return;
    setFase('shake');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 1) Lógica de dominio PRIMERO (idempotencia: el premio ya está "decidido")
    const resultado = abrirCofre(tipoCofre);  // usa probabilidades 70/22/7/1...
    setPremio(resultado);

    // 2) Temblor creciente (~1s). Más violento = mayor expectativa.
    rotation.value = withSequence(
      withRepeat(withTiming(0.05, { duration: 60 }), 6, true),
      withRepeat(withTiming(0.12, { duration: 45 }), 8, true),
      withTiming(0, { duration: 80 }, (finished) => {
        if (finished) runOnJS(triggerBurst)(resultado);
      }),
    );
  }, [fase, tipoCofre]);

  // 3) Destello + 4) reveal con spring
  const triggerBurst = (resultado: Artefacto) => {
    setFase('burst');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    burst.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 420 }),
    );
    scale.value = withSequence(
      withTiming(1.25, { duration: 150 }),
      withSpring(1, { damping: 6 }),
    );

    setTimeout(() => {
      setFase('reveal');
      revealOpacity.value = withTiming(1, { duration: 300 });
      revealY.value = withSpring(0, { damping: 10, stiffness: 120 });
    }, 260);
  };

  // ---- Estilos animados ----
  const cofreStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.6 }],
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: 0.5 + burst.value * 2 }],
  }));
  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
    transform: [{ translateY: revealY.value }],
  }));

  const rarezaColor = premio ? RAREZA_GLOW[premio.rareza] : '#fde68a';

  return (
    <View className="flex-1 items-center justify-center bg-black/80 px-6">
      {/* Halo de luz detrás del cofre (color según rareza tras abrir) */}
      <Animated.View
        pointerEvents="none"
        style={[glowStyle, { backgroundColor: rarezaColor }]}
        className="absolute h-64 w-64 rounded-full blur-3xl opacity-60"
      />

      {/* Destello de apertura */}
      {fase === 'burst' && (
        <Animated.View
          pointerEvents="none"
          style={[burstStyle, { backgroundColor: rarezaColor }]}
          className="absolute h-72 w-72 rounded-full"
        />
      )}

      {/* El cofre (tocable solo en idle) */}
      {fase !== 'reveal' && (
        <Pressable onPress={abrir} disabled={fase !== 'idle'}>
          <Animated.View style={cofreStyle} className="items-center">
            <Text style={{ fontSize: 120 }}>{cofre.emoji}</Text>
            {fase === 'idle' && (
              <Text className="mt-4 text-base font-bold text-amber-200">
                Toca para abrir · {cofre.nombre}
              </Text>
            )}
          </Animated.View>
        </Pressable>
      )}

      {/* Revelado del artefacto */}
      {fase === 'reveal' && premio && (
        <Animated.View style={revealStyle} className="items-center">
          <Text style={{ fontSize: 96 }}>{premio.emoji}</Text>
          <Text
            className="mt-3 text-2xl font-extrabold"
            style={{ color: rarezaColor }}
          >
            {premio.nombre}
          </Text>
          <Text className="mt-1 text-sm uppercase tracking-widest text-white/70">
            {premio.rareza}
          </Text>
          <Text className="mt-2 text-center text-base text-purple-200">
            {premio.efecto}
          </Text>

          <Pressable
            onPress={() => onClaim(premio)}   // persiste de forma idempotente
            className="mt-8 rounded-2xl bg-amber-400 px-10 py-4 active:opacity-80"
          >
            <Text className="text-lg font-bold text-amber-950">¡Reclamar!</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
```

```ts
// src/domain/cofres.ts  — migrado 1:1 desde js/data/artefactos.js (lógica intacta)
import { ARTEFACTOS } from './data/artefactos';
import type { Artefacto, TipoCofre, Rareza } from './types';

export const COFRES = {
  bronce: { nombre: 'Cofre de Bronce', emoji: '🥉', probabilidades: { comun: 70, raro: 22, epico: 7, legendario: 1 } },
  plata:  { nombre: 'Cofre de Plata',  emoji: '🥈', probabilidades: { comun: 50, raro: 30, epico: 15, legendario: 5 } },
  oro:    { nombre: 'Cofre de Oro',    emoji: '🥇', probabilidades: { comun: 30, raro: 35, epico: 25, legendario: 10 } },
} as const;

// Glow por rareza (para halo/destello en la UI)
export const RAREZA_GLOW: Record<Rareza, string> = {
  comun: '#9ca3af', raro: '#60a5fa', epico: '#c084fc', legendario: '#fbbf24',
};

export function abrirCofre(tipoCofre: TipoCofre): Artefacto {
  const prob = COFRES[tipoCofre].probabilidades;
  const roll = Math.random() * 100;
  let rareza: Rareza;
  if (roll < prob.legendario) rareza = 'legendario';
  else if (roll < prob.legendario + prob.epico) rareza = 'epico';
  else if (roll < prob.legendario + prob.epico + prob.raro) rareza = 'raro';
  else rareza = 'comun';

  const candidatos = ARTEFACTOS.filter((a) => a.rareza === rareza);
  return candidatos[Math.floor(Math.random() * candidatos.length)];
}
```

**Por qué este diseño es fluido y robusto:**
- Toda la animación corre en el **hilo de UI** (Reanimated) → 60fps aunque JS esté ocupado sincronizando con Firebase.
- La **lógica de dominio se resuelve antes** de animar → el premio es determinista y se puede encolar offline sin riesgo de duplicado.
- **Haptics** en shake (Medium) y reveal (Success) refuerzan la recompensa — clave para la motivación a los 17-18 años.
- El color del halo/destello **se adapta a la rareza** → el cerebro anticipa "esto es legendario" antes de leer el texto.

---

## Roadmap de migración sugerido (orden de ejecución)

1. **Semana 1:** Scaffold Expo + NativeWind + expo-router. Migrar `js/data/*` → `src/domain/`. Firebase modular + persistence.
2. **Semana 2:** Auth con sesión persistente + tabs estudiante + `XPBar`/`RadarChart`.
3. **Semana 3:** `ChestOpening`, inventario, level-up, haptics. Cola offline idempotente.
4. **Semana 4:** Panel profesor (FAB + FlatList + swipe-actions) + registro masivo transaccional.
5. **Semana 5:** Pulido de performance (memo, FlatList, debounce de saves), pruebas en gama media, build EAS (APK/IPA).

> **Plan B exprés (si el plazo es de días, no semanas):** envolver el web actual con **Vite + vite-plugin-pwa + Capacitor**. Reusa los `.jsx` tal cual, da instalación en pantalla de inicio y caché offline básica, pero **sin** las animaciones nativas a 60fps ni los haptics. Sirve como puente mientras se construye la versión RN.

> **Seguridad (hacer ya, independiente de la ruta):** mover el password docente fuera de `config.js`, revisar las **reglas de Firebase RTDB** (hoy la DB parece abierta a lectura/escritura) y restringir por rol antes de publicar la app en una tienda.
