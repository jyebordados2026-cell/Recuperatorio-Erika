// TypeScript: modelo y validación de la formación académica.

export interface Formacion {
  id: number;
  institucion: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string; // formato AAAA-MM
  fechaFin: string | null; // null cuando está en curso
  enCurso: boolean;
}

export type FormacionEntrada = Omit<Formacion, "id">;

const FORMATO_FECHA = /^\d{4}-(0[1-9]|1[0-2])$/;

export function validarFormacion(datos: Partial<FormacionEntrada>): string[] {
  const errores: string[] = [];

  if (!datos.institucion || datos.institucion.trim().length < 2) {
    errores.push("La institución debe tener al menos 2 caracteres.");
  }

  if (!datos.titulo || datos.titulo.trim().length < 2) {
    errores.push("El título, carrera o curso debe tener al menos 2 caracteres.");
  }

  if (!datos.descripcion || datos.descripcion.trim().length < 10) {
    errores.push("La descripción debe tener al menos 10 caracteres.");
  }

  if (!datos.fechaInicio || !FORMATO_FECHA.test(datos.fechaInicio)) {
    errores.push("La fecha de inicio debe tener el formato AAAA-MM.");
  }

  if (!datos.enCurso) {
    if (!datos.fechaFin || !FORMATO_FECHA.test(datos.fechaFin)) {
      errores.push(
        "La fecha de finalización es obligatoria (formato AAAA-MM) o debe marcarse 'en curso'."
      );
    } else if (
      datos.fechaInicio &&
      datos.fechaFin < datos.fechaInicio
    ) {
      errores.push(
        "La fecha de finalización no puede ser anterior a la fecha de inicio."
      );
    }
  }

  return errores;
}
