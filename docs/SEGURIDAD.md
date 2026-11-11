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
  verificando como antes, porque no hay Firebase Auth que conectar en esos
  entornos.

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
   `docs/DEPLOY.md`).
5. Subir `database.rules.json` desde Firebase Console → Realtime Database →
   Reglas, o con `firebase deploy --only database`.

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
