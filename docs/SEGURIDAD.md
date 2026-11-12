# Seguridad y datos personales

## Estado actual

GitHub Pages publica **todo** lo que hay en la rama `main`, no solo la app. Por
eso ningún archivo con datos personales debe vivir en el repositorio.

| Tema | Estado |
|---|---|
| Nómina con nombres legales y claves, descargable desde el sitio | **Retirada** del sitio al mergear. Sigue en el historial de git (ver abajo). |
| Clave docente legible en el código | **Mitigado en la app nueva** (huella SHA-256). La app anterior aún la trae en texto. |
| Un dispositivo desactualizado pisa datos de otros | **Resuelto en la app nueva** (se escribe por campo). |
| Base de datos abierta a cualquiera | **Código listo, falta activar** (ver abajo). |
| Claves de estudiantes legibles en la base de datos | **Código listo, falta migrar** (`migrar-roster`, ver abajo). |
| Nombres legales de estudiantes legibles por sus compañeros | **Resuelto en el código** (nodo `students_privado`, solo lectura del docente); falta migrar el roster que ya existía (`migrar-nombres-legales`, ver abajo). |
| El formulario "Agregar estudiante" guarda la clave en texto plano | **Resuelto contra `firebase`**: ya no pide ni guarda clave; muestra el comando para crear la cuenta real. (El backend `local` de desarrollo/tests la sigue pidiendo, a propósito: ver abajo). |

## Cuentas reales + reglas por rol

La base de datos acepta hoy lecturas y escrituras sin identificar a nadie. La
configuración de Firebase que viaja en el sitio es pública por diseño, así que
alguien con conocimientos técnicos podría leer los datos del curso (incluidas
las claves de estudiantes) o modificar puntajes sin pasar por la aplicación.
Las verificaciones de clave de la app ordenan el uso normal; no detienen a
quien se salte la interfaz.

La solución, ya implementada en el código de `web/` (falta activarla desde la
consola de Firebase, ver más abajo): **Firebase Authentication con cuentas
reales — una del docente, una por estudiante — más reglas de la base de datos
por rol.** Deliberadamente no se usa autenticación anónima: no distingue a
nadie, así que no protege nada de verdad.

Cómo funciona:

- **Rol y curso van en custom claims** del token de cada cuenta
  (`role: 'docente'` o `role: 'estudiante', cursoId, studentId`). Los fija el
  Admin SDK desde `web/scripts/gestionar-cuentas.mjs`, que se corre a mano
  desde una terminal — nunca desde la app ni desde este repositorio.
- **El correo que pide Firebase Authentication es sintético**, no uno real:
  se deriva del nombre social y el curso (`emailEstudiante` en
  `web/src/services/auth.js`, mismo cálculo en el script). La pantalla de
  login no cambia para quien la usa (curso → nombre → clave). Si le cambias el
  nombre social a alguien, hay que volver a correr el script para esa persona,
  porque el correo derivado deja de calzar con el de su cuenta.
- **`cursos_registro`** (nombre/año/colegio/emoji/paleta de cada curso, nunca
  estudiantes ni claves) sigue siendo de lectura pública, para que el
  selector de curso del login funcione sin necesitar sesión. Todo lo demás —
  estudiantes, actividades, unidades, posición, y la escritura de
  `cursos_registro` — exige una cuenta real. Ver `database.rules.json` en la
  raíz del repositorio.
- **Riesgo que se acepta a propósito:** el intercambio de artefactos entre
  estudiantes no pasa por un servidor, así que las reglas dejan que cualquier
  estudiante autenticado de un curso escriba el inventario
  (`artefactos`/`vocabularioDescubierto`) de un compañero de **ese mismo
  curso** — nunca XP, insignias, habilidades, actividades, ni datos de otro
  curso. Cerrarlo del todo requeriría mediar el intercambio con una Cloud
  Function; no está hecho.
- El backend `local` (desarrollo sin red, tests e2e) no cambia: sigue
  verificando como antes (huella SHA-256 del docente, clave en texto del
  estudiante en `AddStudentModal`), porque no hay Firebase Auth que conectar
  en esos entornos. La huella del docente (`VITE_PROFESOR_PASSWORD_HASH`) ya
  no tiene un valor por defecto en el código: sin esa variable, el login de
  profesor contra `local` queda deshabilitado a propósito (`.env.e2e` la
  define para los tests).
