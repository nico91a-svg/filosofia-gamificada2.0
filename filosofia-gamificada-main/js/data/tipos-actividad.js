// Tipos de actividad con rúbricas de XP y habilidades asociadas
window.TIPOS_ACTIVIDAD = [
    { id: 'participacion', nombre: 'Participación en Clase', icon: '💬' },
    { id: 'lectura', nombre: 'Lectura Reflexiva', icon: '📖' },
    { id: 'debate', nombre: 'Debate Filosófico', icon: '🗣️' },
    { id: 'ensayo', nombre: 'Ensayo Corto', icon: '✍️' },
    { id: 'experimento', nombre: 'Experimento Mental', icon: '🧠' },
    { id: 'mapa', nombre: 'Mapa Conceptual', icon: '🗺️' },
    { id: 'dialogo', nombre: 'Diálogo Socrático', icon: '💭' },
    { id: 'kahoot', nombre: 'Mini-juego (Kahoot)', icon: '🎮' },
    { id: 'bitacora', nombre: 'Bitácora Filosófica', icon: '📓' },
    { id: 'presentacion', nombre: 'Presentación Oral', icon: '🎤' },
    { id: 'investigacion', nombre: 'Investigación', icon: '🔬' },
    { id: 'proyecto', nombre: 'Proyecto ABP', icon: '🚀' }
];

// XP por tipo de actividad y nivel de desempeño
window.RUBRICS_XP = {
    participacion: { basico: 5, competente: 10, avanzado: 15, excepcional: 20 },
    lectura: { basico: 15, competente: 25, avanzado: 35, excepcional: 45 },
    debate: { basico: 25, competente: 40, avanzado: 60, excepcional: 75 },
    ensayo: { basico: 40, competente: 60, avanzado: 80, excepcional: 100 },
    experimento: { basico: 20, competente: 35, avanzado: 50, excepcional: 65 },
    mapa: { basico: 25, competente: 40, avanzado: 55, excepcional: 70 },
    dialogo: { basico: 30, competente: 50, avanzado: 70, excepcional: 90 },
    kahoot: { basico: 15, competente: 25, avanzado: 35, excepcional: 45 },
    bitacora: { basico: 20, competente: 30, avanzado: 40, excepcional: 50 },
    presentacion: { basico: 35, competente: 55, avanzado: 75, excepcional: 95 },
    investigacion: { basico: 40, competente: 60, avanzado: 80, excepcional: 100 },
    proyecto: { basico: 50, competente: 75, avanzado: 100, excepcional: 130 }
};

// Habilidades que mejora cada tipo de actividad
window.RUBRICS_HABILIDADES = {
    participacion: { H1: 1, H2: 1 },
    lectura: { H1: 2, H6: 1 },
    debate: { H3: 3, H2: 2, H4: 1 },
    ensayo: { H1: 3, H3: 3, H4: 2 },
    experimento: { H5: 3, H2: 2 },
    mapa: { H4: 3, H1: 2 },
    dialogo: { H3: 3, H2: 2, H6: 1 },
    kahoot: { H1: 2, H2: 1 },
    bitacora: { H6: 3, H5: 2 },
    presentacion: { H3: 3, H5: 2, H4: 1 },
    investigacion: { H1: 3, H4: 2, H6: 2 },
    proyecto: { H1: 2, H3: 2, H4: 3, H5: 3, H6: 2 }
};
