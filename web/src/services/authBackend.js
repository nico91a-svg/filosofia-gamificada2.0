// Autenticacion real contra Firebase (produccion). El backend 'local'
// (desarrollo sin red, tests e2e: ver VITE_DB_BACKEND en docs/DEPLOY.md) no
// usa este modulo: sigue verificando con verifyProfesor/findStudentByCredentials
// de auth.js, igual que antes de este cambio.
//
// El rol, el curso y (para estudiantes) el id dentro del curso viajan en los
// custom claims del token. Esta app nunca puede fijarlos, solo leerlos: se
// fijan con el Admin SDK desde scripts/gestionar-cuentas.mjs, que se corre a
// mano fuera de la app. Ver docs/SEGURIDAD.md.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

function claimsOf(user) {
    return user.getIdTokenResult().then(({ claims }) => ({
        role: claims.role || null,
        cursoId: claims.cursoId || null,
        studentId: claims.studentId !== undefined ? claims.studentId : null
    }));
}

export function createFirebaseAuthBackend(config) {
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config);
    const auth = app.auth();

    return {
        kind: 'firebase',

        signIn(email, password) {
            return auth.signInWithEmailAndPassword(email, password).then(({ user }) => claimsOf(user));
        },

        signOut() {
            return auth.signOut();
        },

        // Sesion persistida por Firebase (sobrevive a recargar la pagina).
        // Se resuelve una sola vez, con la sesion que haya en ese momento.
        restore() {
            return new Promise((resolve) => {
                const unsubscribe = auth.onAuthStateChanged((user) => {
                    unsubscribe();
                    if (!user) return resolve(null);
                    claimsOf(user).then(resolve);
                });
            });
        }
    };
}