- Contra `firebase`, el formulario "Agregar estudiante" (panel docente) **ya
  no pide ni guarda contraseña**: guardar una clave en la base de datos es
  justo lo que las reglas están evitando. Al guardar, muestra el comando
  exacto de `gestionar-cuentas.mjs crear-estudiante` (con el `studentId` ya
  asignado) para que crees la cuenta real aparte.
- **Las claves nuevas se generan al azar, nunca se reutilizan las antiguas.**
  `crear-estudiante`/`migrar-roster`/`restablecer-clave` generan una clave si
  no les pasas una (10 caracteres, sin 0/O/1/l/I para que se puedan copiar a
  mano). Esa clave **nunca se escribe en la base de datos ni en este
  repositorio**: queda en un CSV local bajo `web/scripts/salida-claves/`
  (ignorado por git) para que la entregues y después borres el archivo.
  `migrar-roster` en particular genera una clave nueva para cada estudiante en
  vez de reusar la que estaba en texto plano en la base — esa quedó expuesta
  mientras no había reglas, así que seguir usándola no habría servido de nada.

### El nombre legal ya no vive junto al resto del registro del estudiante

Antes, aunque la interfaz nunca mostraba el nombre legal a un estudiante, las
reglas de acceso dan lectura a **todo** el nodo `students` de un curso a
cualquier estudiante autenticado de ese curso (lo necesitan para ver a sus
compañeros, el ranking, etc.), y `nombreLegal` vivía ahí mismo — así que
alguien con herramientas de desarrollador podía leerlo igual.

Ahora `nombreLegal` vive en un nodo aparte, `students_privado` (y
`cursos/<cursoId>/students_privado` para los demás cursos), con
`.read`/`.write` exclusivos del docente en `database.rules.json`. En la
práctica:

- `AddStudentModal` ya no incluye el nombre legal en el registro público: el
  alta de estudiante (`domain/estudiantes.js` → `crearEstudiante`) nunca lo
  escribe ahí, y `ProfesorDashboard` lo guarda aparte con `setNombreLegal`
  (expuesto por `useCourseData.js`).
- El panel docente sigue viendo el nombre legal igual que antes:
  `useCourseData` combina `students` con `students_privado` solo cuando la
  sesión es de docente (para una sesión de estudiante ese nodo ni se
  suscribe, por las reglas).
- Importar un respaldo también separa el nombre legal del registro público y
  lo manda a `students_privado`.
- **Falta migrar el roster que ya existía** antes de este cambio (ahí
  `nombreLegal` sigue en el lugar viejo hasta que corras la migración):
  `node scripts/gestionar-cuentas.mjs migrar-nombres-legales <cursoId>` desde
  `web/` — saca el campo de `students` y lo deja en `students_privado`.
- Probado en `web/tests/rules/database.rules.test.js`
  (`describe('students_privado...')`): un estudiante del mismo curso no
  puede leer ni escribir ese nodo; el docente sí.

### Qué falta para activarlo (pasos en la consola, no en el código)

1. Firebase Console → Authentication → Sign-in method → habilitar "Correo
   electrónico/contraseña".
2. Firebase Console → Configuración del proyecto → Cuentas de servicio →
   "Generar nueva clave privada" → guardar ese JSON **fuera** de este
   repositorio.
3. Con esa clave en `GOOGLE_APPLICATION_CREDENTIALS`, correr
   `npm run gestionar-cuentas -- <comando>` desde `web/` (ver la ayuda del
   script: crear la cuenta docente, probar en `sandbox`, y por último
   `migrar-roster` y `migrar-nombres-legales` sobre el curso real — eso es lo
   que de verdad saca las claves y los nombres legales de donde cualquiera
   del curso los podía leer).
4. Probar todo primero con `npm run test:rules` (emulador, no toca ningún
   proyecto) y después de punta a punta contra el proyecto de pruebas (ver
   `docs/ENSAYO.md`) — nunca contra el real antes de estar conforme.
