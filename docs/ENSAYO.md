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

**Nunca se escribe una clave real en la línea de comandos.** Todos los
comandos de abajo omiten el argumento de clave a propósito: se genera una al
azar (CSPRNG) y queda en un CSV local (`web/scripts/salida-claves/`, fuera de
git) — la lees de ahí cuando la necesites para iniciar sesión o para un
`curl`. Los argumentos de un comando quedan en el historial de la terminal y
a veces en la lista de procesos del sistema; una clave nunca debería pasar
por ahí, ni siquiera en un ensayo.

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

`gestionar-cuentas.mjs` imprime `Proyecto: filosofia-gamificada-pruebas
(...)` al arrancar — confírmalo antes de cada comando si tienes dudas de
cuál proyecto está activo en esa terminal.

## 4. Publicar las reglas en el proyecto de pruebas

**Opción A — consola, sin instalar nada [Tú: consola]:**

1. https://console.firebase.google.com/project/filosofia-gamificada-pruebas/database/filosofia-gamificada-pruebas-default-rtdb/rules
2. Reemplaza todo el editor por el contenido de `database.rules.json` (raíz
   de este repositorio).
3. Publicar.

**Opción B — con el CLI** (si prefieres y ya tienes `firebase login` hecho).
`.firebaserc` tiene `pruebas` y `real` como alias — pon siempre `--project`
explícito, nunca dependas del valor por defecto:

```bash
cd filosofia-gamificada2.0   # raiz del repo, donde esta firebase.json
npx firebase login           # una vez; abre el navegador [Tú: consola/navegador]
npx firebase deploy --only database --project pruebas
```

## 5. Crear la cuenta del docente

```bash
source ~/pruebas-filosofia.env
cd filosofia-gamificada2.0/web
npm run gestionar-cuentas -- crear-docente profesor
```

Imprime en qué archivo quedó la clave generada, algo como
`web/scripts/salida-claves/claves-2026-11-11T.....csv`. Para leerla cuando
la necesites:

```bash
cat web/scripts/salida-claves/claves-*.csv
```

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

1. Entra como **Profesor** → usuario `profesor`, la clave del CSV del paso 5.
2. Pestaña **Estudiantes** → **Agregar Estudiante**.
3. Primero: nombre social `Ana`, género y clase cualquiera. Al guardar, la
   app muestra un comando ya listo (sin clave — se va a generar sola):
   `node scripts/gestionar-cuentas.mjs crear-estudiante 3B-2026 "Ana" <id>`.
   Cópialo.
4. Repite para `Beto` (mismo curso, otra clase si quieres).
5. En otra terminal (con `source ~/pruebas-filosofia.env` ya hecho):
   ```bash
   cd filosofia-gamificada2.0/web
   npm run gestionar-cuentas -- crear-estudiante 3B-2026 "Ana" <id-de-Ana>
   npm run gestionar-cuentas -- crear-estudiante 3B-2026 "Beto" <id-de-Beto>
   ```
6. Lee sus claves generadas con `cat web/scripts/salida-claves/claves-*.csv`
   (vas a ver líneas como `Ana (curso 3B-2026),<clave>`).

## 8. Comprobaciones del flujo nuevo (en el navegador)

- [ ] **El docente entra y registra una actividad.** Sesión de profesor →
      pestaña **Registro** → elige a Ana, cualquier tipo de actividad →
      Registrar. Debe sumarle XP (visible en su ficha).
- [ ] **Un estudiante entra y ve su XP.** Cerrar sesión → Acceso Estudiante →
      `Ana` / su clave del CSV → su panel muestra el XP que acaba de recibir.
- [ ] **Clave incorrecta rechazada.** En la misma pantalla, escribe
      cualquier otra clave para Ana → debe mostrar "Nombre o contraseña
      incorrectos..." y NO dejarla entrar. Repite con la clave correcta para
      confirmar que sí entra.
- [ ] **La sesión persiste al recargar.** Con Ana (o el docente) con sesión
      abierta, recarga la página (F5) → debe seguir dentro, sin pedir de
      nuevo usuario ni clave (Firebase Authentication guarda la sesión
      sola).
- [ ] **Un estudiante regala un artefacto a otro.** Si Ana no tiene
      artefactos todavía: como docente, en su ficha → **Otorgar** → elige
      cualquiera. Luego, como Ana: en su inventario, ese artefacto → **🎁
      Regalar** → elige a Beto. Confirma entrando como Beto que el artefacto
      ya está en su inventario (y ya no en el de Ana).

## 9. Herramientas para `curl` (se usan en los pasos 10 y 11)

Define esto una vez por terminal — el resto de la guía asume que ya lo
corriste (reemplaza `web/` por la ruta real si no estás en la raíz del repo):

