// Utilidades de seguridad: hash de contraseñas y tokens de sesión.
// Usamos el módulo nativo "node:crypto", sin dependencias externas.
//
// Las contraseñas NUNCA se guardan en texto plano. Se guarda:
//   scrypt$<salt>$<hash>
// donde "salt" es un valor aleatorio distinto para cada usuario y "hash"
// es el resultado de scrypt(password + salt).

const crypto = require("node:crypto");

const LONGITUD_HASH = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, LONGITUD_HASH);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

function verificarPassword(password, passwordGuardado) {
  const partes = String(passwordGuardado || "").split("$");

  if (partes.length !== 3 || partes[0] !== "scrypt") {
    return false;
  }

  const [, salt, hashHex] = partes;
  const hashEsperado = Buffer.from(hashHex, "hex");
  const hashCalculado = crypto.scryptSync(String(password), salt, LONGITUD_HASH);

  // timingSafeEqual evita filtrar información por diferencias de tiempo.
  return (
    hashEsperado.length === hashCalculado.length &&
    crypto.timingSafeEqual(hashEsperado, hashCalculado)
  );
}

function generarToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  hashPassword,
  verificarPassword,
  generarToken,
};
