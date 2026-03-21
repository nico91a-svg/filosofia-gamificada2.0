# Sistema de Cofres, Artefactos y Limites - Plan de Implementacion

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Agregar sistema de cofres con loot aleatorio, ampliar artefactos a 20, y limitar participaciones diarias a 2 con XP.

**Architecture:** Los cofres se almacenan en el array `artefactos` de cada estudiante con tipo `cofre`. Al abrir, se sortea un artefacto segun probabilidades y se reemplaza el cofre por el artefacto. El limite de participacion se aplica en `addActivity` contando actividades del dia.

**Tech Stack:** React 18 CDN, Babel in-browser, Tailwind CDN, Firebase Realtime DB. Sin build system ni npm.

**Base path:** `filosofia-gamificada-main/filosofia-gamificada-main/`

---

## Task 1: Ampliar catalogo de artefactos a 20

**Files:**
- Modify: `js/data/artefactos.js`

**Step 1: Reemplazar contenido de artefactos.js**

Reemplazar todo `window.ARTEFACTOS` con los 20 artefactos nuevos. Agregar rareza `comun` al mapa de colores. Agregar constantes de cofres y probabilidades de loot.

```javascript
// Catalogo de artefactos filosoficos
window.ARTEFACTOS = [
    // --- COMUNES (8) ---
    { id: 'A1', nombre: 'Cuaderno de Notas', emoji: '📓', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A2', nombre: 'Vela del Estudio', emoji: '🕯️', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A3', nombre: 'Reloj de Arena', emoji: '⏳', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A4', nombre: 'Tintero Antiguo', emoji: '🪶', rareza: 'comun', efecto: '+10 XP extra proxima actividad', esDecorativo: false },
    { id: 'A5', nombre: 'Moneda del Agora', emoji: '🪙', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A6', nombre: 'Mapa de Atenas', emoji: '🗺️', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A7', nombre: 'Piedra de Sisifo', emoji: '🪨', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A8', nombre: 'Copa de Socrates', emoji: '🏆', rareza: 'comun', efecto: '+10 XP extra proxima actividad', esDecorativo: false },
    // --- RAROS (5) ---
    { id: 'A9', nombre: 'Pergamino Antiguo', emoji: '📜', rareza: 'raro', efecto: '+50 pts a una habilidad', esDecorativo: false },
    { id: 'A10', nombre: 'Mascara de Diogenes', emoji: '🎭', rareza: 'raro', efecto: 'Proteccion: anula 0 XP por limite diario', esDecorativo: false },
    { id: 'A11', nombre: 'Pluma de Platon', emoji: '✒️', rareza: 'raro', efecto: '+25 XP extra en ensayo', esDecorativo: false },
    { id: 'A12', nombre: 'Libro de Tales', emoji: '📕', rareza: 'raro', efecto: 'Revela 1 termino de vocabulario', esDecorativo: false },
    { id: 'A13', nombre: 'Balanza de Justicia', emoji: '⚖️', rareza: 'raro', efecto: '+30 XP extra proxima actividad', esDecorativo: false },
    // --- EPICOS (4) ---
    { id: 'A14', nombre: 'Orbe del Conocimiento', emoji: '🔮', rareza: 'epico', efecto: 'Revela 3 terminos de vocabulario', esDecorativo: false },
    { id: 'A15', nombre: 'Brujula de Descartes', emoji: '🧭', rareza: 'epico', efecto: 'x1.3 XP por 1 semana', esDecorativo: false },
    { id: 'A16', nombre: 'Llave de Socrates', emoji: '🗝️', rareza: 'epico', efecto: 'Otorga un badge al azar', esDecorativo: false },
    { id: 'A17', nombre: 'Espejo de Aristoteles', emoji: '🪞', rareza: 'epico', efecto: '+100 XP directos', esDecorativo: false },
    // --- LEGENDARIOS (3) ---
    { id: 'A18', nombre: 'Anfora de la Sabiduria', emoji: '🏺', rareza: 'legendario', efecto: 'Duplica XP proxima actividad', esDecorativo: false },
    { id: 'A19', nombre: 'Gema de Aristoteles', emoji: '💎', rareza: 'legendario', efecto: 'x1.5 XP por 1 semana', esDecorativo: false },
    { id: 'A20', nombre: 'Corona del Filosofo', emoji: '👑', rareza: 'legendario', efecto: 'Otorga un cofre de oro extra', esDecorativo: false }
];

window.getRarezaColor = function(rareza) {
    var colores = {
        'comun': 'border-gray-400 bg-gray-50',
        'raro': 'border-blue-400 bg-blue-50',
        'epico': 'border-purple-400 bg-purple-50',
        'legendario': 'border-yellow-400 bg-yellow-50'
    };
    return colores[rareza] || 'border-gray-400 bg-gray-50';
};

// --- SISTEMA DE COFRES ---
window.COFRES = {
    bronce: { nombre: 'Cofre de Bronce', emoji: '🥉', probabilidades: { comun: 70, raro: 22, epico: 7, legendario: 1 } },
    plata:  { nombre: 'Cofre de Plata',  emoji: '🥈', probabilidades: { comun: 50, raro: 30, epico: 15, legendario: 5 } },
    oro:    { nombre: 'Cofre de Oro',     emoji: '🥇', probabilidades: { comun: 30, raro: 35, epico: 25, legendario: 10 } }
};

// Actividades que otorgan cofre (las de proceso y evaluacion)
window.ACTIVIDADES_CON_COFRE = ['ensayo', 'proyecto', 'investigacion', 'presentacion', 'debate', 'bitacora', 'mapa', 'experimento'];

// Determinar tipo de cofre segun actividad y nivel
window.getCofre = function(tipo, nivel) {
    if (!window.ACTIVIDADES_CON_COFRE.includes(tipo)) return null;
    if (nivel === 'avanzado' || nivel === 'excepcional') return 'oro';
    if (nivel === 'basico' || nivel === 'competente') return 'plata';
    return 'bronce';
};

// Sortear artefacto de un cofre
window.abrirCofre = function(tipoCofre) {
    var cofre = window.COFRES[tipoCofre];
    if (!cofre) return null;
    var prob = cofre.probabilidades;
    var roll = Math.random() * 100;
    var rareza;
    if (roll < prob.legendario) rareza = 'legendario';
    else if (roll < prob.legendario + prob.epico) rareza = 'epico';
    else if (roll < prob.legendario + prob.epico + prob.raro) rareza = 'raro';
    else rareza = 'comun';
    // Filtrar artefactos de esa rareza y elegir uno al azar
    var candidatos = window.ARTEFACTOS.filter(function(a) { return a.rareza === rareza; });
    return candidatos[Math.floor(Math.random() * candidatos.length)];
};
```

