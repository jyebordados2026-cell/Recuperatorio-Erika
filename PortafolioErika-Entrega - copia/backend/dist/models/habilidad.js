"use strict";
// TypeScript: modelo y validación de habilidades y tecnologías.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIVELES = exports.CATEGORIAS = void 0;
exports.esCategoriaValida = esCategoriaValida;
exports.esNivelValido = esNivelValido;
exports.validarHabilidad = validarHabilidad;
exports.CATEGORIAS = [
    "lenguaje",
    "framework",
    "herramienta",
    "base-de-datos",
    "otro",
];
exports.NIVELES = ["basico", "intermedio", "avanzado"];
function esCategoriaValida(valor) {
    return typeof valor === "string" && exports.CATEGORIAS.includes(valor);
}
function esNivelValido(valor) {
    return typeof valor === "string" && exports.NIVELES.includes(valor);
}
function validarHabilidad(datos) {
    const errores = [];
    if (!datos.nombre || datos.nombre.trim().length < 2) {
        errores.push("El nombre debe tener al menos 2 caracteres.");
    }
    if (!esCategoriaValida(datos.categoria)) {
        errores.push("La categoría debe ser lenguaje, framework, herramienta, base-de-datos u otro.");
    }
    if (!esNivelValido(datos.nivel)) {
        errores.push("El nivel debe ser basico, intermedio o avanzado.");
    }
    return errores;
}
