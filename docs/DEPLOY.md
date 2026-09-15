# Deploy y personalizacion multi-curso

## Vision general

La app se compone de:

- `filosofia-gamificada-main/` — codigo web (HTML + JS + JSX transpilado en el navegador).
- `firebase.json` + `.firebaserc` — configuracion de Firebase Hosting.
- Firebase Realtime Database ya en uso para persistir progreso.

La misma app puede correr para **multiples cursos** (una "edicion del juego"
por curso) sin duplicar codigo. Cada curso vive bajo su propio namespace en
Firebase y comparte todo lo demas (unidades, niveles, artefactos, etc.).

## Anadir un curso nuevo

Todo se hace en dos archivos:

### 1. Registrar el curso

Edita `filosofia-gamificada-main/js/data/cursos.js` y agrega una entrada:

```js
window.CURSOS = [
    { id: '3B-2026', /* ...existente... */ },
    {
        id: '4A-2027',
        nombre: 'IV Medio A',
        anio: 2027,
        colegio: '',
        emoji: '🎓',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        accent: 'emerald',
        activo: true,
        esDefault: false,               // solo el curso legacy es esDefault:true
        defaultStudentsKey: 'DEFAULT_STUDENTS_4A_2027'  // opcional
    }
];
```

Al recargar, el nuevo curso aparece en el selector del login. Todo su
progreso (estudiantes, actividades, unidades, posicion) se guarda en Firebase
bajo `cursos/4A-2027/...`.

### 2. (Opcional) Sembrar la lista de estudiantes

Si quieres que el curso arranque con una lista predefinida, crea
`filosofia-gamificada-main/js/data/estudiantes-4A-2027.js`:

```js
window.DEFAULT_STUDENTS_4A_2027 = [
    { id: 1, nombre: 'AlumnoA', nombreSocial: 'AlumnoA', nombreLegal: 'Nombre Completo',
      genero: 'no-binario', clase: 'IV-A', password: 'AlumnoA2027', xp: 0,
      habilidades: { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0 },
      badges: ['iniciado'], vocabularioDescubierto: [], artefactos: [] }
    // ...
];
```

Y agrega la linea en `index.html` justo despues de `estudiantes-3B.js`:

```html
<script src="js/data/estudiantes-4A-2027.js"></script>
```

La primera vez que alguien entre al curso, si Firebase esta vacio para ese
curso, se subiran automaticamente esos estudiantes.

Tambien podes usar **Registro Masivo** dentro del dashboard del profesor
para agregarlos a mano una vez creado el curso.

## Deploy a Firebase Hosting

Con esto la web queda accesible por URL publica, gratis, sobre HTTPS, y
funciona como PWA instalable (icono en el celular).

### Requisitos (una vez)

```bash
npm install -g firebase-tools
firebase login
```

### Deploy

Desde la raiz del repo:

```bash
firebase deploy --only hosting
```

Firebase publica en `https://filosofia-gamificada.web.app` (o el dominio de
tu proyecto). Cada `deploy` sube la ultima version del sitio.

### Comprobar localmente antes de subir

```bash
firebase serve --only hosting
# abre http://localhost:5000
```

## Reglas de Realtime Database recomendadas

Actualmente hay lectura/escritura publica (para clase). Cuando quieras
proteger, en la consola de Firebase → Realtime Database → Reglas:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Es la config permisiva actual. Para produccion real conviene autenticar
con Firebase Auth y restringir escritura por rol.

## Estructura de datos en Firebase

- Curso legacy `3B-2026`: usa paths planos `students`, `activities`,
  `unidades`, `position` (retrocompatibilidad).
- Cursos nuevos: `cursos/{id}/students`, `cursos/{id}/activities`,
  `cursos/{id}/unidades`, `cursos/{id}/position`.
