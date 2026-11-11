// Autenticacion del lado del cliente.
//
// Esto se usa SOLO con el backend 'local' (desarrollo sin red, tests e2e: ver
// VITE_DB_BACKEND en docs/DEPLOY.md). Contra el backend 'firebase' (produccion)
// la verificacion real la hace Firebase Authentication - ver
// services/authBackend.js y docs/SEGURIDAD.md - y estas funciones ya no se usan
// para decidir el acceso, solo las funciones de correo sintetico de mas abajo.

export async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Mismo calculo que scripts/hash-password.mjs.
export function credentialHash(usuario, password) {
    return sha256Hex('filosofo-en-formacion:' + String(usuario).trim().toLowerCase() + ':' + password);
}

export async function verifyProfesor(config, usuario, password) {
    if (String(usuario).trim().toLowerCase() !== config.usuario.toLowerCase()) return false;
    return (await credentialHash(usuario, password)) === config.passwordHash;
}

// ---- sesion recordada del estudiante ----
// Guarda quien inicio sesion y una huella de su clave. Al volver a abrir la app
// se restaura solo si la huella sigue coincidiendo con la clave vigente.
const SESSION_KEY = 'filosofo_sesion';

export async function saveStudentSession(cursoId, student) {
    try {
        const check = await credentialHash(String(student.id), student.password || '');
        localStorage.setItem(SESSION_KEY, JSON.stringify({ cursoId, studentId: student.id, check }));
    } catch { /* sin almacenamiento o sin crypto: no se recuerda la sesion */ }
}

export function loadStudentSession() {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        return session && session.cursoId && session.studentId !== undefined ? session : null;
    } catch {
        return null;
    }
}

export function clearStudentSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* nada que limpiar */ }
}

export async function matchesSession(session, student) {
    if (!session || !student || session.studentId !== student.id) return false;
    try {
        return (await credentialHash(String(student.id), student.password || '')) === session.check;
    } catch {
        return false;
    }
}

// ---- correo sintetico para Firebase Authentication ----
// Firebase Auth exige un correo por cuenta; estos no son correos reales, son
// solo el identificador interno de la cuenta (nunca se muestran ni se envia
// nada ahi). Se derivan de datos que ya existen para no depender de una
// lectura previa a iniciar sesion.
//
// El dominio usa el TLD ".invalid" (reservado por RFC 2606 / RFC 6761):
// nadie puede registrarlo ni delegarlo via DNS, nunca resuelve. Si fuera un
// dominio real sin registrar (p. ej. ".app"), cualquiera podria registrarlo
// y despues pedir un restablecimiento de clave desde la pantalla de login de
// Firebase para CUALQUIER cuenta (incluida la docente) y recibir el correo
// el mismo. Con ".invalid" ese correo nunca puede llegar a nadie.
//
// Mismo calculo que scripts/gestionar-cuentas.mjs: si cambias uno, cambia el
// otro.
const DOMINIO_DOCENTE = 'docentes.filosofo-en-formacion.invalid';
const DOMINIO_ESTUDIANTE = 'alumnos.filosofo-en-formacion.invalid';

function slug(texto) {
    return String(texto).trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function emailDocente(usuario) {
    return slug(usuario) + '@' + DOMINIO_DOCENTE;
}

// El nombre social puede cambiar: si el docente le cambia el nombre a un
// estudiante hay que volver a correr el script para esa persona (ver
// docs/SEGURIDAD.md), porque el correo deja de calzar con el de su cuenta.
export function emailEstudiante(cursoId, nombreSocial) {
    return slug(nombreSocial) + '.' + slug(cursoId) + '@' + DOMINIO_ESTUDIANTE;
}