```bash
API_KEY=AIzaSyBMhcqOjBtcT0b3M7RglQQi56cOh0FC9eQ
DB_URL=https://filosofia-gamificada-pruebas-default-rtdb.firebaseio.com

# id_token <correo> <clave>  ->  imprime el idToken, o nada si fallo
id_token() {
  curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"email":"'"$1"'","password":"'"$2"'","returnSecureToken":true}' \
    | grep -o '"idToken": *"[^"]*"' | cut -d'"' -f4
}
# clave_de <etiqueta-exacta-del-csv>  ->  imprime la clave guardada
clave_de() {
  grep -F "$1" web/scripts/salida-claves/claves-*.csv | tail -1 | cut -d',' -f2
}
```

Ejemplo para el docente (se usa en el paso 10.3):

```bash
ID_TOKEN_DOCENTE=$(id_token "profesor@docentes.filosofo-en-formacion.invalid" "$(clave_de 'docente:profesor')")
```

## 10. Ensayo de la migración (roster viejo → cuentas reales)

Esto prueba el camino que vas a usar el día que migres el curso real: un
roster con `password` y `nombreLegal` tal como está hoy, pasando por
`migrar-roster` y `migrar-nombres-legales`. Se siembra en un curso aparte
para no mezclarlo con Ana y Beto.

1. **Sembrar 35 estudiantes ficticios** (bloqueado a propósito contra el
   proyecto real — solo corre contra `pruebas` porque así están cargadas las
   variables de entorno):
   ```bash
   cd filosofia-gamificada2.0/web
   npm run gestionar-cuentas -- sembrar-roster curso-migracion 35
   ```
   Imprime `Sembrados 35 estudiantes ficticios en cursos/curso-migracion/students.`
   Cada uno queda con la forma vieja: `password: "clave-ficticia-N"` y
   `nombreLegal` dentro del mismo registro (no en `students_privado`).

2. **Correr la migración:**
   ```bash
   npm run gestionar-cuentas -- migrar-roster curso-migracion
   npm run gestionar-cuentas -- migrar-nombres-legales curso-migracion
   ```

3. **Verificar que `password` desapareció de `students`** (usa los helpers
   y `ID_TOKEN_DOCENTE` del paso 9 — hace falta un token válido para leer, el
   del docente sirve):
   ```bash
   curl -s "$DB_URL/cursos/curso-migracion/students.json?auth=$ID_TOKEN_DOCENTE" \
     | grep -o '"password"' | head -1
   ```
   No debe imprimir nada: si `grep` no encuentra `"password"`, no hay salida.

4. **Verificar que el CSV es correcto:**
   ```bash
   wc -l web/scripts/salida-claves/claves-*.csv   # 35 lineas nuevas (mas las de antes)
   grep 'curso-migracion' web/scripts/salida-claves/claves-*.csv | wc -l   # exactamente 35
   ```

5. **Verificar que (una muestra de) los 35 entran con su clave nueva.**
   Probar los 35 a mano no es razonable; con dos alcanza para confiar en el
   resto (y `listar`, abajo, confirma que las 35 cuentas existen):
   ```bash
   id_token "estudiante1.curso-migracion@alumnos.filosofo-en-formacion.invalid" \
     "$(clave_de 'Estudiante1 (curso curso-migracion)')"
   id_token "estudiante35.curso-migracion@alumnos.filosofo-en-formacion.invalid" \
     "$(clave_de 'Estudiante35 (curso curso-migracion)')"
   ```
   Cada uno debe imprimir un `idToken` (éxito, no texto vacío).

6. **Verificar con `listar` que las 35 cuentas quedaron y sin avisos:**
   ```bash
   npm run gestionar-cuentas -- listar curso-migracion
   ```
   Las 35 deben aparecer como `[cuenta OK]`, sin "aun tiene clave en texto
   plano" ni "nombre legal sin migrar".

7. **Un estudiante de ese curso NO lee `students_privado`:**
   ```bash
   ID_TOKEN_E1=$(id_token "estudiante1.curso-migracion@alumnos.filosofo-en-formacion.invalid" \
     "$(clave_de 'Estudiante1 (curso curso-migracion)')")
   curl -s "$DB_URL/cursos/curso-migracion/students_privado.json?auth=$ID_TOKEN_E1"
   ```
   Esperado: `Permission denied`.

## 11. Seguridad, saltándose la interfaz (`curl`)

Esto prueba lo que las reglas realmente defienden, no lo que la interfaz
deja hacer. Usa los helpers `id_token`/`clave_de` del paso 9. El correo
sintético de cada cuenta lo viste impreso al correr `crear-estudiante`
(termina en `.invalid`, nunca en `.app` — ver "¿Por qué `.invalid`?" abajo):

