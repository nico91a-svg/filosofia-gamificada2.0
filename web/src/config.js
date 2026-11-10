// Configuracion global de la aplicacion.
const env = import.meta.env || {};

export const APP_CONFIG = {
    nombre: 'Filósofo en Formación',
    subtitulo: 'Sistema gamificado de Filosofía',
    autor: 'Nicolás Aldunate Gaete',
    anio: 2026,
    profesor: {
        usuario: 'profesor',
        // Huella SHA-256 de la clave (nunca la clave en texto). Para cambiarla:
        //   npm run hash-password -- profesor "clave nueva"
        passwordHash: env.VITE_PROFESOR_PASSWORD_HASH ||
            '6177c992948120ca3367681518d003fcd13d4682173a0a31fcb4128b066f8708'
    },
    // La configuracion web de Firebase es publica por diseño: identifica el
    // proyecto, no otorga permisos. El acceso se controla con las reglas de la
    // base de datos (ver docs/SEGURIDAD.md).
    firebase: {
        apiKey: 'AIzaSyATzt4AbNM_IqdetWsE4eJl2r5fn2R9nZs',
        authDomain: 'filosofia-gamificada.firebaseapp.com',
        databaseURL: 'https://filosofia-gamificada-default-rtdb.firebaseio.com',
        projectId: 'filosofia-gamificada',
        storageBucket: 'filosofia-gamificada.firebasestorage.app',
        messagingSenderId: '949249053229',
        appId: '1:949249053229:web:2ace36ea4928c948c99ea4',
        measurementId: 'G-EWNZ7NHBYM'
    }
};
