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
| Claves y nombres legales de estudiantes legibles en la base de datos | **Código listo, falta migrar** (se resuelve con lo mismo). |

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
  verificando como antes (huella SHA-256 del docente en `web/src/config.js`,
  clave en texto del estudiante), porque no hay Firebase Auth que conectar en
  esos entornos.
- **Las claves nuevas se generan al azar, nunca se reutilizan las antiguas.**
  `crear-estudiante`/`migrar-roster`/`restablecer-clave` generan una clave si
  no les pasas una (10 caracteres, sin 0/O/1/l/I para que se puedan copiar a
  mano). Esa clave **nunca se escribe en la base de datos ni en este
  repositorio**: queda en un CSV local bajo `web/scripts/salida-claves/`
  (ignorado por git) para que la entregues y después borres el archivo.
  `migrar-roster` en particular genera una clave nueva para cada estudiante en
  vez de reusar la que estaba en texto plano en la base — esa quedó expuesta
  mientras no había reglas, así que seguir usándola no habría servido de nada.

### Pendiente aparte: el nombre legal sigue siendo legible entre compañeros

La interfaz nunca le muestra el nombre legal a un estudiante, pero las reglas
de arriba dan acceso de lectura a **todo** el nodo `students` de un curso a
cualquier estudiante autenticado de ese curso (lo necesitan para ver a sus
compañeros, el ranking, etc.) — y `nombreLegal` vive en ese mismo nodo. Así
que alguien con herramientas de desarrollador puede leer los nombres legales
de sus compañeros aunque la app no los despliegue. Esto no es nuevo (ya
estaba así, solo que antes lo podía leer cualquiera sin sesión); las cuentas
reales ya lo acotan a "compañeros del mismo curso", pero no lo cierran del
todo.

Para cerrarlo habría que sacar `nombreLegal` del nodo `students` y moverlo a
uno paralelo de lectura exclusiva del docente, por ejemplo
`students_privado/<clave>/nombreLegal` (y `cursos/<cursoId>/students_privado/...`
para los demás cursos), con reglas `".read"/".write": solo docente`. Implica:

- una regla nueva en `database.rules.json` (análoga a las de `students`, pero
  sin el permiso de estudiante);
- que `useCourseData.js` suscriba ese nodo aparte y lo combine con `students`
  solo cuando la sesión es de docente;
- que el alta de estudiante (`AddStudentModal` en
  `web/src/components/shared/Modals.jsx`) escriba `nombreLegal` ahí en vez de
  en el registro normal;
- una migración una vez (como `migrar-roster`, pero para mover el campo en
  vez de borrarlo) para los estudiantes que ya tienen `nombreLegal` en el
  lugar viejo.

No lo implementé todavía porque toca varios archivos y el modelo de datos de
un curso (hoy `useCourseData` asume un recurso por nodo); si quieres que lo
haga, lo trato como un cambio aparte de este.

### Qué falta para activarlo (pasos en la consola, no en el código)

1. Firebase Console → Authentication → Sign-in method → habilitar "Correo
   electrónico/contraseña".
2. Firebase Console → Configuración del proyecto → Cuentas de servicio →
   "Generar nueva clave privada" → guardar ese JSON **fuera** de este
   repositorio.
3. Con esa clave en `GOOGLE_APPLICATION_CREDENTIALS`, correr
   `npm run gestionar-cuentas -- <comando>` desde `web/` (ver la ayuda del
   script: crear la cuenta docente, probar en `sandbox`, y por último
   `migrar-roster` sobre el curso real — eso es lo que de verdad saca las
   claves de la base de datos).
4. Probar todo contra `?db=sandbox` antes de tocar el curso real (ver
   `docs/DEPLOY.md`). También puedes correr `npm run test:rules` desde `web/`
   (ver "Cómo se probaron las reglas" abajo) sin tocar ningún proyecto real.
5. Subir `database.rules.json` desde Firebase Console → Realtime Database →
   Reglas, o con `firebase deploy --only database`.

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