```bash
ID_TOKEN_ANA=$(id_token "ana.3b-2026@alumnos.filosofo-en-formacion.invalid" "$(clave_de 'Ana (curso 3B-2026)')")
```

- [ ] **Un estudiante NO puede leer `students_privado`:**
  ```bash
  curl -s "$DB_URL/students_privado.json?auth=$ID_TOKEN_ANA"
  ```
  Esperado: `{"error" : "Permission denied"}` (HTTP 401) — nunca el contenido.

- [ ] **Un estudiante NO puede escribir su propio XP:**
  ```bash
  curl -s -X PUT -d '999999' "$DB_URL/students/0/xp.json?auth=$ID_TOKEN_ANA"
  ```
  Esperado: igual, `Permission denied`. (El `0` es el índice dentro del
  arreglo `students`, no el `id` del estudiante; cualquier índice sirve para
  la prueba — lo que importa es que falle.)

- [ ] **Un estudiante de OTRO curso no lee `students` de este curso ni le
      escribe artefactos.** Crea una cuenta "intrusa" con un curso distinto
      (no necesita existir de verdad en el roster — el reclamo `cursoId` del
      token ya alcanza para la prueba):
  ```bash
  npm run gestionar-cuentas -- crear-estudiante curso-ajeno "Intruso" 999
  ID_TOKEN_INTRUSO=$(id_token "intruso.curso-ajeno@alumnos.filosofo-en-formacion.invalid" \
    "$(clave_de 'Intruso (curso curso-ajeno)')")

  curl -s "$DB_URL/students.json?auth=$ID_TOKEN_INTRUSO"
  curl -s -X PUT -d '[]' "$DB_URL/students/0/artefactos.json?auth=$ID_TOKEN_INTRUSO"
  ```
  Ambos deben fallar con `Permission denied`.

- [ ] **Una persona sin cuenta no lee nada** (sin `?auth=`):
  ```bash
  curl -s "$DB_URL/students.json"
  curl -s "$DB_URL/cursos_registro.json"
  ```
  La primera debe fallar con `Permission denied`; la segunda **debe
  funcionar** (es pública a propósito: solo nombre/año/colegio de los
  cursos, nunca estudiantes — ver `docs/SEGURIDAD.md`).

### ¿Por qué `.invalid`?

El correo sintético usa el dominio `...filosofo-en-formacion.invalid`.
`.invalid` es un TLD reservado (RFC 2606/6761): nadie puede registrarlo ni
delegarlo por DNS, así que nunca puede recibir correo de verdad. Si fuera un
dominio real sin registrar (como `.app` antes de este ajuste), cualquiera
podría registrarlo y después pedirle a Firebase un restablecimiento de clave
para **cualquier** cuenta — incluida la docente — y recibir ese correo él
mismo. `web/tests/rules/auth-domain.test.js` prueba contra el emulador de
Auth que Firebase sí acepta crear y autenticar cuentas con este dominio.

## 12. Rollback: reabrir y volver a cerrar

Practica el procedimiento de emergencia de `docs/SEGURIDAD.md` una vez, para
confiar en que funciona cuando de verdad haga falta:

1. **[Tú: consola]** Pega el contenido de `database.rules.rollback.json` en
   las reglas del proyecto de pruebas → Publicar.
2. **Confirma que se abrió:**
   ```bash
   curl -s "$DB_URL/students.json"
   ```
   Ahora SÍ debe devolver los datos (sin `Permission denied`) — la base
   quedó abierta a cualquiera, como antes de este cambio.
3. **[Tú: consola]** Vuelve a pegar el contenido de `database.rules.json`
   (el de verdad) → Publicar.
4. **Confirma que se volvió a cerrar:**
   ```bash
   curl -s "$DB_URL/students.json"
   ```
   Debe volver a fallar con `Permission denied`.

## 13. Terminar el ensayo

- El proyecto de pruebas puede quedar como está (no cuesta nada mantenerlo) o
  puedes borrar los datos desde la Realtime Database de la consola si
  quieres dejarlo limpio para la próxima vez.
- Nada de este ensayo afectó al proyecto real (`filosofia-gamificada`): no
  comparten ni base de datos ni cuentas de Authentication, y
  `sembrar-roster` se niega a correr ahí aunque lo intentes por error.
- Cuando quieras repetir las pruebas automatizadas de reglas sin un proyecto
  real de por medio, `npm run test:rules` (desde `web/`) sigue siendo la vía
  más rápida — usa los emuladores locales de Database y Auth, no este
  proyecto de pruebas.
