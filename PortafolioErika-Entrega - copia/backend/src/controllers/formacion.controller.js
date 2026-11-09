// Controlador CRUD de formación académica.

const db = require("../db");
const { validarFormacion } = require("../../dist/models/formacion.js");

function filaAFormacion(fila) {
  return {
    id: fila.id,
    institucion: fila.institucion,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
    enCurso: Boolean(fila.en_curso),
  };
}

function normalizarEntrada(body) {
  const enCurso = body.enCurso === true || body.enCurso === "true" || body.enCurso === 1;

  return {
    institucion: String(body.institucion || "").trim(),
    titulo: String(body.titulo || "").trim(),
    descripcion: String(body.descripcion || "").trim(),
    fechaInicio: String(body.fechaInicio || "").trim(),
    fechaFin: enCurso ? null : String(body.fechaFin || "").trim() || null,
    enCurso,
  };
}

// GET /api/formacion (público)
function listar(req, res) {
  const filas = db
    .prepare(
      "SELECT * FROM formacion ORDER BY en_curso DESC, fecha_inicio DESC, id DESC"
    )
    .all();

  return res.json(filas.map(filaAFormacion));
}

// GET /api/formacion/:id (público)
function obtener(req, res) {
  const fila = db
    .prepare("SELECT * FROM formacion WHERE id = ?")
    .get(req.params.id);

  if (!fila) {
    return res.status(404).json({ error: "Registro de formación no encontrado." });
  }

  return res.json(filaAFormacion(fila));
}

// POST /api/formacion (solo admin)
function crear(req, res) {
  const datos = normalizarEntrada(req.body);
  const errores = validarFormacion(datos);

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const resultado = db
    .prepare(
      `INSERT INTO formacion
       (institucion, titulo, descripcion, fecha_inicio, fecha_fin, en_curso)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      datos.institucion,
      datos.titulo,
      datos.descripcion,
      datos.fechaInicio,
      datos.fechaFin,
      datos.enCurso ? 1 : 0
    );

  const fila = db
    .prepare("SELECT * FROM formacion WHERE id = ?")
    .get(resultado.lastInsertRowid);

  return res.status(201).json(filaAFormacion(fila));
}

// PUT /api/formacion/:id (solo admin)
function actualizar(req, res) {
  const fila = db
    .prepare("SELECT id FROM formacion WHERE id = ?")
    .get(req.params.id);

  if (!fila) {
    return res.status(404).json({ error: "Registro de formación no encontrado." });
  }

  const datos = normalizarEntrada(req.body);
  const errores = validarFormacion(datos);

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  db.prepare(
    `UPDATE formacion
     SET institucion = ?, titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, en_curso = ?
     WHERE id = ?`
  ).run(
    datos.institucion,
    datos.titulo,
    datos.descripcion,
    datos.fechaInicio,
    datos.fechaFin,
    datos.enCurso ? 1 : 0,
    req.params.id
  );

  const actualizada = db
    .prepare("SELECT * FROM formacion WHERE id = ?")
    .get(req.params.id);

  return res.json(filaAFormacion(actualizada));
}

// DELETE /api/formacion/:id (solo admin)
function eliminar(req, res) {
  const resultado = db
    .prepare("DELETE FROM formacion WHERE id = ?")
    .run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ error: "Registro de formación no encontrado." });
  }

  return res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