5. Subir `database.rules.json` desde Firebase Console → Realtime Database →
   Reglas, o con el CLI — **siempre con `--project` explícito**:
   ```bash
   npx firebase deploy --only database --project real
   ```
   `.firebaserc` define los alias `real` y `pruebas`; el *default* es
   `pruebas`, así que un `firebase deploy` sin `--project` nunca toca el
   proyecto real por accidente — pero el hábito correcto es no depender de
   eso y escribir el proyecto siempre.

## Cómo se probaron las reglas

`web/tests/rules/database.rules.test.js` corre `database.rules.json` contra
el emulador de Realtime Database (local, no toca el proyecto real) y
comprueba, entre otras cosas:

- nadie sin sesión lee ni escribe `students`/`activities` (pero sí lee
  `cursos_registro`, que es público a propósito);
- un estudiante de un curso no puede leer los datos de otro curso;
- un estudiante no puede subirse el XP, otorgarse insignias ni escribir
  actividades, unidades o la posición del curso;
- el docente puede escribir todo;
- el regalo de artefactos entre compañeros del mismo curso funciona, pero no
  entre cursos distintos;
- el namespace `sandbox` sigue el mismo esquema de permisos que los datos
  reales.

Se corre con `npm run test:rules` desde `web/` (requiere Java para el
emulador; `firebase-tools` ya queda como devDependency). Arranca el
emulador, corre las pruebas y lo apaga solo — no necesita el proyecto real
ni credenciales.

## Probar contra otro proyecto de Firebase (sin tocar el real)

Además del emulador (abajo) y `?db=sandbox` (mismo proyecto real, datos
separados), se puede apuntar la app entera a un proyecto de Firebase
*distinto* — util para ensayar el alta de Authentication y las reglas de
punta a punta sin que nada toque jamás el proyecto real. Guía paso a paso
con comandos exactos: `docs/ENSAYO.md`.

```bash
cd web
VITE_FIREBASE_PROJECT_ID=mi-proyecto-de-pruebas \
VITE_FIREBASE_DATABASE_URL=https://mi-proyecto-de-pruebas-default-rtdb.firebaseio.com \
VITE_FIREBASE_API_KEY=... VITE_FIREBASE_AUTH_DOMAIN=... VITE_FIREBASE_APP_ID=... \
  npm run dev
```

Sin esas variables, `web/src/config.js` usa el proyecto real de siempre (son
valores públicos, no secretos: identifican el proyecto, no otorgan
permisos). `scripts/gestionar-cuentas.mjs` lee las mismas dos variables
(`VITE_FIREBASE_PROJECT_ID`/`VITE_FIREBASE_DATABASE_URL`) para crear cuentas
y migrar datos en ese mismo proyecto de pruebas — imprime cuál está usando al
arrancar, para no confundirlo con el real por accidente.

## Si algo se rompe: volver a las reglas abiertas (menos de un minuto)

`database.rules.rollback.json` (raíz del repositorio) reabre la base de
datos por completo — es el equivalente al estado de antes de este cambio,
**no** algo para dejar puesto. Solo para destrabar una emergencia mientras
se investiga:

1. Firebase Console → Realtime Database → Reglas.
2. Pega el contenido de `database.rules.rollback.json`.
3. Publicar.

Apenas se resuelva lo que se rompió, vuelve a publicar `database.rules.json`
de la misma forma. Mientras el rollback esté activo, la base de datos vuelve
a aceptar lecturas y escrituras anónimas — no lo dejes así más de lo
necesario.

## Recomendaciones inmediatas

- **Cambiar la clave docente** una vez hecho el paso a la app nueva. La actual
  está escrita en la app anterior y en el historial de git.
- **Historial de git.** La nómina se retiró de la versión actual, pero las
  versiones antiguas del repositorio la conservan. Si el repositorio es público,
  lo más simple es crear uno nuevo solo con la versión actual y dejar este
  privado o eliminarlo. Es una decisión del dueño del repositorio.
- **Exportar un respaldo** (panel docente → Exportar) antes del paso a la app
  nueva y de forma periódica.
- No subir al repositorio listas de curso, respaldos exportados ni planillas
  con datos de estudiantes.