**Step 2: Verificar que compila**

Abrir preview, evaluar `window.ARTEFACTOS.length === 20 && window.COFRES && typeof window.abrirCofre === 'function'`.
Esperado: `true`

**Step 3: Commit**

```bash
git add filosofia-gamificada-main/js/data/artefactos.js
git commit -m "feat: ampliar catalogo a 20 artefactos con sistema de cofres y loot"
```

---

## Task 2: Limite de participacion diaria en addActivity

**Files:**
- Modify: `js/components/profesor/ProfesorDashboard.jsx` (funcion `addActivity`, lineas ~208-236)

**Step 1: Modificar addActivity para aplicar limite y otorgar cofres**

En la funcion `addActivity` del ProfesorDashboard, ANTES de la linea `addXP(data.studentId, data.xp)` (linea 225), agregar:

1. Conteo de participaciones del dia para el estudiante
2. Si es participacion y ya tiene 2+ hoy, forzar xp=0 y agregar nota
3. Despues de registrar, si la actividad da cofre, agregar cofre al inventario

```javascript
function addActivity(data) {
    var xpFinal = data.xp;
    var notasExtra = data.notas || '';

    // --- LIMITE PARTICIPACION: max 2 por dia ---
    if (data.tipo === 'participacion') {
        var hoy = new Date().toISOString().split('T')[0];
        var participacionesHoy = activities.filter(function(a) {
            return a.studentId === data.studentId &&
                   a.tipo === 'participacion' &&
                   a.date && a.date.split('T')[0] === hoy;
        }).length;
        if (participacionesHoy >= 2) {
            xpFinal = 0;
            notasExtra = (notasExtra ? notasExtra + ' | ' : '') + 'Limite diario alcanzado (2/2)';
        }
    }

    var newActivity = {
        id: Date.now(),
        studentId: data.studentId,
        tipo: data.tipo,
        nivel: data.nivel,
        xp: xpFinal,
        notas: notasExtra,
        comentario: data.comentario || '',
        unidadId: data.unidadId || currentUnidad,
        claseNum: data.claseNum || currentClase,
        date: new Date().toISOString(),
        habilidades: data.habilidades || {}
    };
    var updatedActivities = [newActivity].concat(activities);
    setActivities(function() { return updatedActivities; });
    // Otorgar XP (ya ajustado)
    if (xpFinal > 0) {
        addXP(data.studentId, xpFinal);
    }
    // Otorgar puntos de habilidad (solo si hubo XP)
    if (xpFinal > 0) {
        var habPoints = data.habilidades || {};
        Object.keys(habPoints).forEach(function(habId) {
            if (habPoints[habId] > 0) {
                addHabilidadPoints(data.studentId, habId, habPoints[habId]);
            }
        });
    }
    // Verificar y otorgar badges automaticos
    checkAndGrantBadges(data.studentId, data.tipo, updatedActivities);

    // --- OTORGAR COFRE si la actividad lo merece ---
    var tipoCofre = window.getCofre ? window.getCofre(data.tipo, data.nivel) : null;
    if (tipoCofre) {
        addArtefacto(data.studentId, 'cofre_' + tipoCofre);
    }

    setShowAddActivity(false);
}
```

