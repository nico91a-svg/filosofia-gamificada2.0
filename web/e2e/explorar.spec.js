import { test } from '@playwright/test';
import { entrarComoEstudiante, entrarComoProfesor, seed, vigilarErrores } from './helpers.js';

const OUT = process.env.SHOTS_DIR;

test.describe('capturas exploratorias', () => {
    test.skip(!OUT, 'solo con SHOTS_DIR');

    test('profesor: todas las pestañas', async ({ page, context }) => {
        const errores = vigilarErrores(page);
        await seed(context);
        await page.goto('/');
        await page.screenshot({ path: OUT + '/00-login.png' });
        await entrarComoProfesor(page);
        const tabs = ['Dashboard', 'Estudiantes', 'Actividades', 'Unidades', 'Registro Masivo', 'Misiones', 'Artefactos', 'Habilidades', 'Cursos'];
        for (const [i, tab] of tabs.entries()) {
            await page.getByRole('button', { name: new RegExp(tab + '$') }).first().click();
            await page.waitForTimeout(250);
            await page.screenshot({ path: OUT + '/prof-' + i + '-' + tab.replace(' ', '') + '.png', fullPage: true });
        }
        console.log('ERRORES:', JSON.stringify(errores));
    });

    test('estudiante: todas las pestañas', async ({ page, context }) => {
        const errores = vigilarErrores(page);
        await seed(context);
        await page.setViewportSize({ width: 412, height: 915 });
        await entrarComoEstudiante(page, 'AnaP');
        const tabs = ['Mi Perfil', 'Aventura', 'Ranking', 'Vocabulario', 'Actividades', 'Artefactos'];
        for (const [i, tab] of tabs.entries()) {
            await page.getByRole('button', { name: new RegExp(tab) }).last().click();
            await page.waitForTimeout(250);
            await page.screenshot({ path: OUT + '/est-' + i + '-' + tab.replace(' ', '') + '.png', fullPage: true });
        }
        console.log('ERRORES:', JSON.stringify(errores));
    });
});
