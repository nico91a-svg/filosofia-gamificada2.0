import { describe, expect, it } from 'vitest';
import { promedioHabilidades } from '../src/components/shared/RadarChart.jsx';

const HABS = [{ id: 'H1' }, { id: 'H2' }, { id: 'H3' }];

describe('promedioHabilidades', () => {
    it('sin estudiantes devuelve ceros', () => {
        expect(promedioHabilidades([], HABS)).toEqual({ H1: 0, H2: 0, H3: 0 });
    });

    it('promedia por habilidad y redondea', () => {
        const students = [
            { habilidades: { H1: 10, H2: 0, H3: 30 } },
            { habilidades: { H1: 20, H2: 10, H3: 30 } },
            { habilidades: { H1: 30, H2: 11, H3: 0 } }
        ];
        // H1: (10+20+30)/3 = 20 ; H2: (0+10+11)/3 = 7 ; H3: (30+30+0)/3 = 20
        expect(promedioHabilidades(students, HABS)).toEqual({ H1: 20, H2: 7, H3: 20 });
    });

    it('trata como 0 las habilidades ausentes y descarta entradas nulas', () => {
        // null se descarta -> promedia sobre 2 estudiantes: H1 = (40+0)/2 = 20.
        const students = [{ habilidades: { H1: 40 } }, null, { xp: 5 }];
        expect(promedioHabilidades(students, HABS)).toEqual({ H1: 20, H2: 0, H3: 0 });
    });
});
