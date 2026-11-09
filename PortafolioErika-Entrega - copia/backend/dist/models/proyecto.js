"use strict";
// TypeScript: modelo y validación de los proyectos del portfolio.
// Este archivo se compila con `tsc` y el resultado queda en backend/dist/models/proyecto.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESTADOS = void 0;
exports.esEstadoValido = esEstadoValido;
exports.validarProyecto = validarProyecto;
exports.ESTADOS = [
    "publicado",
    "en-desarrollo",
    "borrador",
];
function esEstadoValido(valor) {
    return typeof valor === "string" && exports.ESTADOS.includes(valor);
}
// Devuelve la lista de errores encontrados (vacía si todo está bien).
function validarProyecto(datos) {
    const errores = [];
    if (!datos.nombre || datos.nombre.trim().length < 3) {
        errores.push("El nombre debe tener al menos 3 caracteres.");
    }
    if (!datos.descripcion || datos.descripcion.trim().length < 10) {
        errores.push("La descripción debe tener al menos 10 caracteres.");
    }
    if (!Array.isArray(datos.tecnologias) || datos.tecnologias.length === 0) {
        errores.push("Debe indicar al menos una tecnología.");
    }
    if (!esEstadoValido(datos.estado)) {
        errores.push("El estado debe ser publicado, en-desarrollo o borrador.");
    }
    return errores;
}
