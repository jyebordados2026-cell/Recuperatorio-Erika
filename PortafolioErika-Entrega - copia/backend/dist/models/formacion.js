"use strict";
// TypeScript: modelo y validación de la formación académica.
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarFormacion = validarFormacion;
const FORMATO_FECHA = /^\d{4}-(0[1-9]|1[0-2])$/;
function validarFormacion(datos) {
    const errores = [];
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
            errores.push("La fecha de finalización es obligatoria (formato AAAA-MM) o debe marcarse 'en curso'.");
        }
        else if (datos.fechaInicio &&
            datos.fechaFin < datos.fechaInicio) {
            errores.push("La fecha de finalización no puede ser anterior a la fecha de inicio.");
        }
    }
    return errores;
}