**Step 2: Verificar que compila**

Evaluar en preview que el archivo JSX compila sin errores de Babel.

**Step 3: Commit**

```bash
git add filosofia-gamificada-main/js/components/profesor/ProfesorDashboard.jsx
git commit -m "feat: limite 2 participaciones/dia y otorgar cofres al registrar"
```

---

## Task 3: Indicador de limite diario en Registro Masivo

**Files:**
- Modify: `js/components/profesor/RegistroMasivo.jsx`

**Step 1: Agregar prop activities y mostrar indicador**

Agregar `activities` a los props del componente. En el grid de estudiantes, calcular participaciones del dia y mostrar advertencia.

Cambiar la firma:
```javascript
window.RegistroMasivo = ({ students, unidades, addActivity, setStudents, activities }) => {
```

En el render de cada estudiante (dentro del grid, despues de la linea de XP), agregar:

```jsx
{tipo === 'participacion' && (() => {
    var hoy = new Date().toISOString().split('T')[0];
    var count = (activities || []).filter(a =>
        a.studentId === student.id &&
        a.tipo === 'participacion' &&
        a.date && a.date.split('T')[0] === hoy
    ).length;
    return count >= 2 ? (
        <span className="text-xs text-amber-600 font-semibold">⚠️ {count}/2 hoy</span>
    ) : count > 0 ? (
        <span className="text-xs text-gray-400">{count}/2 hoy</span>
    ) : null;
})()}
```

**Step 2: Pasar prop activities desde ProfesorDashboard**

En ProfesorDashboard.jsx donde se renderiza `<window.RegistroMasivo>`, agregar la prop:

```jsx
<window.RegistroMasivo
    students={students}
    setStudents={setStudents}
    addActivity={addActivity}
    unidades={unidades}
    activities={activities}
/>
```

**Step 3: Verificar que ambos archivos compilan**

**Step 4: Commit**

```bash
git add filosofia-gamificada-main/js/components/profesor/RegistroMasivo.jsx
git add filosofia-gamificada-main/js/components/profesor/ProfesorDashboard.jsx
git commit -m "feat: indicador limite participacion en registro masivo"
```

---

## Task 4: Cofres en inventario del estudiante con boton Abrir

**Files:**
- Modify: `js/components/estudiante/EstudianteDashboard.jsx` (funcion `renderArtefactos`, lineas ~891-986)

**Step 1: Modificar renderArtefactos para distinguir cofres de artefactos**

En la funcion `renderArtefactos`, los cofres se identifican porque su `id` empieza con `cofre_`. Agregar logica para:

1. Separar items en `cofres` y `artefactos`
2. Mostrar cofres con boton "Abrir" en seccion separada
3. Al abrir: mostrar modal con animacion de revelacion

