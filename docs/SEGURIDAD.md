# Seguridad y datos personales

## Estado actual

GitHub Pages publica **todo** lo que hay en la rama `main`, no solo la app. Por
eso ningún archivo con datos personales debe vivir en el repositorio.

| Tema | Estado |
|---|---|
| Nómina con nombres legales y claves, descargable desde el sitio | **Retirada** del sitio al mergear. Sigue en el historial de git (ver abajo). |
| Clave docente legible en el código | **Mitigado en la app nueva** (huella SHA-256). La app anterior aún la trae en texto. |
| Un dispositivo desactualizado pisa datos de otros | **Resuelto en la app nueva** (se escribe por campo). |
| Base de datos abierta a cualquiera | **Pendiente** (ver abajo). |
| Claves y nombres legales de estudiantes legibles en la base de datos | **Pendiente** (se resuelve con lo mismo). |

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

- **Cambiar la clave docente** una vez hecho el paso a la app nueva. La actual
  está escrita en la app anterior y en el historial de git.
- **Historial de git.** La nómina se retiró de la versión actual, pero las
  versiones antiguas del repositorio la conservan. Si el repositorio es público,
  lo más simple es crear uno nuevo solo con la versión actual y dejar este
  privado o eliminarlo. Es una decisión del dueño del repositorio.
- **Exportar un respaldo** (panel docente → Exportar) antes del paso a la app
  nueva y de forma periódica.
- No subir al repositorio listas de curso, respaldos exportados ni planillas
  con datos de estudiantes.
