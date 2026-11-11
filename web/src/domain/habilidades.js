// 6 Habilidades Filosóficas + rúbricas de XP por actividad
export const HABILIDADES = [
    { id: 'H1', nombre: 'Análisis', shortName: 'Análisis', emoji: '🔍', color: '#3B82F6',
      descripcion: 'Capacidad de descomponer ideas complejas, clarificar conceptos y distinguir entre diferentes significados.',
      comoMejora: 'Análisis de textos, glosarios conceptuales, mapas conceptuales, definición de términos' },
    { id: 'H2', nombre: 'Crítico', shortName: 'Crítico', emoji: '💭', color: '#8B5CF6',
      descripcion: 'Capacidad de cuestionar supuestos, identificar sesgos, detectar falacias y evaluar la solidez de argumentos.',
      comoMejora: 'Debates, análisis de argumentos falaces, evaluación de fuentes, ejercicios de detección de sesgos' },
    { id: 'H3', nombre: 'Argumentación', shortName: 'Argumentación', emoji: '⚖️', color: '#EC4899',
      descripcion: 'Capacidad de construir argumentos válidos, defender posiciones con evidencia y responder a objeciones.',
      comoMejora: 'Escritura de ensayos, debates filosóficos, diálogos socráticos, construcción de silogismos' },
    { id: 'H4', nombre: 'Síntesis', shortName: 'Síntesis', emoji: '🔗', color: '#10B981',
      descripcion: 'Capacidad de integrar diferentes perspectivas, encontrar puntos comunes y construir visiones comprehensivas.',
      comoMejora: 'Cuadros comparativos, mapas de relaciones, ensayos integrativos, proyectos de síntesis' },
    { id: 'H5', nombre: 'Creatividad', shortName: 'Creatividad', emoji: '💡', color: '#F59E0B',
      descripcion: 'Capacidad de generar nuevas preguntas, proponer soluciones originales y pensar "fuera de la caja".',
      comoMejora: 'Experimentos mentales, creación de dilemas, proyectos artísticos filosóficos, café filosófico' },
    { id: 'H6', nombre: 'Reflexión', shortName: 'Reflexión', emoji: '🪞', color: '#6366F1',
      descripcion: 'Capacidad de pensar sobre el propio pensamiento, monitorear el aprendizaje y aplicar estrategias de mejora.',
      comoMejora: 'Diarios de pensamiento, autoevaluaciones, portafolios reflexivos, bitácoras filosóficas' }
];

export const HABILIDAD_NIVELES = [
    { nivel: 1, nombre: 'Aprendiz', min: 0, max: 9 },
    { nivel: 2, nombre: 'Competente', min: 10, max: 29 },
    { nivel: 3, nombre: 'Experto', min: 30, max: 59 },
    { nivel: 4, nombre: 'Maestro', min: 60, max: 99 },
    { nivel: 5, nombre: 'Filósofo', min: 100, max: 9999 }
];

export const getHabilidadNivel = function(puntos) {
    if (puntos >= 100) return 5;
    if (puntos >= 60) return 4;
    if (puntos >= 30) return 3;
    if (puntos >= 10) return 2;
    return 1;
};
