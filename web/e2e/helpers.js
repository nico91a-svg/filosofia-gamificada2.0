// Utilidades compartidas por las pruebas de navegador.
export const CLAVE_DOCENTE = 'clave-de-pruebas-e2e'; // solo existe en .env.e2e

const base = (id, nombre, genero, extra = {}) => ({
    id, nombre, nombreSocial: nombre, nombreLegal: nombre + ' Apellido', genero, clase: 'C' + ((id % 5) + 1),
    password: nombre + '2026', xp: 0, habilidades: { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0 },
    badges: ['iniciado'], ...extra
});

export const ESTUDIANTES = [
    base(1, 'AnaP', 'femenino', { xp: 120, artefactos: [{ id: 'A3', obtenido: '2026-03-10T12:00:00.000Z', usado: false }, { id: 'cofre_bronce', obtenido: '2026-03-11T12:00:00.000Z', usado: false }] }),
    base(2, 'BetoR', 'masculino', { xp: 300 }),
    base(3, 'CaroS', 'femenino', { xp: 45 }),
    base(4, 'DaniT', 'no-binario', { xp: 0 })
];

// Carga datos iniciales en el almacenamiento local antes de que arranque la app.
// Solo la primera vez: las recargas conservan lo que la prueba haya modificado.
export async function seed(context, data = { students: ESTUDIANTES }) {
    await context.addInitScript((initial) => {
        if (localStorage.getItem('__seeded')) return;
        localStorage.setItem('__seeded', '1');
        for (const [path, value] of Object.entries(initial)) {
            localStorage.setItem('filosofo_db_' + path, JSON.stringify(value));
        }
    }, data);
}

export const readDb = (page, path) =>
    page.evaluate((p) => JSON.parse(localStorage.getItem('filosofo_db_' + p) || 'null'), path);

export async function entrarComoProfesor(page) {
    await page.goto('/');
    await page.getByRole('button', { name: /Acceso Profesor/ }).click();
    await page.getByLabel('Usuario').fill('profesor');
    await page.getByLabel('Contraseña').fill(CLAVE_DOCENTE);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.getByRole('heading', { name: 'Dashboard del Profesor' }).waitFor();
}

export async function entrarComoEstudiante(page, nombre) {
    await page.goto('/');
    await page.getByRole('button', { name: /Acceso Estudiante/ }).click();
    await page.getByLabel('Nombre social').fill(nombre);
    await page.getByLabel('Contraseña').fill(nombre + '2026');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.getByRole('heading', { name: nombre }).first().waitFor();
}

// Falla la prueba si la pagina registra errores de JavaScript.
export function vigilarErrores(page) {
    const errores = [];
    page.on('pageerror', (error) => errores.push(String(error)));
    page.on('console', (msg) => {
        if (msg.type() === 'error') errores.push(msg.text());
    });
    return errores;
}
