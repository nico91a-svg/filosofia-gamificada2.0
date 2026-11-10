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

export function crearEstudiante(id, data) {
    return normalizeStudent({
        id,
        nombre: data.nombreSocial || data.nombre,
        nombreSocial: data.nombreSocial || data.nombre,
        nombreLegal: data.nombreLegal || data.nombre,
        genero: data.genero || 'no-binario',
        clase: data.clase,
        password: data.password,
        xp: 0,
        badges: ['iniciado']
    });
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