Agregar estados al inicio del componente (junto a los otros useState):
```javascript
const [showOpenChest, setShowOpenChest] = useState(false);
const [chestOpening, setChestOpening] = useState(null); // {idx, tipo}
const [chestResult, setChestResult] = useState(null); // artefacto ganado
const [chestAnimating, setChestAnimating] = useState(false);
```

Agregar funcion para abrir cofre (junto a handleUseArtefacto):
```javascript
const handleOpenChest = (cofreIdx, cofreTipo) => {
    setChestAnimating(true);
    setChestOpening({ idx: cofreIdx, tipo: cofreTipo });
    setShowOpenChest(true);
    // Delay para animacion de "abriendo..."
    setTimeout(() => {
        var resultado = window.abrirCofre(cofreTipo);
        if (resultado && setStudents) {
            setStudents(prev => prev.map(s => {
                if (s.id !== currentUser.id) return s;
                var arts = (s.artefactos || []).map((art, i) => {
                    if (i === cofreIdx) {
                        // Reemplazar cofre por artefacto ganado
                        return { id: resultado.id, obtenido: new Date().toISOString(), usado: false, deCofre: cofreTipo };
                    }
                    return art;
                });
                return { ...s, artefactos: arts };
            }));
        }
        setChestResult(resultado);
        setChestAnimating(false);
    }, 2000);
};
```

En `renderArtefactos`, separar cofres de artefactos:
```javascript
// Separar cofres de artefactos normales
var cofres = items.filter(item => item._originalId && item._originalId.startsWith('cofre_'));
var artefactosNormales = items.filter(item => !item._originalId || !item._originalId.startsWith('cofre_'));
```

Actualizar el mapeo de items para preservar el id original:
```javascript
var items = inventario.map((item, idx) => {
    var artefactoId = typeof item === 'string' ? item : (item.id || item.artefactoId);
    var usado = typeof item === 'object' ? (item.usado || false) : false;
    var regaladoPor = typeof item === 'object' ? (item.regaladoPor || null) : null;
    // Cofres
    if (artefactoId && artefactoId.startsWith('cofre_')) {
        var tipoCofre = artefactoId.replace('cofre_', '');
        var cofreDef = window.COFRES[tipoCofre];
        if (cofreDef) {
            return { id: artefactoId, nombre: cofreDef.nombre, emoji: cofreDef.emoji, rareza: tipoCofre, efecto: 'Contiene un artefacto misterioso', esCofre: true, tipoCofre: tipoCofre, _idx: idx, _originalId: artefactoId };
        }
    }
    var artefacto = window.ARTEFACTOS.find(a => a.id === artefactoId);
    return artefacto ? { ...artefacto, usado, regaladoPor, _idx: idx, _originalId: artefactoId } : null;
}).filter(Boolean);
```

Renderizar seccion de cofres antes de artefactos normales:
```jsx
{/* Cofres sin abrir */}
{cofres.length > 0 && (
    <div className="mb-4">
        <h4 className="text-yellow-300 font-bold text-sm mb-2">🎁 Cofres sin abrir ({cofres.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cofres.map((cofre, i) => (
                <div key={'cofre-' + i}
                    className="rounded-2xl p-4 border-2 border-yellow-400/50 bg-yellow-500/10 animate-pulse">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{cofre.emoji}</span>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">{cofre.nombre}</h4>
                            <p className="text-yellow-200 text-xs">Contiene un artefacto misterioso</p>
                        </div>
                    </div>
                    <button onClick={() => handleOpenChest(cofre._idx, cofre.tipoCofre)}
                        className="mt-3 w-full bg-yellow-500/30 hover:bg-yellow-500/50 border border-yellow-400/50 text-yellow-200 hover:text-white py-2 rounded-xl text-sm font-bold transition-all">
                        🔓 Abrir Cofre
                    </button>
                </div>
            ))}
        </div>
    </div>
)}
```

**Step 2: Modal de apertura de cofre con animacion**

Agregar el modal justo antes del modal de trade existente:

