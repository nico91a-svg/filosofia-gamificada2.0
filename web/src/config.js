// Configuracion global de la aplicacion.
const env = import.meta.env || {};

export const APP_CONFIG = {
    nombre: 'Filósofo en Formación',
    subtitulo: 'Sistema gamificado de Filosofía',
    autor: 'Nicolás Aldunate Gaete',
    anio: 2026,
    // Solo lo usa el backend 'local' (desarrollo sin red, tests e2e: ver
    // VITE_DB_BACKEND en docs/DEPLOY.md). Contra 'firebase' (produccion) el
    // docente se autentica con una cuenta real de Firebase Authentication
    // (services/authBackend.js) y esta huella no se consulta.
    profesor: {
        usuario: 'profesor',
        // Huella SHA-256 de la clave. Viene SOLO de VITE_PROFESOR_PASSWORD_HASH
        // (la define .env.e2e para los tests) — nunca un valor por defecto
        // escondido en el codigo. Sin esa variable, el login de profesor
        // contra el backend 'local' queda deshabilitado a proposito. Para
        // cambiarla: npm run hash-password -- profesor "clave nueva"
        passwordHash: env.VITE_PROFESOR_PASSWORD_HASH
    },
    // La configuracion web de Firebase es publica por diseño: identifica el
    // proyecto, no otorga permisos. El acceso se controla con las reglas de la
    // base de datos (ver docs/SEGURIDAD.md). Por defecto es el proyecto real
    // de siempre; las variables VITE_FIREBASE_* permiten apuntar a otro (por
    // ejemplo para probar reglas sin tocar el real — ver docs/SEGURIDAD.md).
    firebase: {
        apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyATzt4AbNM_IqdetWsE4eJl2r5fn2R9nZs',
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'filosofia-gamificada.firebaseapp.com',
        databaseURL: env.VITE_FIREBASE_DATABASE_URL || 'https://filosofia-gamificada-default-rtdb.firebaseio.com',
        projectId: env.VITE_FIREBASE_PROJECT_ID || 'filosofia-gamificada',
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'filosofia-gamificada.firebasestorage.app',
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '949249053229',
        appId: env.VITE_FIREBASE_APP_ID || '1:949249053229:web:2ace36ea4928c948c99ea4',
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-EWNZ7NHBYM'
    }
};
