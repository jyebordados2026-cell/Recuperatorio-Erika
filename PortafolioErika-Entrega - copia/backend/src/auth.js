// Gestión de usuarios y sesiones.
// Una sesión es un registro en la tabla "sesiones" asociado a un usuario.
// El cliente recibe un token aleatorio y lo envía en cada petición:
//   - como cookie httpOnly (misma origen), o
//   - como encabezado "Authorization: Bearer <token>" (útil para probar con Live Server).

const db = require("./db");
const { generarToken } = require("./seguridad");

const DURACION_SESION_MS = 8 * 60 * 60 * 1000; // 8 horas
const NOMBRE_COOKIE = "sesion_portfolio";

function usuarioPublico(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    usuario: fila.usuario,
    rol: fila.rol,
  };
}

function buscarUsuarioPorIdentificador(identificador) {
  return db
    .prepare(
      `SELECT * FROM usuarios
       WHERE lower(email) = lower(?) OR lower(usuario) = lower(?)
       LIMIT 1`
    )
    .get(String(identificador).trim(), String(identificador).trim());
}

function crearSesion(usuarioId) {
  const token = generarToken();
  const expiraEn = new Date(Date.now() + DURACION_SESION_MS).toISOString();

  db.prepare(
    "INSERT INTO sesiones (token, usuario_id, expira_en) VALUES (?, ?, ?)"
  ).run(token, usuarioId, expiraEn);

  return { token, expiraEn };
}

// Devuelve la sesión (token + usuario + expiración) o null si no existe/venció.
function obtenerSesion(token) {
  if (!token) return null;

  const fila = db
    .prepare(
      `SELECT s.token, s.expira_en, u.id, u.nombre, u.email, u.usuario, u.rol
       FROM sesiones s
       JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.token = ?`
    )
    .get(token);

  if (!fila) return null;

  if (new Date(fila.expira_en).getTime() <= Date.now()) {
    eliminarSesion(token);
    return null;
  }

  return {
    token: fila.token,
    expiraEn: fila.expira_en,
    usuario: usuarioPublico(fila),
  };
}

function eliminarSesion(token) {
  if (!token) return;
  db.prepare("DELETE FROM sesiones WHERE token = ?").run(token);
}

function limpiarSesionesVencidas() {
  db.prepare("DELETE FROM sesiones WHERE expira_en <= ?").run(
    new Date().toISOString()
  );
}

// Extrae el token desde el encabezado Authorization o desde la cookie.
function obtenerToken(req) {
  const encabezado = req.headers.authorization || "";
  if (encabezado.startsWith("Bearer ")) {
    return encabezado.slice(7).trim();
  }

  const cookies = String(req.headers.cookie || "")
    .split(";")
    .map((parte) => parte.trim())
    .filter(Boolean);

  for (const cookie of cookies) {
    const [nombre, ...resto] = cookie.split("=");
    if (nombre === NOMBRE_COOKIE) {
      return decodeURIComponent(resto.join("="));
    }
  }

  return null;
}

module.exports = {
  NOMBRE_COOKIE,
  DURACION_SESION_MS,
  usuarioPublico,
  buscarUsuarioPorIdentificador,
  crearSesion,
  obtenerSesion,
  eliminarSesion,
  limpiarSesionesVencidas,
  obtenerToken,
};
