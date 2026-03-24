// Base de datos de misiones
// Tipos: 'clase' (se cumplen durante la sesion), 'entre-clases' (tarea para la proxima semana)
// Verificacion: 'auto' (el sistema detecta), 'manual' (el profesor marca)

window.MISIONES_DB = [
    // ---- MISIONES DE CLASE (se cumplen durante la sesion) ----
    {
        id: 'M01',
        nombre: 'Voz Filosofica',
        descripcion: 'Participa al menos 1 vez en la clase de hoy',
        tipo: 'clase',
        emoji: '🗣️',
        recompensa: { xp: 10 },
        verificacion: 'auto',
        autoCheck: function(studentId, activities, claseNum, unidadId) {
            return activities.some(function(a) {
                return a.studentId === studentId &&
                    a.tipo === 'participacion' &&
                    a.claseNum === claseNum &&
                    a.unidadId === unidadId;
            });
        }
    },
    {
        id: 'M02',
        nombre: 'Excelencia Filosofica',
        descripcion: 'Logra nivel "avanzado" o "excepcional" en alguna actividad de hoy',
        tipo: 'clase',
        emoji: '🌟',
        recompensa: { xp: 15 },
        verificacion: 'auto',
        autoCheck: function(studentId, activities, claseNum, unidadId) {
            return activities.some(function(a) {
                return a.studentId === studentId &&
                    a.claseNum === claseNum &&
                    a.unidadId === unidadId &&
                    (a.nivel === 'avanzado' || a.nivel === 'excepcional');
            });
        }
    },
    {
        id: 'M03',
        nombre: 'Cazador de Palabras',
        descripcion: 'Descubre al menos 1 nuevo termino de vocabulario',
        tipo: 'clase',
        emoji: '📖',
        recompensa: { xp: 10 },
        verificacion: 'auto',
        autoCheck: function(studentId, activities, claseNum, unidadId, student) {
            var vocab = student.vocabularioDescubierto || [];
            return vocab.length > 0;
        }
    },
    {
        id: 'M04',
        nombre: 'Debatiente Activo',
        descripcion: 'Participa en un debate o dialogo filosofico grupal',
        tipo: 'clase',
        emoji: '⚔️',
        recompensa: { xp: 15 },
        verificacion: 'auto',
        autoCheck: function(studentId, activities, claseNum, unidadId) {
            return activities.some(function(a) {
                return a.studentId === studentId &&
                    a.claseNum === claseNum &&
                    a.unidadId === unidadId &&
                    (a.tipo === 'debate' || a.tipo === 'dialogo');
            });
        }
    },
    {
        id: 'M05',
        nombre: 'Doble Esfuerzo',
        descripcion: 'Completa 2 actividades distintas en la clase de hoy',
        tipo: 'clase',
        emoji: '💪',
        recompensa: { xp: 15 },
        verificacion: 'auto',
        autoCheck: function(studentId, activities, claseNum, unidadId) {
            var tipos = {};
            activities.forEach(function(a) {
                if (a.studentId === studentId && a.claseNum === claseNum && a.unidadId === unidadId) {
                    tipos[a.tipo] = true;
                }
            });
            return Object.keys(tipos).length >= 2;
        }
    },
    // ---- MISIONES ENTRE CLASES (tarea para la proxima semana) ----
    {
        id: 'M06',
        nombre: 'Pensador Autonomo',
        descripcion: 'Trae una reflexion escrita sobre el tema de la clase anterior',
        tipo: 'entre-clases',
        emoji: '✍️',
        recompensa: { xp: 20 },
        verificacion: 'manual'
    },
    {
        id: 'M07',
        nombre: 'Conexion con lo Real',
        descripcion: 'Encuentra un ejemplo de la vida cotidiana relacionado con el tema visto',
        tipo: 'entre-clases',
        emoji: '🔗',
        recompensa: { xp: 15 },
        verificacion: 'manual'
    },
    {
        id: 'M08',
        nombre: 'Filosofo Investigador',
        descripcion: 'Investiga un filosofo mencionado en clase y comparte un dato nuevo',
        tipo: 'entre-clases',
        emoji: '🔍',
        recompensa: { xp: 20 },
        verificacion: 'manual'
    },
    {
        id: 'M09',
        nombre: 'Pregunta Profunda',
        descripcion: 'Formula una pregunta filosofica original sobre el tema visto',
        tipo: 'entre-clases',
        emoji: '❓',
        recompensa: { xp: 15 },
        verificacion: 'manual'
    },
    {
        id: 'M10',
        nombre: 'Embajador Filosofico',
        descripcion: 'Explica a alguien fuera de clase un concepto filosofico aprendido y cuenta la experiencia',
        tipo: 'entre-clases',
        emoji: '🌍',
        recompensa: { xp: 20 },
        verificacion: 'manual'
    }
];

// Seleccionar misiones aleatorias para una clase
// Devuelve 3 misiones: 2 de clase + 1 entre-clases
// Usa la combinacion unidadId+claseNum como semilla para que sean consistentes
window.getMisionesDeClase = function(unidadId, claseNum) {
    var seed = 0;
    for (var i = 0; i < unidadId.length; i++) {
        seed += unidadId.charCodeAt(i);
    }
    seed = seed * 100 + claseNum;

    // Pseudo-random con semilla (consistente para misma clase)
    function seededRandom(s) {
        var x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    }

    var misionesClase = window.MISIONES_DB.filter(function(m) { return m.tipo === 'clase'; });
    var misionesEntre = window.MISIONES_DB.filter(function(m) { return m.tipo === 'entre-clases'; });

    // Barajar con semilla
    function shuffle(arr, s) {
        var result = arr.slice();
        for (var i = result.length - 1; i > 0; i--) {
            var j = Math.floor(seededRandom(s + i) * (i + 1));
            var temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }
        return result;
    }

    var shuffledClase = shuffle(misionesClase, seed);
    var shuffledEntre = shuffle(misionesEntre, seed + 50);

    return shuffledClase.slice(0, 2).concat(shuffledEntre.slice(0, 1));
};
