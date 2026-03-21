// Catalogo de artefactos filosoficos
window.ARTEFACTOS = [
    // --- COMUNES (8) ---
    { id: 'A1', nombre: 'Cuaderno de Notas', emoji: '📓', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A2', nombre: 'Vela del Estudio', emoji: '🕯️', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A3', nombre: 'Reloj de Arena', emoji: '⏳', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A4', nombre: 'Tintero Antiguo', emoji: '🪶', rareza: 'comun', efecto: '+10 XP extra proxima actividad', esDecorativo: false },
    { id: 'A5', nombre: 'Moneda del Agora', emoji: '🪙', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A6', nombre: 'Mapa de Atenas', emoji: '🗺️', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A7', nombre: 'Piedra de Sisifo', emoji: '🪨', rareza: 'comun', efecto: 'Decorativo', esDecorativo: true },
    { id: 'A8', nombre: 'Copa de Socrates', emoji: '🏆', rareza: 'comun', efecto: '+10 XP extra proxima actividad', esDecorativo: false },
    // --- RAROS (5) ---
    { id: 'A9', nombre: 'Pergamino Antiguo', emoji: '📜', rareza: 'raro', efecto: '+50 pts a una habilidad', esDecorativo: false },
    { id: 'A10', nombre: 'Mascara de Diogenes', emoji: '🎭', rareza: 'raro', efecto: 'Proteccion: anula 0 XP por limite diario', esDecorativo: false },
    { id: 'A11', nombre: 'Pluma de Platon', emoji: '✒️', rareza: 'raro', efecto: '+25 XP extra en ensayo', esDecorativo: false },
    { id: 'A12', nombre: 'Libro de Tales', emoji: '📕', rareza: 'raro', efecto: 'Revela 1 termino de vocabulario', esDecorativo: false },
    { id: 'A13', nombre: 'Balanza de Justicia', emoji: '⚖️', rareza: 'raro', efecto: '+30 XP extra proxima actividad', esDecorativo: false },
    // --- EPICOS (4) ---
    { id: 'A14', nombre: 'Orbe del Conocimiento', emoji: '🔮', rareza: 'epico', efecto: 'Revela 3 terminos de vocabulario', esDecorativo: false },
    { id: 'A15', nombre: 'Brujula de Descartes', emoji: '🧭', rareza: 'epico', efecto: 'x1.3 XP por 1 semana', esDecorativo: false },
    { id: 'A16', nombre: 'Llave de Socrates', emoji: '🗝️', rareza: 'epico', efecto: 'Otorga un badge al azar', esDecorativo: false },
    { id: 'A17', nombre: 'Espejo de Aristoteles', emoji: '🪞', rareza: 'epico', efecto: '+100 XP directos', esDecorativo: false },
    // --- LEGENDARIOS (3) ---
    { id: 'A18', nombre: 'Anfora de la Sabiduria', emoji: '🏺', rareza: 'legendario', efecto: 'Duplica XP proxima actividad', esDecorativo: false },
    { id: 'A19', nombre: 'Gema de Aristoteles', emoji: '💎', rareza: 'legendario', efecto: 'x1.5 XP por 1 semana', esDecorativo: false },
    { id: 'A20', nombre: 'Corona del Filosofo', emoji: '👑', rareza: 'legendario', efecto: 'Otorga un cofre de oro extra', esDecorativo: false }
];

window.getRarezaColor = function(rareza) {
    var colores = {
        'comun': 'border-gray-400 bg-gray-50',
        'raro': 'border-blue-400 bg-blue-50',
        'epico': 'border-purple-400 bg-purple-50',
        'legendario': 'border-yellow-400 bg-yellow-50'
    };
    return colores[rareza] || 'border-gray-400 bg-gray-50';
};

// --- SISTEMA DE COFRES ---
window.COFRES = {
    bronce: { nombre: 'Cofre de Bronce', emoji: '🥉', probabilidades: { comun: 70, raro: 22, epico: 7, legendario: 1 } },
    plata:  { nombre: 'Cofre de Plata',  emoji: '🥈', probabilidades: { comun: 50, raro: 30, epico: 15, legendario: 5 } },
    oro:    { nombre: 'Cofre de Oro',     emoji: '🥇', probabilidades: { comun: 30, raro: 35, epico: 25, legendario: 10 } }
};

// Determinar tipo de cofre segun categoria y nivel de la actividad
// - cotidiana: no da cofre
// - proceso: da cofre bronce
// - evaluacion: da cofre plata (basico/competente) u oro (avanzado/excepcional)
window.getCofre = function(tipo, nivel) {
    var tipoObj = (window.TIPOS_ACTIVIDAD || []).find(function(t) { return t.id === tipo; });
    var cat = tipoObj ? tipoObj.categoria : 'cotidiana';
    if (cat === 'cotidiana') return null;
    if (cat === 'proceso') return 'bronce';
    if (cat === 'evaluacion') {
        if (nivel === 'avanzado' || nivel === 'excepcional') return 'oro';
        return 'plata';
    }
    return null;
};

// Sortear artefacto de un cofre
window.abrirCofre = function(tipoCofre) {
    var cofre = window.COFRES[tipoCofre];
    if (!cofre) return null;
    var prob = cofre.probabilidades;
    var roll = Math.random() * 100;
    var rareza;
    if (roll < prob.legendario) rareza = 'legendario';
    else if (roll < prob.legendario + prob.epico) rareza = 'epico';
    else if (roll < prob.legendario + prob.epico + prob.raro) rareza = 'raro';
    else rareza = 'comun';
    var candidatos = window.ARTEFACTOS.filter(function(a) { return a.rareza === rareza; });
    return candidatos[Math.floor(Math.random() * candidatos.length)];
};
