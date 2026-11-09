// Controlador CRUD de habilidades y tecnologías.

const db = require("../db");
const { validarHabilidad } = require("../../dist/models/habilidad.js");

function filaAHabilidad(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    nivel: fila.nivel,
  };
}

function normalizarEntrada(body) {
  return {
    nombre: String(body.nombre || "").trim(),
    categoria: String(body.categoria || "").trim(),
    nivel: String(body.nivel || "").trim(),
  };
}

// GET /api/habilidades (público)
function listar(req, res) {
  const filas = db
    .prepare("SELECT * FROM habilidades ORDER BY categoria ASC, nombre ASC")
    .all();

  return res.json(filas.map(filaAHabilidad));
}

// GET /api/habilidades/:id (público)
function obtener(req, res) {
  const fila = db
    .prepare("SELECT * FROM habilidades WHERE id = ?")
    .get(req.params.id);

  if (!fila) {
    return res.status(404).json({ error: "Habilidad no encontrada." });
  }

  return res.json(filaAHabilidad(fila));
}

// POST /api/habilidades (solo admin)
function crear(req, res) {
  const datos = normalizarEntrada(req.body);
  const errores = validarHabilidad(datos);

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const resultado = db
    .prepare(
      "INSERT INTO habilidades (nombre, categoria, nivel) VALUES (?, ?, ?)"
    )
    .run(datos.nombre, datos.categoria, datos.nivel);

  const fila = db
    .prepare("SELECT * FROM habilidades WHERE id = ?")
    .get(resultado.lastInsertRowid);

  return res.status(201).json(filaAHabilidad(fila));
}

// PUT /api/habilidades/:id (solo admin)
function actualizar(req, res) {
  const fila = db
    .prepare("SELECT id FROM habilidades WHERE id = ?")
    .get(req.params.id);

  if (!fila) {
    return res.status(404).json({ error: "Habilidad no encontrada." });
  }

  const datos = normalizarEntrada(req.body);
  const errores = validarHabilidad(datos);

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  db.prepare(
    "UPDATE habilidades SET nombre = ?, categoria = ?, nivel = ? WHERE id = ?"
  ).run(datos.nombre, datos.categoria, datos.nivel, req.params.id);

  const actualizada = db
    .prepare("SELECT * FROM habilidades WHERE id = ?")
    .get(req.params.id);

  return res.json(filaAHabilidad(actualizada));
}

// DELETE /api/habilidades/:id (solo admin)
function eliminar(req, res) {
  const resultado = db
    .prepare("DELETE FROM habilidades WHERE id = ?")
    .run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ error: "Habilidad no encontrada." });
  }

  return res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
