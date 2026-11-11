# Ensayo completo contra el proyecto de pruebas

Guía paso a paso para probar cuentas reales + reglas de punta a punta contra
`filosofia-gamificada-pruebas` — un proyecto de Firebase **distinto** al
real, así que nada de esto toca el curso real. Contexto completo en
`docs/SEGURIDAD.md`.

Configuración web del proyecto de pruebas (ya la tenemos):

```
apiKey:            AIzaSyBMhcqOjBtcT0b3M7RglQQi56cOh0FC9eQ
authDomain:        filosofia-gamificada-pruebas.firebaseapp.com
databaseURL:       https://filosofia-gamificada-pruebas-default-rtdb.firebaseio.com
projectId:         filosofia-gamificada-pruebas
storageBucket:     filosofia-gamificada-pruebas.firebasestorage.app
messagingSenderId: 446282829137
appId:             1:446282829137:web:6ef42875d7b529ebbb1770
```

Pasos marcados **[Tú: consola]** se hacen con tu cuenta de Google en la
Firebase Console del proyecto de pruebas — nadie más los puede hacer por ti.
El resto son comandos de terminal, para correr en tu máquina (yo no tengo la
clave de servicio de este proyecto, así que no puedo ejecutarlos).

## 1. Habilitar Authentication **[Tú: consola]**

1. https://console.firebase.google.com/project/filosofia-gamificada-pruebas/authentication/providers
2. "Añadir proveedor" → **Correo electrónico/contraseña** → habilitar → Guardar.

## 2. Generar la clave de servicio **[Tú: consola]**

1. https://console.firebase.google.com/project/filosofia-gamificada-pruebas/settings/serviceaccounts/adminsdk
2. "Generar nueva clave privada" → confirmar. Se descarga un `.json`.
3. Muévelo **fuera de este repositorio**, por ejemplo:
   ```bash
   mkdir -p ~/.secrets/firebase
   mv ~/Downloads/filosofia-gamificada-pruebas-*.json ~/.secrets/firebase/pruebas-adminsdk.json
   chmod 600 ~/.secrets/firebase/pruebas-adminsdk.json
   ```
   Nunca debe quedar dentro de `filosofia-gamificada2.0/` (aunque el nombre
   calce con `.gitignore`, es un hábito que vale la pena no romper).

## 3. Variables de entorno del proyecto de pruebas

Todo lo que sigue usa las mismas variables, tanto para la app (`npm run dev`)
como para el script de cuentas. Lo más simple es un archivo que las junte
todas (sustituye la ruta de la clave por la que usaste en el paso 2):

```bash
cat > ~/pruebas-filosofia.env <<'EOF'
export VITE_FIREBASE_API_KEY=AIzaSyBMhcqOjBtcT0b3M7RglQQi56cOh0FC9eQ
export VITE_FIREBASE_AUTH_DOMAIN=filosofia-gamificada-pruebas.firebaseapp.com
export VITE_FIREBASE_DATABASE_URL=https://filosofia-gamificada-pruebas-default-rtdb.firebaseio.com
export VITE_FIREBASE_PROJECT_ID=filosofia-gamificada-pruebas
export VITE_FIREBASE_STORAGE_BUCKET=filosofia-gamificada-pruebas.firebasestorage.app
export VITE_FIREBASE_MESSAGING_SENDER_ID=446282829137
export VITE_FIREBASE_APP_ID=1:446282829137:web:6ef42875d7b529ebbb1770
export GOOGLE_APPLICATION_CREDENTIALS=$HOME/.secrets/firebase/pruebas-adminsdk.json
EOF
source ~/pruebas-filosofia.env
```

Ese archivo vive fuera del repo (en tu `$HOME`), así que no hace falta
tocar `.gitignore`. Cada vez que abras una terminal nueva para seguir con el
ensayo, repite `source ~/pruebas-filosofia.env`.

## 4. Publicar las reglas en el proyecto de pruebas

**Opción A — consola, sin instalar nada [Tú: consola]:**

1. https://console.firebase.google.com/project/filosofia-gamificada-pruebas/database/filosofia-gamificada-pruebas-default-rtdb/rules
2. Reemplaza todo el editor por el contenido de `database.rules.json` (raíz
   de este repositorio).
3. Publicar.

**Opción B — con el CLI** (si prefieres y ya tienes `firebase login` hecho):

```bash
cd filosofia-gamificada2.0   # raiz del repo, donde esta firebase.json
npx firebase login           # una vez; abre el navegador [Tú: consola/navegador]
npx firebase deploy --only database --project filosofia-gamificada-pruebas
```

## 5. Crear la cuenta del docente

```bash
source ~/pruebas-filosofia.env
cd filosofia-gamificada2.0/web
npm run gestionar-cuentas -- crear-docente profesor "clave-de-ensayo-1"
```

Debe imprimir `Proyecto: filosofia-gamificada-pruebas (...)` — confirma que
apunta al proyecto de pruebas, no al real, antes de seguir.

