// Rutas CRUD de proyectos.
// Lectura: pública (los visitantes solo ven publicados).
// Escritura: exclusiva del rol administrador.

const express = require("express");
const { requiereAdmin } = require("../middlewares/auth");
const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
} = require("../controllers/proyectos.controller");

const router = express.Router();

router.get("/", listar);
router.get("/:id", obtener);

router.post("/", requiereAdmin, crear);
router.put("/:id", requiereAdmin, actualizar);
router.delete("/:id", requiereAdmin, eliminar);

module.exports = router;
