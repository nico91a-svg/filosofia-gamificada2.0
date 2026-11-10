// Pruebas de extremo a extremo sobre el build de produccion, en un navegador real.
import { expect, test } from '@playwright/test';
import {
    CLAVE_DOCENTE, ESTUDIANTES, entrarComoEstudiante, entrarComoProfesor, readDb, seed, vigilarErrores
} from './helpers.js';

test.beforeEach(async ({ context }) => {
    await seed(context);
});

// Lo que no debe cambiar por accidente: identidad, XP, insignias y artefactos.
const progreso = (students) => students.map((s) => ({
    id: s.id, nombre: s.nombre, password: s.password, xp: s.xp, badges: s.badges, artefactos: s.artefactos || []
}));

const irA = (page, tab) => page.getByRole('button', { name: new RegExp(tab + '$') }).first().click();

test.describe('acceso', () => {
    test('una clave incorrecta muestra el error y la correcta entra', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: /Acceso Profesor/ }).click();
        await page.getByLabel('Usuario').fill('profesor');
        await page.getByLabel('Contraseña').fill('no-es-la-clave');
        await page.getByRole('button', { name: 'Entrar' }).click();
        await expect(page.getByRole('alert')).toContainText('incorrectos');

        await page.getByLabel('Contraseña').fill(CLAVE_DOCENTE);
        await page.getByRole('button', { name: 'Entrar' }).click();
        await expect(page.getByRole('heading', { name: 'Dashboard del Profesor' })).toBeVisible();
    });

    test('la clave docente no viaja en texto plano dentro del sitio', async ({ page, request }) => {
        await page.goto('/');
        const scripts = await page.locator('script[src]').evaluateAll((nodes) => nodes.map((n) => n.src));
        for (const src of scripts) {
            const body = await (await request.get(src)).text();
            expect(body).not.toContain(CLAVE_DOCENTE);
            expect(body).not.toContain('filosofia2026');
        }
    });

    test('el estudiante sigue con su sesion al recargar y la pierde al salir', async ({ page }) => {
        await entrarComoEstudiante(page, 'BetoR');
        await page.reload();
        await expect(page.getByRole('heading', { name: 'BetoR' }).first()).toBeVisible();

        await page.getByTitle('Cerrar sesion').click();
        await expect(page.getByRole('button', { name: /Acceso Estudiante/ })).toBeVisible();
        await page.reload();
        await expect(page.getByRole('button', { name: /Acceso Estudiante/ })).toBeVisible();
    });

    test('abrir la app no escribe nada en la base de datos', async ({ page }) => {
        await entrarComoEstudiante(page, 'BetoR');
        await page.waitForTimeout(300);
        expect(await readDb(page, 'students')).toEqual(ESTUDIANTES);
        expect(await readDb(page, 'activities')).toBe(null);
        expect(await readDb(page, 'unidades')).toBe(null);
    });
});

