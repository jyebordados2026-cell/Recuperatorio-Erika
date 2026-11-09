// TypeScript: modelo y validación de habilidades y tecnologías.

export type CategoriaHabilidad =
  | "lenguaje"
  | "framework"
  | "herramienta"
  | "base-de-datos"
  | "otro";

export type NivelHabilidad = "basico" | "intermedio" | "avanzado";

export interface Habilidad {
  id: number;
  nombre: string;
  categoria: CategoriaHabilidad;
  nivel: NivelHabilidad;
}

export type HabilidadEntrada = Omit<Habilidad, "id">;

export const CATEGORIAS: CategoriaHabilidad[] = [
  "lenguaje",
  "framework",
  "herramienta",
  "base-de-datos",
  "otro",
];

export const NIVELES: NivelHabilidad[] = ["basico", "intermedio", "avanzado"];

export function esCategoriaValida(valor: unknown): valor is CategoriaHabilidad {
  return typeof valor === "string" && (CATEGORIAS as string[]).includes(valor);
}

export function esNivelValido(valor: unknown): valor is NivelHabilidad {
  return typeof valor === "string" && (NIVELES as string[]).includes(valor);
}

export function validarHabilidad(datos: Partial<HabilidadEntrada>): string[] {
  const errores: string[] = [];

  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.push("El nombre debe tener al menos 2 caracteres.");
  }

  if (!esCategoriaValida(datos.categoria)) {
    errores.push(
      "La categoría debe ser lenguaje, framework, herramienta, base-de-datos u otro."
    );
  }

  if (!esNivelValido(datos.nivel)) {
    errores.push("El nivel debe ser basico, intermedio o avanzado.");
  }

  return errores;
}
