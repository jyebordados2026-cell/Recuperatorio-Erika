// Controlador de autenticación: login, logout y consulta de la sesión actual.

const { verificarPassword } = require("../seguridad");
const {
  NOMBRE_COOKIE,
  DURACION_SESION_MS,
  usuarioPublico,
  buscarUsuarioPorIdentificador,
  crearSesion,
  eliminarSesion,
} = require("../auth");

// POST /api/auth/login
function login(req, res) {
  const identificador = String(req.body?.identificador || "").trim();
  const password = String(req.body?.password || "");

  if (!identificador || !password) {
    return res.status(400).json({
      error: "Ingresá tu email o usuario y tu contraseña.",
    });
  }

  const usuario = buscarUsuarioPorIdentificador(identificador);

  // Mismo mensaje para usuario inexistente y contraseña incorrecta:
  // así no se revela qué dato falló.
  if (!usuario || !verificarPassword(password, usuario.password_hash)) {
    return res.status(401).json({
      error: "Usuario o contraseña incorrectos.",
    });
  }

  const { token, expiraEn } = crearSesion(usuario.id);

  // Cookie httpOnly: JavaScript del navegador no puede leerla (protección XSS).
  res.cookie(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: DURACION_SESION_MS,
    path: "/",
  });

  return res.json({
    token,
    expiraEn,
    usuario: usuarioPublico(usuario),
  });
}

// POST /api/auth/logout
function logout(req, res) {
  eliminarSesion(req.tokenSesion);
  res.clearCookie(NOMBRE_COOKIE, { path: "/" });
  return res.status(204).send();
}

// GET /api/auth/sesion
function sesionActual(req, res) {
  if (!req.sesion) {
    return res.json({ autenticado: false, usuario: null });
  }

  return res.json({
    autenticado: true,
    usuario: req.sesion.usuario,
    expiraEn: req.sesion.expiraEn,
  });
}

module.exports = { login, logout, sesionActual };
