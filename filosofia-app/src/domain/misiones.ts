// Verificación de misiones de clase — autoCheck re-implementado en TS
// (las funciones no eran serializables en el JSON, se reescriben aquí).
import { MISIONES_DB } from './index';
import type { Estudiante, Actividad, Mision } from './types';

export function misionCumplida(
  mision: Mision,
  student: Estudiante,
  activities: Actividad[],
  claseNum: number,
  unidadId: string,
): boolean {
  const delEstudianteEstaClase = activities.filter(
    (a) => a.studentId === student.id && a.claseNum === claseNum && a.unidadId === unidadId,
  );

  switch (mision.id) {
    case 'M01': // Voz Filosófica: participó al menos 1 vez
      return delEstudianteEstaClase.some((a) => a.tipo === 'participacion');
    case 'M02': // Excelencia: avanzado o excepcional en alguna actividad
      return delEstudianteEstaClase.some(
        (a) => a.nivel === 'avanzado' || a.nivel === 'excepcional',
      );
    case 'M03': // Cazador de palabras: descubrió vocabulario
      return (student.vocabularioDescubierto ?? []).length > 0;
    case 'M04': // Debatiente: participó en debate o diálogo
      return delEstudianteEstaClase.some((a) => a.tipo === 'debate' || a.tipo === 'dialogo');
    case 'M05': // Doble esfuerzo: 2 tipos distintos
      return new Set(delEstudianteEstaClase.map((a) => a.tipo)).size >= 2;
    default:
      // Misiones entre-clases (M06+) son de verificación manual
      return mision.verificacion === 'manual'
        ? !!student.misionesCompletadas?.[mision.id]
        : false;
  }
}

export function misionesDeClase(): Mision[] {
  return MISIONES_DB.filter((m) => m.tipo === 'clase');
}

export function misionesEntreClases(): Mision[] {
  return MISIONES_DB.filter((m) => m.tipo === 'entre-clases');
}
