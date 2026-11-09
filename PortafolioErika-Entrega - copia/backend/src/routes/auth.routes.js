// Rutas de autenticación.

const express = require("express");
const {
  login,
  logout,
  sesionActual,
} = require("../controllers/auth.controller");

const router = express.Router();

// POST /api/auth/login  -> inicia sesión y devuelve un token
router.post("/login", login);

// POST /api/auth/logout -> cierra la sesión actual
router.post("/logout", logout);

// GET /api/auth/sesion  -> consulta si hay una sesión activa
router.get("/sesion", sesionActual);

module.exports = router;
