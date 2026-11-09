// Rutas CRUD de formación académica.
// Lectura: pública. Escritura: solo administrador.

const express = require("express");
const { requiereAdmin } = require("../middlewares/auth");
const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
} = require("../controllers/formacion.controller");

const router = express.Router();

router.get("/", listar);
router.get("/:id", obtener);

router.post("/", requiereAdmin, crear);
router.put("/:id", requiereAdmin, actualizar);
router.delete("/:id", requiereAdmin, eliminar);

module.exports = router;
