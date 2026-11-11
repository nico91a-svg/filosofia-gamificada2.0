// Pruebas de database.rules.json contra el emulador de Realtime Database.
// Se corren con `npm run test:rules` (arranca el emulador solo, local y sin
// tocar el proyecto real: ver firebase.json y package.json).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { get, ref, set, update } from 'firebase/database';

const RULES_PATH = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../database.rules.json');

let testEnv;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: 'demo-filosofia-gamificada-rules-test',
        database: {
            rules: readFileSync(RULES_PATH, 'utf8'),
            host: '127.0.0.1',
            port: 9000
        }
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearDatabase();
});

const anonimo = () => testEnv.unauthenticatedContext().database();
const docente = () => testEnv.authenticatedContext('uid-docente', { role: 'docente' }).database();
const estudiante = (uid, cursoId, studentId) =>
    testEnv.authenticatedContext(uid, { role: 'estudiante', cursoId, studentId }).database();

// Carga datos saltandose las reglas (equivalente al Admin SDK en el script real).
function seed(data) {
    return testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.database();
        for (const [path, value] of Object.entries(data)) {
            await set(ref(db, path), value);
        }
    });
}

describe('acceso anonimo', () => {
    test('no puede leer los estudiantes del curso original', async () => {
        await seed({ students: { 0: { id: 1, nombreSocial: 'Ana', xp: 10 } } });
        await assertFails(get(ref(anonimo(), 'students')));
    });

    test('no puede escribir estudiantes ni actividades', async () => {
        await assertFails(set(ref(anonimo(), 'students'), { 0: { id: 1, nombreSocial: 'Hackeado' } }));
        await assertFails(set(ref(anonimo(), 'activities'), { 0: { studentId: 1, xp: 999 } }));
    });

    test('SI puede leer cursos_registro (metadata publica, sin datos de estudiantes)', async () => {
        await seed({ cursos_registro: { 0: { id: 'curso-a', nombre: 'Curso A' } } });
        await assertSucceeds(get(ref(anonimo(), 'cursos_registro')));
    });

    test('no puede escribir cursos_registro', async () => {
        await assertFails(set(ref(anonimo(), 'cursos_registro'), { 0: { id: 'intruso' } }));
    });
});

describe('aislamiento entre cursos', () => {
    beforeEach(() => seed({
        'cursos/curso-a/students': { 0: { id: 1, nombreSocial: 'Ana', xp: 10, artefactos: [] } }
    }));

    test('un estudiante de curso-b no puede leer los datos de curso-a', async () => {
        const db = estudiante('uid-intruso', 'curso-b', 99);
        await assertFails(get(ref(db, 'cursos/curso-a/students')));
    });

    test('un estudiante de curso-a si puede leer los datos de su curso', async () => {
        const db = estudiante('uid-ana', 'curso-a', 1);
        await assertSucceeds(get(ref(db, 'cursos/curso-a/students')));
    });

    test('el curso original (rutas planas en la raiz) sigue el mismo esquema', async () => {
        await seed({ students: { 0: { id: 1, nombreSocial: 'Ana', xp: 10 } } });
        await assertSucceeds(get(ref(estudiante('uid-ana', '3B-2026', 1), 'students')));
        await assertFails(get(ref(estudiante('uid-otro', 'otro-curso', 2), 'students')));
    });
});

describe('un estudiante no puede tocar xp, badges ni actividades', () => {
    beforeEach(() => seed({
        'cursos/curso-a/students': { 0: { id: 1, nombreSocial: 'Ana', xp: 10, badges: ['iniciado'] } }
    }));

    test('no puede subirse el xp', async () => {
        const db = estudiante('uid-ana', 'curso-a', 1);
        await assertFails(set(ref(db, 'cursos/curso-a/students/0/xp'), 9999));
    });

    test('no puede otorgarse insignias', async () => {
        const db = estudiante('uid-ana', 'curso-a', 1);
        await assertFails(set(ref(db, 'cursos/curso-a/students/0/badges'), ['todopoderoso']));
    });

    test('no puede escribir actividades', async () => {
        const db = estudiante('uid-ana', 'curso-a', 1);
        await assertFails(set(ref(db, 'cursos/curso-a/activities'), { 0: { studentId: 1, xp: 999 } }));
    });

    test('no puede editar la posicion ni las unidades del curso', async () => {
        const db = estudiante('uid-ana', 'curso-a', 1);
        await assertFails(set(ref(db, 'cursos/curso-a/position'), { unidad: 'U9', clase: 1 }));
        await assertFails(set(ref(db, 'cursos/curso-a/unidades'), [{ id: 'U9' }]));
    });
});

