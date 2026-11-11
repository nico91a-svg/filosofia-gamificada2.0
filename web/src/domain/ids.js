// Identificadores numericos unicos dentro de la sesion. Date.now() a secas se
// repite cuando se crean varios registros en el mismo milisegundo (registro
// masivo), y dos actividades con el mismo id no se pueden distinguir.
let last = 0;

export function nextId() {
    last = Math.max(Date.now(), last + 1);
    return last;
}
