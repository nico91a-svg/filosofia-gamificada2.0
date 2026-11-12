// Gestion de cuentas reales (docente + estudiantes) para Firebase Authentication,
// y migracion de las claves de estudiante fuera de la base de datos.
// Ver docs/SEGURIDAD.md para el contexto completo.
//
// Requiere, antes de usarlo:
//   1. Firebase Console -> Authentication -> Sign-in method -> habilitar
//      "Correo electronico/contraseña".
//   2. Firebase Console -> Configuracion del proyecto -> Cuentas de servicio
//      -> "Generar nueva clave privada". Guarda ese JSON FUERA de este
//      repositorio (nunca lo subas a git).
//
// Uso:
//   GOOGLE_APPLICATION_CREDENTIALS=/ruta/fuera-del-repo/clave.json \
//     node scripts/gestionar-cuentas.mjs <comando> [argumentos]
//
// Por defecto apunta al proyecto real de siempre. Para probar contra OTRO
// proyecto de Firebase (sin tocar el real), exporta las mismas variables que
// usa la app (ver web/src/config.js y docs/SEGURIDAD.md):
//   VITE_FIREBASE_PROJECT_ID=mi-proyecto-de-pruebas \
//   VITE_FIREBASE_DATABASE_URL=https://mi-proyecto-de-pruebas-default-rtdb.firebaseio.com \
//   GOOGLE_APPLICATION_CREDENTIALS=/ruta/clave-de-ese-proyecto.json \
//     node scripts/gestionar-cuentas.mjs <comando> [argumentos]
//
// Comandos:
//   crear-docente <usuario> [clave]
//       Crea o actualiza la cuenta del docente. Sin clave, se genera una.
//   crear-estudiante <cursoId> "<nombreSocial>" <studentId> [clave]
//       Crea o actualiza la cuenta de un estudiante que YA existe en el
//       roster de ese curso (studentId es su campo `id` en la base de datos).
//       Sin clave, se genera una.
//   migrar-roster <cursoId>
//       Recorre el roster real de ese curso, crea una cuenta por cada
//       estudiante con una clave NUEVA generada al azar (la que estaba en la
//       base quedo expuesta mientras no habia reglas, asi que no se reutiliza)
//       y borra el campo `password` de la base de datos: es el paso que de
//       verdad saca las claves en texto plano. Usa 3B-2026 para el curso
//       original.
//   restablecer-clave docente [clave-nueva]
//   restablecer-clave <cursoId> "<nombreSocial>" [clave-nueva]
//       Para cuando alguien olvida su clave. Sin clave, se genera una.
//   migrar-nombres-legales <cursoId>
//       Saca `nombreLegal` del registro publico de cada estudiante y lo deja
//       en `students_privado` (solo lectura del docente). Los estudiantes
//       nuevos ya se crean asi; esto es para el roster que ya existia.
//   sembrar-roster <cursoId> [cantidad=35]
//       SOLO PARA ENSAYOS. Escribe estudiantes ficticios con la forma vieja
//       del roster (password y nombreLegal dentro de `students`, como antes
//       de este cambio), para poder probar migrar-roster/migrar-nombres-legales
//       de punta a punta. Se niega a correr contra el proyecto real.
//   listar <cursoId>
//       Compara el roster contra las cuentas de Authentication existentes.
//
// Las claves generadas automaticamente NUNCA se escriben en la base de datos
// ni en este repositorio: se guardan en un archivo CSV local, fuera de git
// (ver web/.gitignore), para que las entregues y luego borres el archivo.
import { randomInt } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

// Mismos valores (y mismas variables de entorno) que web/src/config.js:
// projectId y databaseURL no son secretos, identifican el proyecto, no
// otorgan permisos por si solos.
const PROJECT_REAL = 'filosofia-gamificada';
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || PROJECT_REAL;
const DATABASE_URL = process.env.VITE_FIREBASE_DATABASE_URL ||
    'https://filosofia-gamificada-default-rtdb.firebaseio.com';

// ".invalid" (RFC 2606/6761): nadie puede registrar ese dominio ni recibir
// correo ahi, asi que un restablecimiento de clave por correo nunca le
// llega a nadie. Mismo calculo que web/src/services/auth.js
// (emailDocente/emailEstudiante): si cambias uno, cambia el otro.
const DOMINIO_DOCENTE = 'docentes.filosofo-en-formacion.invalid';
const DOMINIO_ESTUDIANTE = 'alumnos.filosofo-en-formacion.invalid';

