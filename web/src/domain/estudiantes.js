// Forma canonica de un estudiante. Firebase no guarda arreglos ni objetos
// vacios, asi que al leer hay que reponer los campos que falten.
export function normalizeStudent(s) {
    return {
        ...s,
        nombreSocial: s.nombreSocial || s.nombre,
        nombreLegal: s.nombreLegal || s.nombre,
        genero: s.genero || 'no-binario',
        xp: s.xp || 0,
        vocabularioDescubierto: s.vocabularioDescubierto || [],
        artefactos: s.artefactos || s.inventarioArtefactos || [],
        misionesCompletadas: s.misionesCompletadas || {},
        badges: s.badges || ['iniciado'],
        habilidades: { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0, ...(s.habilidades || {}) }
    };
}

// `data.password` solo llega del backend 'local' (ver AddStudentModal); contra
// 'firebase' no se recibe, y aqui se omite la clave por completo del registro
// en vez de guardarla vacia (Firebase rechaza escribir `undefined`).
//
// El nombre legal NO viaja en el registro que devuelve esta funcion: vive
// aparte, en `students_privado` (ver useCourseData.js / database.rules.json),
// porque es lo unico que distingue a quien lee cualquier estudiante del
// mismo curso de quien no deberia ver nombres legales. Quien llama a
// crearEstudiante es responsable de guardar `data.nombreLegal` ahi.
export function crearEstudiante(id, data) {
    const estudiante = normalizeStudent({
        id,
        nombre: data.nombreSocial || data.nombre,
        nombreSocial: data.nombreSocial || data.nombre,
        genero: data.genero || 'no-binario',
        clase: data.clase,
        ...(data.password ? { password: data.password } : {}),
        xp: 0,
        badges: ['iniciado']
    });
    delete estudiante.nombreLegal;
    return estudiante;
}

// Busca al estudiante que coincide con las credenciales del login.
export function findStudentByCredentials(students, username, password) {
    const wanted = String(username || '').trim().toLowerCase();
    if (!wanted) return null;
    return students.find((s) => {
        const names = [s.nombreSocial, s.nombre].filter(Boolean).map((n) => String(n).toLowerCase());
        return names.includes(wanted) && s.password === password;
    }) || null;
}
