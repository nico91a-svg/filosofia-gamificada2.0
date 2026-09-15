// Registro de cursos (ediciones del juego).
//
// Cada entrada aqui define una edicion independiente de Filosofo en Formacion.
// - id: identificador estable, se usa como namespace en Firebase.
// - esDefault: TRUE solo para el curso legacy (III-B 2026), que sigue leyendo
//   y escribiendo en los paths antiguos (`students`, `activities`, ...) para
//   no romper los datos ya existentes. Todos los cursos nuevos se guardan
//   automaticamente bajo `cursos/{id}/...`.
// - defaultStudents: lista opcional de estudiantes precargados (semilla). Si
//   Firebase esta vacio para ese curso, se sube esta lista la primera vez.
//
// Para crear una edicion nueva para otro curso:
//   1) Agregar un objeto a window.CURSOS con id unico (ej: '4A-2027').
//   2) Opcional: crear un archivo `estudiantes-{id}.js` que exponga
//      window['DEFAULT_STUDENTS_' + id] = [ ... ] y cargarlo en index.html.
//   3) El curso aparece automaticamente en la pantalla de login.
window.CURSOS = [
    {
        id: '3B-2026',
        nombre: 'III Medio B',
        anio: 2026,
        colegio: '',
        emoji: '🏛️',
        gradient: 'from-indigo-500 via-violet-500 to-fuchsia-500',
        accent: 'indigo',
        activo: true,
        esDefault: true,
        // El seed se toma de window.DEFAULT_STUDENTS_3B (cargado desde estudiantes-3B.js)
        defaultStudentsKey: 'DEFAULT_STUDENTS_3B'
    }
];

// Devuelve el objeto curso por id (o el primero como fallback).
window.getCurso = function(cursoId) {
    if (!cursoId) return window.CURSOS[0];
    return window.CURSOS.find(function(c) { return c.id === cursoId; }) || window.CURSOS[0];
};

// Traduce un recurso logico (students, activities, unidades, position) al path
// real de Firebase segun el curso. El curso legacy mantiene los paths antiguos.
window.getCursoPath = function(cursoId, resource) {
    var curso = window.getCurso(cursoId);
    if (curso.esDefault) return resource;
    return 'cursos/' + curso.id + '/' + resource;
};

// Recupera el seed de estudiantes definido para el curso, si existe.
window.getCursoDefaultStudents = function(cursoId) {
    var curso = window.getCurso(cursoId);
    var key = curso.defaultStudentsKey;
    if (key && Array.isArray(window[key])) return window[key];
    return [];
};

// Persiste la seleccion del curso en localStorage para recordarla entre sesiones.
window.saveCursoSelection = function(cursoId) {
    try { localStorage.setItem('filosofo_curso_actual', cursoId); } catch (e) { /* ignore */ }
};

window.loadCursoSelection = function() {
    try {
        var saved = localStorage.getItem('filosofo_curso_actual');
        if (saved && window.CURSOS.some(function(c) { return c.id === saved; })) return saved;
    } catch (e) { /* ignore */ }
    return null;
};