test.describe('panel docente', () => {
    test('todas las pestañas cargan sin errores', async ({ page }) => {
        const errores = vigilarErrores(page);
        await entrarComoProfesor(page);
        for (const tab of ['Estudiantes', 'Actividades', 'Unidades', 'Registro Masivo', 'Misiones', 'Artefactos', 'Habilidades', 'Cursos', 'Dashboard']) {
            await irA(page, tab);
            await expect(page.locator('main, .max-w-7xl').last()).toBeVisible();
        }
        expect(errores).toEqual([]);
    });

    test('en un celular ninguna pestaña se desborda @movil', async ({ page }) => {
        await entrarComoProfesor(page);
        await expect(page.getByRole('button', { name: 'Salir' })).toBeInViewport();
        for (const tab of ['Estudiantes', 'Actividades', 'Unidades', 'Registro Masivo', 'Misiones', 'Artefactos', 'Habilidades', 'Cursos', 'Dashboard']) {
            await irA(page, tab);
            const desborde = await page.evaluate(() =>
                document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(desborde, 'desborde horizontal en ' + tab).toBeLessThanOrEqual(0);
        }
    });

    test('registro individual: suma XP y habilidades, guarda la actividad y entrega cofre', async ({ page }) => {
        await entrarComoProfesor(page);
        await irA(page, 'Actividades');
        await page.getByRole('button', { name: 'Registrar Actividad' }).click();

        const modal = page.locator('div.fixed').filter({ hasText: 'Registrar Actividad' });
        await modal.locator('select').nth(0).selectOption({ label: 'CaroS' });
        await modal.locator('select').nth(3).selectOption('debate');
        await modal.locator('select').nth(4).selectOption('avanzado');
        await expect(modal.getByText('60 XP')).toBeVisible();
        await modal.getByRole('button', { name: 'Registrar', exact: true }).click();

        await expect(page.getByText('+60 XP').first()).toBeVisible();
        const caro = (await readDb(page, 'students'))[2];
        expect(caro.xp).toBe(105);
        expect(caro.habilidades).toMatchObject({ H3: 3, H2: 2, H4: 1 });
        expect(caro.badges).toEqual(expect.arrayContaining(['participante', 'guerrero', 'debatiente']));
        expect(caro.artefactos.map((a) => a.id)).toEqual(['cofre_bronce']);

        const actividades = await readDb(page, 'activities');
        expect(actividades).toHaveLength(1);
        expect(actividades[0]).toMatchObject({ studentId: 3, tipo: 'debate', nivel: 'avanzado', xp: 60, unidadId: 'U1', claseNum: 1 });
        // El progreso de los demas estudiantes no cambio.
        expect(progreso(await readDb(page, 'students')).filter((s) => s.id !== 3))
            .toEqual(progreso(ESTUDIANTES).filter((s) => s.id !== 3));
    });

    test('registro masivo: guarda una actividad por estudiante y respeta el limite diario', async ({ page }) => {
        await entrarComoProfesor(page);
        await irA(page, 'Registro Masivo');

        const registrar = async () => {
            await page.getByRole('button', { name: 'Todos' }).click();
            await page.locator('select').nth(2).selectOption('participacion');
            await page.getByRole('button', { name: /Registrar Actividad para 4 estudiantes/ }).click();
            await expect(page.getByText(/registradas exitosamente para 4 estudiantes/)).toBeVisible();
        };

        await registrar();
        let actividades = await readDb(page, 'activities');
        // Antes de la correccion aqui quedaba 1 sola actividad (la del ultimo estudiante).
        expect(actividades).toHaveLength(4);
        expect(new Set(actividades.map((a) => a.studentId))).toEqual(new Set([1, 2, 3, 4]));
        expect(new Set(actividades.map((a) => a.id)).size).toBe(4);
        expect((await readDb(page, 'students')).map((s) => s.xp)).toEqual([130, 310, 55, 10]);

        await registrar();
        await registrar(); // tercera participacion del dia: se registra pero sin XP
        actividades = await readDb(page, 'activities');
        expect(actividades).toHaveLength(12);
        expect(actividades.filter((a) => a.xp === 0)).toHaveLength(4);
        expect((await readDb(page, 'students')).map((s) => s.xp)).toEqual([140, 320, 65, 20]);
    });

    test('editar una unidad la guarda y se puede restaurar el contenido del pack', async ({ page }) => {
        await entrarComoProfesor(page);
        await irA(page, 'Unidades');
        await expect(page.getByText('original del pack')).toBeVisible();

        await page.getByRole('button', { name: 'Editar' }).first().click();
        await page.getByRole('button', { name: 'editar' }).first().click();
        await page.locator('input[type="text"]').first().fill('Clase editada por el docente');
        await page.getByRole('button', { name: 'Listo' }).click();

        await expect(page.getByText('con ediciones propias')).toBeVisible();
        expect((await readDb(page, 'unidades'))[0].clases[0].titulo).toBe('Clase editada por el docente');

        page.once('dialog', (dialog) => dialog.accept());
        await page.getByRole('button', { name: 'Restaurar contenido del pack' }).click();
        await expect(page.getByText('original del pack')).toBeVisible();
        expect(await readDb(page, 'unidades')).toBe(null);
    });
});

test.describe('panel del estudiante', () => {
    test('regala el primer artefacto del inventario y abre un cofre', async ({ page }) => {
        const errores = vigilarErrores(page);
        await entrarComoEstudiante(page, 'AnaP');
        await page.getByRole('button', { name: /Artefactos/ }).last().click();

        // Regalar el artefacto en la posicion 0 (antes no hacia nada).
        await page.getByRole('button', { name: /Regalar/ }).first().click();
        const modal = page.locator('div.fixed').filter({ hasText: 'Regalar Artefacto' });
        await modal.locator('select').selectOption({ label: 'BetoR' });
        await modal.getByRole('button', { name: 'Regalar', exact: true }).click();
        await expect(modal).toBeHidden();

        let alumnos = await readDb(page, 'students');
        expect(alumnos[0].artefactos.map((a) => a.id)).toEqual(['cofre_bronce']);
        expect(alumnos[1].artefactos).toHaveLength(1);
        expect(alumnos[1].artefactos[0]).toMatchObject({ id: 'A3', regaladoPor: 1, usado: false });

        await page.getByRole('button', { name: /Abrir Cofre/ }).click();
        await expect(page.getByText(/Obtuviste:/)).toBeVisible({ timeout: 6000 });
        await page.getByRole('button', { name: 'Genial!' }).click();

        alumnos = await readDb(page, 'students');
        expect(alumnos[0].artefactos).toHaveLength(1);
        expect(alumnos[0].artefactos[0].id).toMatch(/^A\d+$/);
        expect(alumnos[0].artefactos[0].deCofre).toBe('bronce');
        // El XP y los datos de los demas no se tocaron.
        expect(alumnos[0].xp).toBe(120);
        expect(alumnos[2]).toEqual(ESTUDIANTES[2]);
        expect(errores).toEqual([]);
    });

    test('recorre todas las pestañas sin errores @movil', async ({ page }) => {
        const errores = vigilarErrores(page);
        await entrarComoEstudiante(page, 'AnaP');
        for (const tab of ['Aventura', 'Ranking', 'Vocabul', 'Activid', 'Artefact', 'Mi Perfil']) {
            await page.getByRole('button', { name: new RegExp(tab) }).last().click();
            const desborde = await page.evaluate(() =>
                document.documentElement.scrollWidth - document.documentElement.clientWidth);
            expect(desborde, 'desborde horizontal en ' + tab).toBeLessThanOrEqual(0);
        }
        expect(errores).toEqual([]);
    });
});

test.describe('varios dispositivos a la vez', () => {
    test('el docente suma XP mientras la estudiante usa un artefacto: no se pisan', async ({ context }) => {
        const profe = await context.newPage();
        const ana = await context.newPage();
        await entrarComoProfesor(profe);
        await entrarComoEstudiante(ana, 'AnaP');
        await ana.getByRole('button', { name: /Artefactos/ }).last().click();

        // El docente registra una actividad para Ana.
        await irA(profe, 'Actividades');
        await profe.getByRole('button', { name: 'Registrar Actividad' }).click();
        const modal = profe.locator('div.fixed').filter({ hasText: 'Registrar Actividad' });
        await modal.locator('select').nth(0).selectOption({ label: 'AnaP' });
        await modal.locator('select').nth(3).selectOption('reflexion');
        await modal.getByRole('button', { name: 'Registrar', exact: true }).click();

        // La pantalla de Ana se actualiza sola (120 + 20).
        await expect(ana.getByText('140 XP').first()).toBeVisible();

        // Ana usa su artefacto desde su dispositivo.
        await ana.getByRole('button', { name: /Usar/ }).first().click();
        await ana.getByRole('button', { name: /Confirmar Uso/ }).click();

        await expect.poll(async () => (await readDb(profe, 'students'))[0].artefactos[0].usado).toBe(true);
        const final = (await readDb(profe, 'students'))[0];
        expect(final.xp).toBe(140);
        expect(final.habilidades).toMatchObject({ H6: 3, H1: 1 });
        expect(await readDb(profe, 'activities')).toHaveLength(1);
    });
});

test.describe('cursos y contenido', () => {
    test('un curso nuevo tiene datos y contenido propios, sin tocar el original', async ({ page }) => {
        const errores = vigilarErrores(page);
        await entrarComoProfesor(page);
        await irA(page, 'Cursos');
        await page.getByRole('button', { name: 'Nuevo curso' }).click();

        const cursos = await readDb(page, 'cursos_registro');
        expect(cursos).toHaveLength(2);
        const nuevo = cursos[1];
        const tarjeta = page.getByTestId('curso-' + nuevo.id);
        await tarjeta.getByLabel('Nombre del curso').fill('IV Medio A');
        await tarjeta.getByLabel('Pack de contenido').selectOption('etica-introduccion');
        await tarjeta.getByRole('button', { name: 'Activar' }).click();
        await expect(page.getByTestId('curso-activo')).toContainText('IV Medio A');

        // Contenido del pack de etica y cero estudiantes.
        await irA(page, 'Unidades');
        await expect(page.getByRole('heading', { name: /¿Qué debo hacer\? La pregunta ética/ })).toBeVisible();
        await irA(page, 'Estudiantes');
        await page.getByRole('button', { name: 'Agregar Estudiante' }).click();
        const modal = page.locator('div.fixed').filter({ hasText: 'Agregar Nuevo Estudiante' });
        await modal.getByPlaceholder(/Nombre social/).fill('EloyV');
        await modal.getByPlaceholder(/Nombre legal/).fill('Eloy Vera');
        await modal.locator('select').nth(0).selectOption('masculino');
        await modal.locator('select').nth(1).selectOption('C3');
        await modal.getByPlaceholder('Contraseña').fill('EloyV2027');
        await modal.getByRole('button', { name: 'Agregar', exact: true }).click();
        await expect(page.getByText('EloyV', { exact: true })).toBeVisible();

        const propios = await readDb(page, 'cursos/' + nuevo.id + '/students');
        expect(propios).toHaveLength(1);
        expect(propios[0]).toMatchObject({ nombreSocial: 'EloyV', xp: 0, badges: ['iniciado'] });
        expect(progreso(await readDb(page, 'students'))).toEqual(progreso(ESTUDIANTES));
        expect(await readDb(page, 'activities')).toBe(null);

        // El estudiante nuevo entra a SU curso y ve SU contenido.
        await page.getByRole('button', { name: 'Salir' }).click();
        await page.getByRole('button', { name: /Acceso Estudiante/ }).click();
        await page.getByLabel('Nombre social').fill('EloyV');
        await page.getByLabel('Contraseña').fill('EloyV2027');
        await page.getByRole('button', { name: 'Entrar' }).click();
        await expect(page.getByText(/Clase 1: Moral y ética/)).toBeVisible();

        // Un estudiante del curso original no puede entrar a este.
        await page.getByTitle('Cerrar sesion').click();
        await page.getByRole('button', { name: /Acceso Estudiante/ }).click();
        await page.getByLabel('Nombre social').fill('AnaP');
        await page.getByLabel('Contraseña').fill('AnaP2026');
        await page.getByRole('button', { name: 'Entrar' }).click();
        await expect(page.getByRole('alert')).toContainText('incorrectos');

        // ...pero si cambia de curso, entra.
        await page.getByRole('button', { name: /Volver/ }).click();
        await page.getByRole('button', { name: 'cambiar' }).click();
        await page.getByRole('button', { name: /III Medio B/ }).click();
        await page.getByRole('button', { name: /Acceso Estudiante/ }).click();
        await page.getByLabel('Nombre social').fill('AnaP');
        await page.getByLabel('Contraseña').fill('AnaP2026');
        await page.getByRole('button', { name: 'Entrar' }).click();
        await expect(page.getByRole('heading', { name: 'AnaP' }).first()).toBeVisible();
        expect(errores).toEqual([]);
    });
});

test.describe('aplicacion instalable', () => {
    test.use({ serviceWorkers: 'allow' });

    test('publica manifiesto e iconos, y abre sin red despues de la primera visita', async ({ page, context, request }) => {
        await page.goto('/');
        const href = await page.locator('link[rel="manifest"]').getAttribute('href');
        const manifest = await (await request.get(new URL(href, page.url()).toString())).json();
        expect(manifest.name).toBe('Filósofo en Formación');
        expect(manifest.display).toBe('standalone');
        for (const icon of manifest.icons) {
            const res = await request.get(new URL(icon.src, new URL(href, page.url())).toString());
            expect(res.ok(), icon.src).toBe(true);
            expect(res.headers()['content-type']).toContain('image/png');
        }

        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.waitForTimeout(1500); // el service worker termina de guardar los archivos
        await context.setOffline(true);
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Filósofo en Formación' })).toBeVisible();
    });
});
