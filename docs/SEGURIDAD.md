# Seguridad y datos personales

## Estado actual

| Tema | Estado |
|---|---|
| Nómina con nombres legales y claves dentro del sitio publicado | **Resuelto**: ya no se publica (`datos-privados/`). |
| Clave docente legible en el código del sitio | **Mitigado**: se compara por huella SHA-256. |
| Un dispositivo desactualizado pisa datos de otros | **Resuelto**: se escribe por campo. |
| Base de datos abierta a cualquiera | **Pendiente** (ver abajo). |
| Claves de estudiantes guardadas en texto en la base de datos | **Pendiente** (se resuelve con lo mismo). |

## Lo pendiente, en claro

La base de datos acepta lecturas y escrituras sin identificar a nadie. La
configuración de Firebase que viaja en el sitio es pública por diseño, así que
alguien con conocimientos técnicos podría leer los datos del curso (incluidas
las claves de estudiantes) o modificar puntajes sin pasar por la aplicación.
Las verificaciones de clave de la app ordenan el uso normal; no detienen a
quien se salte la interfaz.

La solución es **Firebase Authentication + reglas de la base de datos**:

1. Activar Authentication (correo y contraseña) en la consola de Firebase.
2. Crear una cuenta para el docente y una por estudiante.
3. Reglas: cada estudiante lee el curso y escribe solo su inventario; el docente
   escribe todo; nadie anónimo lee ni escribe.
4. Quitar las claves de la base de datos.

Los pasos 1 y 2 requieren entrar a la consola con la cuenta dueña del proyecto.
El paso 3 cambia quién puede escribir, así que debe probarse primero con
`VITE_DB_NAMESPACE=sandbox` (ver `docs/DEPLOY.md`).

## Recomendaciones inmediatas

- **Cambiar la clave docente.** La anterior estuvo escrita en versiones
  antiguas del código y sigue en el historial de git.
  `npm run hash-password -- profesor "clave nueva"` (ver `docs/DEPLOY.md`).
- **Mantener este repositorio privado** mientras contenga `datos-privados/` o
  su historial.
- **Exportar un respaldo** (panel docente → Exportar) antes de publicar una
  versión nueva.
