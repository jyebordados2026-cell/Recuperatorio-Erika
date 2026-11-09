// Middlewares de autenticación y autorización por roles.
//
// Flujo:
//   1. sesionOpcional: lee el token y carga req.sesion si la sesión es válida.
//   2. requiereSesion: bloquea con 401 si no hay sesión.
//   3. requiereAdmin: bloquea con 403 si el usuario no es administrador.
//
// Así, aunque un visitante intente llamar directamente a un endpoint de
// escritura, el servidor lo rechaza (no alcanza con ocultar botones en el frontend).

const { obtenerToken, obtenerSesion } = require("../auth");

function sesionOpcional(req, res, next) {
  const token = obtenerToken(req);
  req.tokenSesion = token;
  req.sesion = token ? obtenerSesion(token) : null;
  next();
}

function requiereSesion(req, res, next) {
  if (!req.sesion) {
    return res
      .status(401)
      .json({ error: "Debés iniciar sesión para realizar esta acción." });
  }
  next();
}

function requiereAdmin(req, res, next) {
  if (!req.sesion) {
    return res
      .status(401)
      .json({ error: "Debés iniciar sesión para realizar esta acción." });
  }

  if (req.sesion.usuario.rol !== "admin") {
    return res
      .status(403)
      .json({ error: "No tenés permisos de administrador." });
  }

  next();
}

module.exports = { sesionOpcional, requiereSesion, requiereAdmin };