## 6. Arrancar la app contra el proyecto de pruebas

```bash
source ~/pruebas-filosofia.env
cd filosofia-gamificada2.0/web
npm run dev
```

Abre la URL que imprime (típicamente `http://localhost:5173`). El banner de
"datos de ensayo" (el de `?db=sandbox`) **no** debería aparecer: este no es
el truco del namespace, es un proyecto de Firebase completamente aparte.

## 7. Crear a los dos estudiantes, desde la app

1. Entra como **Profesor** → usuario `profesor`, clave `clave-de-ensayo-1`.
2. Pestaña **Estudiantes** → **Agregar Estudiante**.
3. Primero: nombre social `Ana`, género y clase cualquiera. Al guardar, la
   app muestra un comando `gestionar-cuentas.mjs crear-estudiante 3B-2026
   "Ana" <id>` — cópialo.
4. Repite para `Beto` (mismo curso, otra clase si quieres).
5. En otra terminal (con las variables del paso 3 ya cargadas):
   ```bash
   cd filosofia-gamificada2.0/web
   npm run gestionar-cuentas -- crear-estudiante 3B-2026 "Ana" <id-de-Ana> "clave-ana-1"
   npm run gestionar-cuentas -- crear-estudiante 3B-2026 "Beto" <id-de-Beto> "clave-beto-1"
   ```
   (Si omites la clave, se genera una al azar en
   `web/scripts/salida-claves/` — cualquiera de las dos formas sirve para el
   ensayo.)

## 8. Lista de comprobaciones

### En la app (navegador)

- [ ] **El docente entra y registra una actividad.** Sesión de profesor →
      pestaña **Registro** → elige a Ana, cualquier tipo de actividad →
      Registrar. Debe sumarle XP (visible en su ficha).
- [ ] **Un estudiante entra y ve su XP.** Cerrar sesión → Acceso Estudiante →
      `Ana` / `clave-ana-1` → su panel muestra el XP que acaba de recibir.
- [ ] **Un estudiante regala un artefacto a otro.** Si Ana no tiene
      artefactos todavía: como docente, en su ficha → **Otorgar** → elige
      cualquiera. Luego, como Ana: en su inventario, ese artefacto → **🎁
      Regalar** → elige a Beto. Confirma entrando como Beto que el artefacto
      ya está en su inventario (y ya no en el de Ana).

### Saltándose la interfaz, con `curl` (esto es lo que prueban las reglas de verdad)

Necesitas el `idToken` de un estudiante autenticado. Pídelo a la API de
Firebase Auth con su correo sintético (lo viste impreso al correr
`crear-estudiante` en el paso 7: algo como `ana.3b-2026@alumnos.filosofo-en-formacion.app`):

```bash
API_KEY=AIzaSyBMhcqOjBtcT0b3M7RglQQi56cOh0FC9eQ
DB_URL=https://filosofia-gamificada-pruebas-default-rtdb.firebaseio.com

ID_TOKEN=$(curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.3b-2026@alumnos.filosofo-en-formacion.app","password":"clave-ana-1","returnSecureToken":true}' \
  | grep -o '"idToken": *"[^"]*"' | cut -d'"' -f4)
```

- [ ] **Un estudiante NO puede leer `students_privado`:**
  ```bash
  curl -s "$DB_URL/students_privado.json?auth=$ID_TOKEN"
  ```
  Esperado: `{"error" : "Permission denied"}` (HTTP 401) — nunca el contenido.

- [ ] **Un estudiante NO puede escribir su propio XP:**
  ```bash
  curl -s -X PUT -d '999999' "$DB_URL/students/0/xp.json?auth=$ID_TOKEN"
  ```
  Esperado: igual, `Permission denied`. (El `0` es el índice dentro del
  arreglo `students`, no el `id` del estudiante; si Ana no quedó primera,
  cualquier índice sirve para la prueba — lo que importa es que falle.)

- [ ] **Una persona sin cuenta no lee nada** (sin `?auth=`):
  ```bash
  curl -s "$DB_URL/students.json"
  curl -s "$DB_URL/cursos_registro.json"
  ```
  La primera debe fallar con `Permission denied`; la segunda **debe
  funcionar** (es pública a propósito: solo nombre/año/colegio de los
  cursos, nunca estudiantes — ver `docs/SEGURIDAD.md`).

## 9. Terminar el ensayo

- El proyecto de pruebas puede quedar como está (no cuesta nada mantenerlo) o
  puedes borrar los datos desde la Realtime Database de la consola si
  quieres dejarlo limpio para la próxima vez.
- Nada de este ensayo afectó al proyecto real (`filosofia-gamificada`): no
  comparten ni base de datos ni cuentas de Authentication.
- Cuando quieras repetir las pruebas automatizadas de reglas sin un proyecto
  real de por medio, `npm run test:rules` (desde `web/`) sigue siendo la vía
  más rápida — usa el emulador local, no este proyecto de pruebas.