function slug(texto) {
    return String(texto).trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
const emailDocente = (usuario) => slug(usuario) + '@' + DOMINIO_DOCENTE;
const emailEstudiante = (cursoId, nombreSocial) => slug(nombreSocial) + '.' + slug(cursoId) + '@' + DOMINIO_ESTUDIANTE;

function cursoDbPath(cursoId, recurso) {
    return cursoId === '3B-2026' ? recurso : 'cursos/' + cursoId + '/' + recurso;
}

// ---- claves generadas: al azar (CSPRNG), nunca a la base de datos ni a git ----

// Sin 0/O/1/l/I ni caracteres ambiguos: se pueden copiar a mano sin errores.
const ALFABETO_CLAVE = 'abcdefghjkmnpqrstuvwxyz23456789';
function generarClave(longitud = 10) {
    let clave = '';
    for (let i = 0; i < longitud; i++) clave += ALFABETO_CLAVE[randomInt(ALFABETO_CLAVE.length)];
    return clave;
}

const DIR_SALIDA = join(dirname(fileURLToPath(import.meta.url)), 'salida-claves');
let archivoSalida = null;
function archivoDeEstaEjecucion() {
    if (!archivoSalida) {
        const marca = new Date().toISOString().replace(/[:.]/g, '-');
        archivoSalida = join(DIR_SALIDA, 'claves-' + marca + '.csv');
    }
    return archivoSalida;
}

// Devuelve la ruta del archivo donde quedo escrita la clave (para avisar).
async function registrarClaveGenerada(etiqueta, clave) {
    await mkdir(DIR_SALIDA, { recursive: true });
    const archivo = archivoDeEstaEjecucion();
    await appendFile(archivo, etiqueta + ',' + clave + '\n', 'utf8');
    return archivo;
}

async function upsertUser(email, password, claims) {
    let user;
    try {
        user = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(user.uid, { password });
    } catch (error) {
        if (error.code !== 'auth/user-not-found') throw error;
        user = await admin.auth().createUser({ email, password });
    }
    await admin.auth().setCustomUserClaims(user.uid, claims);
    return user;
}

async function crearDocente(usuario, claveArg) {
    const clave = claveArg || generarClave();
    const email = emailDocente(usuario);
    await upsertUser(email, clave, { role: 'docente' });
    if (claveArg) {
        console.log('Cuenta docente lista: ' + usuario + ' -> ' + email);
    } else {
        const archivo = await registrarClaveGenerada('docente:' + usuario, clave);
        console.log('Cuenta docente lista: ' + usuario + ' -> ' + email + ' (clave generada en ' + archivo + ')');
    }
}

// Devuelve la clave usada (generada o la dada), para que migrar-roster pueda
// resumir cuantas genero sin tener que volver a leer el archivo.
async function crearEstudiante(cursoId, nombreSocial, studentId, claveArg) {
    const clave = claveArg || generarClave();
    const email = emailEstudiante(cursoId, nombreSocial);
    await upsertUser(email, clave, { role: 'estudiante', cursoId, studentId });
    if (claveArg) {
        console.log('Cuenta lista: ' + nombreSocial + ' (curso ' + cursoId + ', id ' + studentId + ') -> ' + email);
    } else {
        await registrarClaveGenerada(nombreSocial + ' (curso ' + cursoId + ')', clave);
        console.log('Cuenta lista: ' + nombreSocial + ' (curso ' + cursoId + ', id ' + studentId + ') -> ' + email +
            ' (clave generada)');
    }
    return clave;
}

async function migrarRoster(cursoId) {
    const ref = admin.database().ref(cursoDbPath(cursoId, 'students'));
    const snapshot = await ref.once('value');
    const raw = snapshot.val() || {};
    const entradas = Object.entries(raw).filter(([, s]) => s);
    if (entradas.length === 0) {
        console.log('No hay estudiantes en ' + cursoDbPath(cursoId, 'students') + '.');
        return;
    }
    let migrados = 0;
    for (const [key, s] of entradas) {
        const nombre = s.nombreSocial || s.nombre;
        if (!s.password) {
            console.log('- ' + nombre + ': sin clave en la base (¿ya migrado?), se omite.');
            continue;
        }
        // Clave NUEVA generada al azar: la que estaba en `s.password` quedo
        // expuesta mientras la base no tenia reglas, asi que no se reutiliza.
        await crearEstudiante(cursoId, nombre, s.id);
        await ref.child(key).child('password').remove();
        migrados++;
        console.log('  clave retirada de la base para ' + nombre + '.');
    }
    if (migrados > 0) {
        console.log('\n' + migrados + ' clave(s) nueva(s) guardada(s) en ' + archivoDeEstaEjecucion());
        console.log('Entregalas a cada estudiante y DESPUES borra ese archivo: no viaja al repositorio ' +
            '(esta en .gitignore), pero tampoco debe quedar en el disco mas de lo necesario.');
    }
}

// Saca `nombreLegal` del registro publico de cada estudiante y lo deja en
// `students_privado` (lectura exclusiva del docente, ver database.rules.json).
// La app ya escribe ahi a los estudiantes nuevos; esto es solo para el roster
// que ya existia antes de este cambio.
async function migrarNombresLegales(cursoId) {
    const refStudents = admin.database().ref(cursoDbPath(cursoId, 'students'));
    const refPrivado = admin.database().ref(cursoDbPath(cursoId, 'students_privado'));
    const snapshot = await refStudents.once('value');
    const raw = snapshot.val() || {};
    const entradas = Object.entries(raw).filter(([, s]) => s);
    let movidos = 0;
    for (const [key, s] of entradas) {
        const nombre = s.nombreSocial || s.nombre;
        if (!s.nombreLegal || s.nombreLegal === nombre) {
            await refStudents.child(key).child('nombreLegal').remove();
            continue;
        }
        await refPrivado.child(String(s.id)).set(s.nombreLegal);
        await refStudents.child(key).child('nombreLegal').remove();
        movidos++;
        console.log('  nombre legal movido a students_privado para ' + nombre + '.');
    }
    console.log(movidos + ' nombre(s) legal(es) movido(s) de ' + entradas.length + ' estudiante(s) en ' + cursoId + '.');
}

// SOLO para ensayos: escribe un roster ficticio con password/nombreLegal
// inline, tal como se veia ANTES de este cambio, para poder probar
// migrar-roster/migrar-nombres-legales sin inventar 35 estudiantes a mano.
// El guardia contra el proyecto real esta en el dispatcher, mas abajo.
async function sembrarRoster(cursoId, cantidadArg) {
    const cantidad = Number(cantidadArg) || 35;
    const ref = admin.database().ref(cursoDbPath(cursoId, 'students'));
    const existentes = (await ref.once('value')).val() || {};
    const base = Array.isArray(existentes) ? existentes.length : Object.keys(existentes).length;
    const nuevos = [];
    for (let i = 0; i < cantidad; i++) {
        const n = base + i + 1;
        nuevos.push({
            id: Date.now() + i,
            nombre: 'Estudiante' + n,
            nombreSocial: 'Estudiante' + n,
            nombreLegal: 'Estudiante' + n + ' Apellido Ficticio',
            genero: 'no-binario',
            clase: 'C' + ((i % 5) + 1),
            password: 'clave-ficticia-' + n,
            xp: 0,
            badges: ['iniciado']
        });
    }
    const combinados = (Array.isArray(existentes) ? existentes : Object.values(existentes)).concat(nuevos);
    await ref.set(combinados);
    console.log('Sembrados ' + cantidad + ' estudiantes ficticios en ' + cursoDbPath(cursoId, 'students') + '.');
}

async function restablecerClave(args) {
    if (args[0] === 'docente') {
        const [, claveNueva] = args;
        const clave = claveNueva || generarClave();
        await upsertUser(emailDocente('profesor'), clave, { role: 'docente' });
        if (claveNueva) {
            console.log('Clave docente actualizada.');
        } else {
            const archivo = await registrarClaveGenerada('docente:profesor', clave);
            console.log('Clave docente actualizada (generada en ' + archivo + ').');
        }
        return;
    }
    const [cursoId, nombreSocial, claveNueva] = args;
    const ref = admin.database().ref(cursoDbPath(cursoId, 'students'));
    const snapshot = await ref.once('value');
    const raw = snapshot.val() || {};
    const match = Object.values(raw).find((s) => s && (s.nombreSocial || s.nombre) === nombreSocial);
    if (!match) {
        console.error('No se encontro "' + nombreSocial + '" en el curso ' + cursoId + '.');
        process.exit(1);
    }
    await crearEstudiante(cursoId, nombreSocial, match.id, claveNueva);
}

async function listar(cursoId) {
    const ref = admin.database().ref(cursoDbPath(cursoId, 'students'));
    const snapshot = await ref.once('value');
    const roster = Object.values(snapshot.val() || {}).filter(Boolean);
    const { users } = await admin.auth().listUsers(1000);
    const cuentas = users.filter((u) => u.customClaims && u.customClaims.cursoId === cursoId);

    console.log('Roster de ' + cursoId + ' (' + roster.length + ' estudiantes):');
    for (const s of roster) {
        const nombre = s.nombreSocial || s.nombre;
        const tieneCuenta = cuentas.some((u) => u.customClaims.studentId === s.id);
        const avisos = [
            s.password ? 'aun tiene clave en texto plano en la base' : null,
            s.nombreLegal && s.nombreLegal !== nombre ? 'nombre legal sin migrar a students_privado' : null
        ].filter(Boolean);
        console.log('  ' + (tieneCuenta ? '[cuenta OK]    ' : '[SIN CUENTA]  ') + nombre +
            (avisos.length ? ' — ' + avisos.join('; ') : ''));
    }
    const huerfanas = cuentas.filter((u) => !roster.some((s) => s.id === u.customClaims.studentId));
    if (huerfanas.length) {
        console.log('Cuentas de Authentication sin estudiante correspondiente en el roster:');
        huerfanas.forEach((u) => console.log('  ' + u.email));
    }
}

function ayuda() {
    console.log(`Uso: node scripts/gestionar-cuentas.mjs <comando> [argumentos]

  crear-docente <usuario> [clave]
  crear-estudiante <cursoId> "<nombreSocial>" <studentId> [clave]
  migrar-roster <cursoId>
  restablecer-clave docente [clave-nueva]
  restablecer-clave <cursoId> "<nombreSocial>" [clave-nueva]
  migrar-nombres-legales <cursoId>
  sembrar-roster <cursoId> [cantidad=35]   (solo ensayos; bloqueado contra el proyecto real)
  listar <cursoId>

Si omites la clave se genera una al azar y queda en
web/scripts/salida-claves/ (fuera de git) para que la entregues y borres
el archivo despues.

Antes de usar cualquier comando: GOOGLE_APPLICATION_CREDENTIALS debe apuntar
a la clave de servicio del proyecto (fuera de este repositorio).`);
}

const [comando, ...args] = process.argv.slice(2);

if (!comando || comando === 'ayuda' || comando === '--help') {
    ayuda();
    process.exit(comando ? 0 : 1);
}

if (comando === 'sembrar-roster' && PROJECT_ID === PROJECT_REAL) {
    console.error('sembrar-roster esta bloqueado contra el proyecto real (' + PROJECT_REAL + ').');
    console.error('Usa VITE_FIREBASE_PROJECT_ID para apuntar a un proyecto de pruebas (ver docs/ENSAYO.md).');
    process.exit(1);
}

console.log('Proyecto: ' + PROJECT_ID + ' (' + DATABASE_URL + ')');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: PROJECT_ID,
    databaseURL: DATABASE_URL
});

const comandos = {
    'crear-docente': () => crearDocente(args[0], args[1]),
    'crear-estudiante': () => crearEstudiante(args[0], args[1], Number(args[2]), args[3]),
    'migrar-roster': () => migrarRoster(args[0]),
    'restablecer-clave': () => restablecerClave(args),
    'migrar-nombres-legales': () => migrarNombresLegales(args[0]),
    'sembrar-roster': () => sembrarRoster(args[0], args[1]),
    listar: () => listar(args[0])
};

const accion = comandos[comando];
if (!accion) {
    console.error('Comando desconocido: ' + comando + '\n');
    ayuda();
    process.exit(1);
}

accion()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