```jsx
{/* Modal apertura de cofre */}
{showOpenChest && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-8 max-w-sm w-full text-center">
            {chestAnimating ? (
                <>
                    <div className="text-7xl mb-4 animate-bounce">{chestOpening ? (window.COFRES[chestOpening.tipo]?.emoji || '🎁') : '🎁'}</div>
                    <h3 className="text-2xl font-bold text-yellow-300 mb-2">Abriendo cofre...</h3>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                        <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                </>
            ) : chestResult ? (
                <>
                    <div className="text-7xl mb-4">{chestResult.emoji}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{chestResult.nombre}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                        chestResult.rareza === 'legendario' ? 'bg-yellow-500/30 text-yellow-300' :
                        chestResult.rareza === 'epico' ? 'bg-purple-500/30 text-purple-300' :
                        chestResult.rareza === 'raro' ? 'bg-blue-500/30 text-blue-300' :
                        'bg-gray-500/30 text-gray-300'
                    }`}>
                        {chestResult.rareza === 'legendario' ? '⭐ LEGENDARIO' :
                         chestResult.rareza === 'epico' ? '💜 EPICO' :
                         chestResult.rareza === 'raro' ? '💙 RARO' : '⚪ COMUN'}
                    </span>
                    <p className="text-purple-200 text-sm mb-4">{chestResult.efecto}</p>
                    <button onClick={() => { setShowOpenChest(false); setChestResult(null); setChestOpening(null); }}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-bold transition">
                        Genial!
                    </button>
                </>
            ) : (
                <>
                    <div className="text-5xl mb-4">😕</div>
                    <p className="text-gray-300">Error al abrir cofre</p>
                    <button onClick={() => { setShowOpenChest(false); setChestResult(null); }}
                        className="mt-4 bg-gray-700 text-white py-2 px-6 rounded-xl">Cerrar</button>
                </>
            )}
        </div>
    </div>
)}
```

**Step 3: Verificar que compila**

**Step 4: Commit**

```bash
git add filosofia-gamificada-main/js/components/estudiante/EstudianteDashboard.jsx
git commit -m "feat: cofres en inventario con apertura animada y loot aleatorio"
```

---

## Task 5: Actualizar catalogo visual de artefactos

**Files:**
- Modify: `js/components/estudiante/EstudianteDashboard.jsx` (seccion Catalogo dentro de renderArtefactos)
- Modify: `js/components/profesor/ProfesorDashboard.jsx` (tab artefactos, catalogo)

**Step 1: Actualizar colores de rareza en EstudianteDashboard**

En renderArtefactos, actualizar los rarezaClasses para incluir `comun`:
```javascript
var rarezaClasses = art.rareza === 'legendario'
    ? 'border-yellow-400/50 bg-yellow-500/10'
    : art.rareza === 'epico'
        ? 'border-purple-400/50 bg-purple-500/10'
        : art.rareza === 'raro'
            ? 'border-blue-400/50 bg-blue-500/10'
            : 'border-gray-400/50 bg-gray-500/10';
var rarezaLabel = art.rareza === 'legendario' ? '⭐ Legendario'
    : art.rareza === 'epico' ? '💜 Epico'
    : art.rareza === 'raro' ? '💙 Raro'
    : '⚪ Comun';
```

**Step 2: Actualizar catalogo en ProfesorDashboard**

En el tab artefactos del ProfesorDashboard, asegurar que `getRarezaColor` funciona con la nueva rareza `comun`.

**Step 3: Commit**

```bash
git add filosofia-gamificada-main/js/components/estudiante/EstudianteDashboard.jsx
git add filosofia-gamificada-main/js/components/profesor/ProfesorDashboard.jsx
git commit -m "feat: soporte visual para rareza comun en catalogos"
```

---

## Task 6: Push final y verificacion

**Step 1: Push a GitHub**

```bash
git push
```

**Step 2: Verificar en preview**

1. Verificar que `window.ARTEFACTOS.length === 20`
2. Verificar que `window.abrirCofre('oro')` devuelve un artefacto
3. Verificar que `window.getCofre('ensayo', 'avanzado') === 'oro'`
4. Verificar que `window.getCofre('participacion', 'competente') === null`
5. Verificar que todos los JSX compilan sin errores de Babel

**Step 3: Verificar flujo completo**

1. Login como profesor
2. Ir a Registro Masivo, seleccionar tipo "Participacion", registrar 3 veces mismo estudiante -> verificar que la 3ra da 0 XP
3. Registrar tipo "Ensayo" nivel avanzado -> verificar que se otorga cofre
4. Login como estudiante -> verificar cofre en inventario -> abrir cofre -> ver artefacto
