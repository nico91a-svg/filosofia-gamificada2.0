// Autenticacion del lado del cliente.
//
// IMPORTANTE: esto evita que la clave docente se lea a simple vista en el
// codigo publicado, pero NO es seguridad real: mientras la base de datos acepte
// lecturas y escrituras anonimas, alguien con conocimientos puede saltarse la
// interfaz. La proteccion de verdad es Firebase Authentication + reglas (ver
// docs/SEGURIDAD.md).

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
