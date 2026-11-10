// Sistema de niveles de XP
window.NIVELES = [
    { nivel: 1, titulo: 'Curioso Novato', xp_min: 0, xp_max: 50 },
    { nivel: 2, titulo: 'Explorador Mental', xp_min: 50, xp_max: 125 },
    { nivel: 3, titulo: 'Aprendiz de Sabiduría', xp_min: 125, xp_max: 200 },
    { nivel: 4, titulo: 'Cuestionador', xp_min: 200, xp_max: 300 },
    { nivel: 5, titulo: 'Pensador Crítico', xp_min: 300, xp_max: 400 },
    { nivel: 6, titulo: 'Argumentador', xp_min: 400, xp_max: 525 },
    { nivel: 7, titulo: 'Investigador Epistémico', xp_min: 525, xp_max: 650 },
    { nivel: 8, titulo: 'Sintetizador', xp_min: 650, xp_max: 800 },
    { nivel: 9, titulo: 'Filósofo Emergente', xp_min: 800, xp_max: 1000 },
    { nivel: 10, titulo: 'Filósofo en Formación', xp_min: 1000, xp_max: 9999 }
];

window.getNivel = function(xp) {
    return window.NIVELES.find(n => xp >= n.xp_min && xp <= n.xp_max) || window.NIVELES[0];
};