describe('el docente escribe todo', () => {
    test('estudiantes, actividades, unidades, posicion y el registro de cursos', async () => {
        const db = docente();
        await assertSucceeds(set(ref(db, 'cursos/curso-a/students'), { 0: { id: 1, nombreSocial: 'Ana', xp: 0 } }));
        await assertSucceeds(set(ref(db, 'cursos/curso-a/activities'), { 0: { studentId: 1, xp: 10 } }));
        await assertSucceeds(set(ref(db, 'cursos/curso-a/unidades'), [{ id: 'U1' }]));
        await assertSucceeds(set(ref(db, 'cursos/curso-a/position'), { unidad: 'U1', clase: 1 }));
        await assertSucceeds(set(ref(db, 'cursos_registro'), { 0: { id: 'curso-a', nombre: 'Curso A' } }));
    });

    test('tambien lee lo que sea, de cualquier curso', async () => {
        await seed({ 'cursos/curso-a/students': { 0: { id: 1, nombreSocial: 'Ana' } } });
        await assertSucceeds(get(ref(docente(), 'cursos/curso-a/students')));
    });
});

describe('regalo de artefactos entre companeros', () => {
    beforeEach(() => seed({
        'cursos/curso-a/students': {
            0: { id: 1, nombreSocial: 'Ana', artefactos: [{ id: 'A1' }] },
            1: { id: 2, nombreSocial: 'Beto', artefactos: [] }
        }
    }));

    test('un estudiante puede mover un artefacto al inventario de un companero del mismo curso', async () => {
        const db = estudiante('uid-ana', 'curso-a', 1);
        await assertSucceeds(update(ref(db, 'cursos/curso-a/students'), {
            '0/artefactos': [],
            '1/artefactos': [{ id: 'A1' }]
        }));
    });

    test('un estudiante de otro curso no puede tocar ese inventario', async () => {
        const db = estudiante('uid-intruso', 'curso-b', 99);
        await assertFails(set(ref(db, 'cursos/curso-a/students/1/artefactos'), [{ id: 'robado' }]));
    });
});

describe('students_privado (nombre legal): solo el docente', () => {
    beforeEach(() => seed({
        'cursos/curso-a/students': { 0: { id: 1, nombreSocial: 'Ana' } },
        'cursos/curso-a/students_privado': { 1: 'Ana Perez Soto' }
    }));

    test('un estudiante del propio curso NO puede leer los nombres legales', async () => {
        const db = estudiante('uid-ana', 'curso-a', 1);
        await assertFails(get(ref(db, 'cursos/curso-a/students_privado')));
    });

    test('un estudiante tampoco puede escribirlos', async () => {
        const db = estudiante('uid-ana', 'curso-a', 1);
        await assertFails(set(ref(db, 'cursos/curso-a/students_privado/1'), 'Nombre Falso'));
    });

    test('un visitante sin sesion no puede leerlos', async () => {
        await assertFails(get(ref(anonimo(), 'cursos/curso-a/students_privado')));
    });

    test('el docente si puede leer y escribir los nombres legales', async () => {
        const db = docente();
        await assertSucceeds(get(ref(db, 'cursos/curso-a/students_privado')));
        await assertSucceeds(set(ref(db, 'cursos/curso-a/students_privado/2'), 'Beto Rojas'));
    });
});

describe('namespace sandbox', () => {
    test('se comporta igual que el real: mismo curso lee y escribe su inventario, otros no', async () => {
        await seed({ 'sandbox/cursos/prueba/students': { 0: { id: 1, nombreSocial: 'Test', artefactos: [] } } });

        const propio = estudiante('uid-test', 'prueba', 1);
        await assertSucceeds(get(ref(propio, 'sandbox/cursos/prueba/students')));
        await assertSucceeds(set(ref(propio, 'sandbox/cursos/prueba/students/0/artefactos'), [{ id: 'X' }]));

        await assertFails(get(ref(anonimo(), 'sandbox/cursos/prueba/students')));

        const intruso = estudiante('uid-otro', 'otro-curso', 2);
        await assertFails(get(ref(intruso, 'sandbox/cursos/prueba/students')));
    });
});
