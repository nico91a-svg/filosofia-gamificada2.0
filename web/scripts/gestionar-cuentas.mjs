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
// Comandos:
//   crear-docente <usuario> <clave>
//       Crea o actualiza la cuenta del docente.
//   crear-estudiante <cursoId> "<nombreSocial>" <clave> <studentId>
//       Crea o actualiza la cuenta de un estudiante que YA existe en el
//       roster de ese curso (studentId es su campo `id` en la base de datos).
//   migrar-roster <cursoId>
//       Recorre el roster real de ese curso, crea una cuenta por cada
//       estudiante usando su clave actual como clave inicial, y borra el
//       campo `password` de la base de datos (es el paso que de verdad saca
//       las claves en texto plano). Usa 3B-2026 para el curso original.
//   restablecer-clave docente <clave-nueva>
//   restablecer-clave <cursoId> "<nombreSocial>" <clave-nueva>
//       Para cuando alguien olvida su clave.
//   listar <cursoId>
//       Compara el roster contra las cuentas de Authentication existentes.
import admin from 'firebase-admin';

// Mismos valores publicos que web/src/config.js (projectId y databaseURL no
// son secretos: identifican el proyecto, no otorgan permisos por si solos).
const PROJECT_ID = 'filosofia-gamificada';
const DATABASE_URL = 'https://filosofia-gamificada-default-rtdb.firebaseio.com';

// Mismo calculo que web/src/services/auth.js (emailDocente/emailEstudiante):
// si cambias uno, cambia el otro.
const DOMINIO_DOCENTE = 'docentes.filosofo-en-formacion.app';
const DOMINIO_ESTUDIANTE = 'alumnos.filosofo-en-formacion.app';

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

async function crearDocente(usuario, clave) {
    const email = emailDocente(usuario);
    await upsertUser(email, clave, { role: 'docente' });
    console.log('Cuenta docente lista: ' + usuario + ' -> ' + email);
}

async function crearEstudiante(cursoId, nombreSocial, clave, studentId) {
    const email = emailEstudiante(cursoId, nombreSocial);
    await upsertUser(email, clave, { role: 'estudiante', cursoId, studentId });
    console.log('Cuenta lista: ' + nombreSocial + ' (curso ' + cursoId + ', id ' + studentId + ') -> ' + email);
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
    for (const [key, s] of entradas) {
        const nombre = s.nombreSocial || s.nombre;
        if (!s.password) {
            console.log('- ' + nombre + ': sin clave en la base (¿ya migrado?), se omite.');
            continue;
        }
        await crearEstudiante(cursoId, nombre, s.password, s.id);
        await ref.child(key).child('password').remove();
        console.log('  clave retirada de la base para ' + nombre + '.');
    }
}

async function restablecerClave(args) {
    if (args[0] === 'docente') {
        const [, claveNueva] = args;
        await upsertUser(emailDocente('profesor'), claveNueva, { role: 'docente' });
        console.log('Clave docente actualizada.');
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
    await crearEstudiante(cursoId, nombreSocial, claveNueva, match.id);
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
        const avisoClave = s.password ? ' — aun tiene clave en texto plano en la base' : '';
        console.log('  ' + (tieneCuenta ? '[cuenta OK]    ' : '[SIN CUENTA]  ') + nombre + avisoClave);
    }
    const huerfanas = cuentas.filter((u) => !roster.some((s) => s.id === u.customClaims.studentId));
    if (huerfanas.length) {
        console.log('Cuentas de Authentication sin estudiante correspondiente en el roster:');
        huerfanas.forEach((u) => console.log('  ' + u.email));
    }
}

function ayuda() {
    console.log(`Uso: node scripts/gestionar-cuentas.mjs <comando> [argumentos]

  crear-docente <usuario> <clave>
  crear-estudiante <cursoId> "<nombreSocial>" <clave> <studentId>
  migrar-roster <cursoId>
  restablecer-clave docente <clave-nueva>
  restablecer-clave <cursoId> "<nombreSocial>" <clave-nueva>
  listar <cursoId>

Antes de usar cualquier comando: GOOGLE_APPLICATION_CREDENTIALS debe apuntar
a la clave de servicio del proyecto (fuera de este repositorio).`);
}

const [comando, ...args] = process.argv.slice(2);

if (!comando || comando === 'ayuda' || comando === '--help') {
    ayuda();
    process.exit(comando ? 0 : 1);
}

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: PROJECT_ID,
    databaseURL: DATABASE_URL
});

const comandos = {
    'crear-docente': () => crearDocente(args[0], args[1]),
    'crear-estudiante': () => crearEstudiante(args[0], args[1], args[2], Number(args[3])),
    'migrar-roster': () => migrarRoster(args[0]),
    'restablecer-clave': () => restablecerClave(args),
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
