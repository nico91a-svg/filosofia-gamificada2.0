// Catálogo de artefactos filosóficos
window.ARTEFACTOS = [
    { id: 'A1', nombre: 'Ánfora de la Sabiduría', emoji: '🏺', rareza: 'legendario', efecto: 'Duplica XP próxima actividad' },
    { id: 'A2', nombre: 'Pergamino Antiguo', emoji: '📜', rareza: 'raro', efecto: '+50 pts a habilidad' },
    { id: 'A3', nombre: 'Orbe del Conocimiento', emoji: '🔮', rareza: 'epico', efecto: 'Revela secreto filosófico' },
    { id: 'A4', nombre: 'Gema de Aristóteles', emoji: '💎', rareza: 'legendario', efecto: 'x1.5 XP por 1 semana' },
    { id: 'A5', nombre: 'Llave de Sócrates', emoji: '🗝️', rareza: 'epico', efecto: 'Badge instantáneo' },
    { id: 'A6', nombre: 'Máscara de Diógenes', emoji: '🎭', rareza: 'raro', efecto: 'Protección' },
    { id: 'A7', nombre: 'Pluma de Platón', emoji: '🪶', rareza: 'raro', efecto: '+25 XP extra en ensayo' },
    { id: 'A8', nombre: 'Brújula de Descartes', emoji: '🧭', rareza: 'epico', efecto: 'Revela pista de vocabulario' }
];

window.getRarezaColor = function(rareza) {
    var colores = {
        'raro': 'border-blue-400 bg-blue-50',
        'epico': 'border-purple-400 bg-purple-50',
        'legendario': 'border-yellow-400 bg-yellow-50'
    };
    return colores[rareza] || 'border-gray-400 bg-gray-50';
};
