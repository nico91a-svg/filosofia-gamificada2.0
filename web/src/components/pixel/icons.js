// Iconos de habilidades (H1–H6) y categorías de actividad. Antes eran sprites
// 16x16; ahora son iconos de Phosphor con el color propio de cada habilidad.
import {
    MagnifyingGlass, Chats, Scales, LinkSimple, Lightbulb, Aperture,
    CalendarCheck, PencilLine, Exam
} from '@phosphor-icons/react';

// Colores alineados con src/domain/habilidades.js.
const SKILLS = {
    H1: { Icon: MagnifyingGlass, color: '#3B82F6' }, // Análisis
    H2: { Icon: Chats, color: '#8B5CF6' },           // Crítico
    H3: { Icon: Scales, color: '#EC4899' },          // Argumentación
    H4: { Icon: LinkSimple, color: '#10B981' },      // Síntesis
    H5: { Icon: Lightbulb, color: '#F59E0B' },       // Creatividad
    H6: { Icon: Aperture, color: '#6366F1' }         // Reflexión
};

const CATEGORIAS = {
    cotidiana: { Icon: CalendarCheck, color: '#6D5AE6' },
    proceso: { Icon: PencilLine, color: '#2FA36B' },
    evaluacion: { Icon: Exam, color: '#E05260' }
};

export function skillIcon(id) {
    return SKILLS[id] || null;
}

export function catIcon(id) {
    return CATEGORIAS[id] || null;
}
