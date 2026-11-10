// Tipos de actividad con rúbricas de XP, habilidades asociadas y categoria
// Categorias: 'cotidiana' (no da cofre), 'proceso' (da cofre bronce), 'evaluacion' (da cofre plata/oro)
window.CATEGORIAS_ACTIVIDAD = [
    { id: 'cotidiana', nombre: 'Cotidiana', emoji: '📌', descripcion: 'Actividades diarias sin cofre' },
    { id: 'proceso', nombre: 'Proceso', emoji: '📂', descripcion: 'Actividades de proceso (dan cofre bronce)' },
    { id: 'evaluacion', nombre: 'Evaluación', emoji: '📝', descripcion: 'Evaluaciones con nota (dan cofre plata/oro)' }
];

window.TIPOS_ACTIVIDAD = [
    // --- COTIDIANAS ---
    { id: 'participacion', nombre: 'Participación en Clase', icon: '💬', categoria: 'cotidiana' },
    { id: 'reflexion', nombre: 'Reflexión Escrita', icon: '💡', categoria: 'cotidiana' },
    { id: 'kahoot', nombre: 'Mini-juego (Kahoot)', icon: '🎮', categoria: 'cotidiana' },
    // --- PROCESO ---
    { id: 'lectura', nombre: 'Lectura Reflexiva', icon: '📖', categoria: 'proceso' },
    { id: 'rutina', nombre: 'Rutina de Pensamiento', icon: '🧩', categoria: 'proceso' },
    { id: 'debate', nombre: 'Debate Filosófico', icon: '🗣️', categoria: 'proceso' },
    { id: 'experimento', nombre: 'Experimento Mental', icon: '🧠', categoria: 'proceso' },
    { id: 'mapa', nombre: 'Mapa Conceptual', icon: '🗺️', categoria: 'proceso' },
    { id: 'dialogo', nombre: 'Diálogo Socrático', icon: '💭', categoria: 'proceso' },
    { id: 'bitacora', nombre: 'Bitácora Filosófica', icon: '📓', categoria: 'proceso' },
    { id: 'control', nombre: 'Control de Lectura', icon: '📋', categoria: 'proceso' },
    { id: 'investigacion', nombre: 'Investigación', icon: '🔬', categoria: 'proceso' },
    // --- EVALUACIONES ---
    { id: 'ensayo', nombre: 'Ensayo Corto', icon: '✍️', categoria: 'evaluacion' },
    { id: 'ensayo_largo', nombre: 'Ensayo Argumentativo', icon: '📄', categoria: 'evaluacion' },
    { id: 'presentacion', nombre: 'Presentación Oral', icon: '🎤', categoria: 'evaluacion' },
    { id: 'evaluacion_sumativa', nombre: 'Evaluación Sumativa', icon: '📝', categoria: 'evaluacion' },
    { id: 'proyecto', nombre: 'Proyecto Filosófico', icon: '🚀', categoria: 'evaluacion' }
];

// XP por tipo de actividad y nivel de desempeño
window.RUBRICS_XP = {
    participacion: { basico: 5, competente: 10, avanzado: 15, excepcional: 20 },
    reflexion: { basico: 10, competente: 20, avanzado: 30, excepcional: 40 },
    kahoot: { basico: 15, competente: 25, avanzado: 35, excepcional: 45 },
    lectura: { basico: 15, competente: 25, avanzado: 35, excepcional: 45 },
    rutina: { basico: 15, competente: 25, avanzado: 40, excepcional: 55 },
    debate: { basico: 25, competente: 40, avanzado: 60, excepcional: 75 },
    experimento: { basico: 20, competente: 35, avanzado: 50, excepcional: 65 },
    mapa: { basico: 25, competente: 40, avanzado: 55, excepcional: 70 },
    dialogo: { basico: 30, competente: 50, avanzado: 70, excepcional: 90 },
    bitacora: { basico: 20, competente: 30, avanzado: 40, excepcional: 50 },
    control: { basico: 20, competente: 35, avanzado: 50, excepcional: 65 },
    investigacion: { basico: 40, competente: 60, avanzado: 80, excepcional: 100 },
    ensayo: { basico: 40, competente: 60, avanzado: 80, excepcional: 100 },
    ensayo_largo: { basico: 50, competente: 75, avanzado: 100, excepcional: 130 },
    presentacion: { basico: 35, competente: 55, avanzado: 75, excepcional: 95 },
    evaluacion_sumativa: { basico: 40, competente: 60, avanzado: 85, excepcional: 110 },
    proyecto: { basico: 50, competente: 75, avanzado: 100, excepcional: 130 }
};

// Habilidades que mejora cada tipo de actividad
window.RUBRICS_HABILIDADES = {
    participacion: { H1: 1, H2: 1 },
    reflexion: { H6: 3, H1: 1 },
    kahoot: { H1: 2, H2: 1 },
    lectura: { H1: 2, H6: 1 },
    rutina: { H5: 2, H1: 2, H6: 1 },
    debate: { H3: 3, H2: 2, H4: 1 },
    experimento: { H5: 3, H2: 2 },
    mapa: { H4: 3, H1: 2 },
    dialogo: { H3: 3, H2: 2, H6: 1 },
    bitacora: { H6: 3, H5: 2 },
    control: { H1: 2, H4: 1 },
    investigacion: { H1: 3, H4: 2, H6: 2 },
    ensayo: { H1: 3, H3: 3, H4: 2 },
    ensayo_largo: { H1: 3, H3: 3, H4: 3, H6: 2 },
    presentacion: { H3: 3, H5: 2, H4: 1 },
    evaluacion_sumativa: { H1: 2, H3: 2, H4: 2 },
    proyecto: { H1: 2, H3: 2, H4: 3, H5: 3, H6: 2 }
};
