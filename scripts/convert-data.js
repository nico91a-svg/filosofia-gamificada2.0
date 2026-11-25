// Convierte los js/data/*.js (basados en window.*) a JSON para la app RN.
// Las funciones (autoCheck, getNivel...) se descartan; se re-implementan en TS.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'filosofia-gamificada-main', 'js', 'data');
const OUT = path.join(__dirname, '..', 'filosofia-app', 'src', 'domain', 'data');

const files = [
  'niveles.js', 'habilidades.js', 'badges.js', 'artefactos.js',
  'clases-filosoficas.js', 'tipos-actividad.js', 'misiones.js', 'unidades.js',
];

const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const f of files) {
  const code = fs.readFileSync(path.join(SRC, f), 'utf8');
  vm.runInContext(code, sandbox);
}

const w = sandbox.window;

// Limpia funciones de forma recursiva (deja solo datos serializables)
function clean(value) {
  if (typeof value === 'function') return undefined;
  if (Array.isArray(value)) return value.map(clean).filter((v) => v !== undefined);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const cv = clean(v);
      if (cv !== undefined) out[k] = cv;
    }
    return out;
  }
  return value;
}

const exportsMap = {
  'niveles.json': w.NIVELES,
  'habilidades.json': w.HABILIDADES,
  'habilidad-niveles.json': w.HABILIDAD_NIVELES,
  'badges.json': w.BADGES,
  'artefactos.json': w.ARTEFACTOS,
  'cofres.json': w.COFRES,
  'clases-filosoficas.json': w.CLASES_FILOSOFICAS,
  'categorias-actividad.json': w.CATEGORIAS_ACTIVIDAD,
  'tipos-actividad.json': w.TIPOS_ACTIVIDAD,
  'rubrics-xp.json': w.RUBRICS_XP,
  'rubrics-habilidades.json': w.RUBRICS_HABILIDADES,
  'misiones.json': w.MISIONES_DB,
  'unidades.json': w.UNIDADES_DEFAULT,
};

fs.mkdirSync(OUT, { recursive: true });
for (const [file, data] of Object.entries(exportsMap)) {
  if (data === undefined) { console.warn('FALTA:', file); continue; }
  fs.writeFileSync(path.join(OUT, file), JSON.stringify(clean(data), null, 2));
  console.log('OK', file, Array.isArray(data) ? `(${data.length})` : '');
}
console.log('Conversion completa.');
