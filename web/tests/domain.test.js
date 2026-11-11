import { describe, expect, it } from 'vitest';
import { ARTEFACTOS, COFRES, abrirCofre, getCofre } from '../src/domain/artefactos.js';
import { getNivel, NIVELES } from '../src/domain/niveles.js';
import { getHabilidadNivel } from '../src/domain/habilidades.js';
import { getMisionesDeClase } from '../src/domain/misiones.js';
import { RUBRICS_HABILIDADES, RUBRICS_XP, TIPOS_ACTIVIDAD } from '../src/domain/tipos-actividad.js';
import { nextId } from '../src/domain/ids.js';
import { crearEstudiante, findStudentByCredentials, normalizeStudent } from '../src/domain/estudiantes.js';
import { CURSOS_BASE, crearCurso, cursoPath, getCurso, normalizeCursos } from '../src/data/cursos.js';
import { credentialHash, verifyProfesor } from '../src/services/auth.js';

describe('niveles y habilidades', () => {
    it('cada XP cae en un nivel', () => {
        expect(getNivel(0).nivel).toBe(1);
        expect(getNivel(49).nivel).toBe(1);
        expect(getNivel(50).nivel).toBe(2);
        expect(getNivel(299).nivel).toBe(4);
        expect(getNivel(300).nivel).toBe(5); // coincide con la insignia "nivel5" (>= 300)
        expect(getNivel(1000).nivel).toBe(10);
        expect(getNivel(50000).nivel).toBe(10); // nunca se cae de la tabla
        expect(getNivel(undefined).nivel).toBe(1);
        expect(NIVELES).toHaveLength(10);
    });

    it('niveles de habilidad', () => {
        expect([0, 9, 10, 30, 60, 100].map(getHabilidadNivel)).toEqual([1, 1, 2, 3, 4, 5]);
    });
});

describe('actividades y cofres', () => {
    it('todo tipo de actividad tiene rubrica de XP y de habilidades', () => {
        for (const tipo of TIPOS_ACTIVIDAD) {
            expect(RUBRICS_XP[tipo.id], tipo.id).toBeDefined();
            expect(RUBRICS_HABILIDADES[tipo.id], tipo.id).toBeDefined();
        }
    });

    it('el cofre depende de la categoria y el desempeño', () => {
        expect(getCofre('participacion', 'excepcional')).toBe(null);
        expect(getCofre('debate', 'basico')).toBe('bronce');
        expect(getCofre('ensayo', 'competente')).toBe('plata');
        expect(getCofre('ensayo', 'avanzado')).toBe('oro');
        expect(getCofre('inexistente', 'avanzado')).toBe(null);
    });

    it('abrir un cofre siempre entrega un artefacto del catalogo', () => {
        for (const tipo of Object.keys(COFRES)) {
            for (let i = 0; i < 200; i++) {
                expect(ARTEFACTOS).toContain(abrirCofre(tipo));
            }
        }
        expect(abrirCofre('diamante')).toBe(null);
    });

    it('las probabilidades de cada cofre suman 100', () => {
        for (const cofre of Object.values(COFRES)) {
            expect(Object.values(cofre.probabilidades).reduce((a, b) => a + b, 0)).toBe(100);
        }
    });
});

describe('misiones', () => {
    it('una clase siempre recibe las mismas 3 misiones (2 de clase + 1 entre clases)', () => {
        const a = getMisionesDeClase('U2', 3);
        const b = getMisionesDeClase('U2', 3);
        expect(a.map((m) => m.id)).toEqual(b.map((m) => m.id));
        expect(a.map((m) => m.tipo)).toEqual(['clase', 'clase', 'entre-clases']);
    });
});

describe('identificadores', () => {
    it('nextId no se repite aunque se llame en el mismo milisegundo', () => {
        const ids = Array.from({ length: 500 }, nextId);
        expect(new Set(ids).size).toBe(500);
    });
});

describe('estudiantes', () => {
    it('normalizeStudent repone los campos que Firebase omite', () => {
        const s = normalizeStudent({ id: 1, nombre: 'Ana', habilidades: { H2: 4 } });
        expect(s).toMatchObject({ nombreSocial: 'Ana', xp: 0, artefactos: [], badges: ['iniciado'], misionesCompletadas: {} });
        expect(s.habilidades).toEqual({ H1: 0, H2: 4, H3: 0, H4: 0, H5: 0, H6: 0 });
    });

    it('el login acepta el nombre social sin distinguir mayusculas', () => {
        const lista = [crearEstudiante(1, { nombreSocial: 'AnaP', nombreLegal: 'Ana Perez', clase: 'C1', password: 'clave' })];
        expect(findStudentByCredentials(lista, ' anap ', 'clave')).toBe(lista[0]);
        expect(findStudentByCredentials(lista, 'AnaP', 'otra')).toBe(null);
        expect(findStudentByCredentials(lista, '', 'clave')).toBe(null);
        expect(findStudentByCredentials(lista, 'Ana Perez', 'clave')).toBe(null); // el nombre legal no sirve de usuario
    });
});

describe('cursos', () => {
    it('el curso original usa las rutas historicas y los demas un espacio propio', () => {
        expect(cursoPath(CURSOS_BASE[0], 'students')).toBe('students');
        const nuevo = crearCurso({ nombre: 'IV A' });
        expect(cursoPath(nuevo, 'students')).toBe('cursos/' + nuevo.id + '/students');
        expect(nuevo.esDefault).toBe(false);
    });

    it('el curso original nunca puede faltar ni perder su marca', () => {
        const lista = normalizeCursos([{ id: 'curso-1', nombre: 'IV A', anio: '2027', esDefault: true }]);
        expect(lista.map((c) => c.id)).toEqual(['3B-2026', 'curso-1']);
        expect(lista.map((c) => c.esDefault)).toEqual([true, false]);
        expect(lista[1].anio).toBe(2027);
        expect(getCurso(lista, 'no-existe').id).toBe('3B-2026');
    });

    it('acepta la lista como objeto (asi la devuelve Firebase si hay huecos)', () => {
        expect(normalizeCursos({ 0: CURSOS_BASE[0], 2: { id: 'c2', nombre: 'X', anio: 2027 } })).toHaveLength(2);
    });
});

describe('acceso docente', () => {
    it('verifica contra la huella y no contra texto plano', async () => {
        const config = { usuario: 'profesor', passwordHash: await credentialHash('profesor', 'secreta') };
        expect(await verifyProfesor(config, 'Profesor ', 'secreta')).toBe(true);
        expect(await verifyProfesor(config, 'profesor', 'Secreta')).toBe(false);
        expect(await verifyProfesor(config, 'otro', 'secreta')).toBe(false);
    });
});
