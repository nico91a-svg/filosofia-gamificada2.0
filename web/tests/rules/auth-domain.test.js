// Comprueba que Firebase Authentication SI acepta el dominio sintetico
// ".invalid" (ver web/src/services/auth.js) para crear y autenticar
// cuentas. Corre contra el emulador de Auth (npm run test:rules arranca
// database+auth juntos), nunca contra un proyecto real.
import { beforeAll, describe, expect, test } from 'vitest';
import admin from 'firebase-admin';
import { emailDocente, emailEstudiante } from '../../src/services/auth.js';

let app;

beforeAll(() => {
    // Con FIREBASE_AUTH_EMULATOR_HOST presente (lo pone `firebase
    // emulators:exec`), el Admin SDK habla con el emulador y no necesita
    // credenciales reales.
    app = admin.initializeApp({ projectId: 'demo-filosofia-gamificada-rules-test' }, 'auth-domain-test');
});

describe('dominio .invalid en Firebase Authentication', () => {
    test('crea y autentica una cuenta de docente con el correo sintetico', async () => {
        const email = emailDocente('profesor');
        expect(email).toBe('profesor@docentes.filosofo-en-formacion.invalid');

        const user = await admin.auth(app).createUser({ email, password: 'clave-de-prueba-1' });
        expect(user.email).toBe(email);

        const encontrado = await admin.auth(app).getUserByEmail(email);
        expect(encontrado.uid).toBe(user.uid);
    });

    test('crea una cuenta de estudiante con el correo sintetico y le fija custom claims', async () => {
        const email = emailEstudiante('3B-2026', 'Ana Pérez');
        expect(email).toBe('ana-perez.3b-2026@alumnos.filosofo-en-formacion.invalid');

        const user = await admin.auth(app).createUser({ email, password: 'clave-de-prueba-2' });
        await admin.auth(app).setCustomUserClaims(user.uid, { role: 'estudiante', cursoId: '3B-2026', studentId: 1 });

        const encontrado = await admin.auth(app).getUser(user.uid);
        expect(encontrado.customClaims).toEqual({ role: 'estudiante', cursoId: '3B-2026', studentId: 1 });
    });
});
