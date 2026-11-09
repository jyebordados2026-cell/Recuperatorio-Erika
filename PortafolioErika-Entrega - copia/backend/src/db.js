// Conexión y creación de la base de datos SQLite usando el módulo nativo node:sqlite.
// La base se guarda en backend/database/portfolio.db y persiste entre reinicios.
// Al iniciar por primera vez se crean las tablas y se cargan datos de ejemplo.

const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");
const { hashPassword } = require("./seguridad");

const dbDir = path.join(__dirname, "..", "database");
fs.mkdirSync(dbDir, { recursive: true });

const rutaBd = path.join(dbDir, "portfolio.db");
const db = new DatabaseSync(rutaBd);

db.exec("PRAGMA foreign_keys = ON;");

/* ============================ ESQUEMA ============================ */

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    usuario TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'visitante'
      CHECK (rol IN ('admin', 'visitante')),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sesiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    usuario_id INTEGER NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    expira_en TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS proyectos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    tecnologias TEXT NOT NULL,
    imagen_url TEXT,
    enlace_url TEXT,
    estado TEXT NOT NULL DEFAULT 'borrador'
      CHECK (estado IN ('publicado', 'en-desarrollo', 'borrador')),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS habilidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL
      CHECK (categoria IN ('lenguaje', 'framework', 'herramienta', 'base-de-datos', 'otro')),
    nivel TEXT NOT NULL
      CHECK (nivel IN ('basico', 'intermedio', 'avanzado')),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS formacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institucion TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    en_curso INTEGER NOT NULL DEFAULT 0
      CHECK (en_curso IN (0, 1)),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

/* ============================ DATOS INICIALES ============================ */

// Usuarios: el administrador puede gestionar todo; el visitante solo consulta.
const { total: totalUsuarios } = db
  .prepare("SELECT COUNT(*) AS total FROM usuarios")
  .get();

if (totalUsuarios === 0) {
  const insertarUsuario = db.prepare(`
    INSERT INTO usuarios (nombre, email, usuario, password_hash, rol)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Contraseñas de demostración. En un sistema real se cambian al primer ingreso.
  insertarUsuario.run(
    "Erika (Administradora)",
    "admin@erika.com",
    "erika",
    hashPassword("Admin123!"),
    "admin"
  );

  insertarUsuario.run(
    "Visitante Demo",
    "visitante@erika.com",
    "visitante",
    hashPassword("Visita123!"),
    "visitante"
  );
}

// Proyectos iniciales del portfolio.
const { total: totalProyectos } = db
  .prepare("SELECT COUNT(*) AS total FROM proyectos")
  .get();

if (totalProyectos === 0) {
  const insertarProyecto = db.prepare(`
    INSERT INTO proyectos (nombre, descripcion, tecnologias, imagen_url, enlace_url, estado)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertarProyecto.run(
    "Clínica Dental",
    "Sistema para gestionar pacientes, turnos y usuarios de una clínica dental.",
    "HTML,CSS,JavaScript",
    null,
    "https://github.com/Damian02XD/Grupo_ClinicaDental",
    "publicado"
  );

  insertarProyecto.run(
    "Java Práctica",
    "Aplicación desarrollada en Java para poner en práctica los conceptos aprendidos en clase.",
    "Java",
    null,
    "https://github.com/Damian02XD/JavaPractica",
    "publicado"
  );

  insertarProyecto.run(
    "Este portafolio",
    "Sitio personal con autenticación, roles y panel de administración para gestionar el contenido.",
    "HTML,CSS,JavaScript,TypeScript,Node.js,Express,SQLite,Git",
    null,
    "https://github.com/Damian02XD/PortafolioPersonal",
    "en-desarrollo"
  );
}

// Habilidades y tecnologías.
const { total: totalHabilidades } = db
  .prepare("SELECT COUNT(*) AS total FROM habilidades")
  .get();

if (totalHabilidades === 0) {
  const insertarHabilidad = db.prepare(`
    INSERT INTO habilidades (nombre, categoria, nivel)
    VALUES (?, ?, ?)
  `);

  const habilidadesIniciales = [
    ["HTML", "lenguaje", "avanzado"],
    ["CSS", "lenguaje", "avanzado"],
    ["JavaScript", "lenguaje", "intermedio"],
    ["TypeScript", "lenguaje", "intermedio"],
    ["Node.js", "framework", "intermedio"],
    ["Express", "framework", "intermedio"],
    ["SQLite", "base-de-datos", "intermedio"],
    ["Git y GitHub", "herramienta", "intermedio"],
    ["Java", "lenguaje", "basico"],
    ["Figma", "herramienta", "basico"],
  ];

  for (const [nombre, categoria, nivel] of habilidadesIniciales) {
    insertarHabilidad.run(nombre, categoria, nivel);
  }
}

// Formación académica.
const { total: totalFormacion } = db
  .prepare("SELECT COUNT(*) AS total FROM formacion")
  .get();

if (totalFormacion === 0) {
  const insertarFormacion = db.prepare(`
    INSERT INTO formacion (institucion, titulo, descripcion, fecha_inicio, fecha_fin, en_curso)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertarFormacion.run(
    "INCADE",
    "Carrera GPI (Gestión de Proyectos Informáticos)",
    "Formación orientada al desarrollo de software, bases de datos y gestión de proyectos informáticos.",
    "2024-03",
    null,
    1
  );

  insertarFormacion.run(
    "Nivel Secundario",
    "Secundario completo",
    "Formación secundaria finalizada, con orientación en informática y herramientas digitales.",
    "2019-03",
    "2023-12",
    0
  );

  insertarFormacion.run(
    "Curso de Desarrollo Web",
    "HTML, CSS y JavaScript",
    "Curso introductorio de desarrollo web frontend: estructura, estilos, interactividad y buenas prácticas.",
    "2024-08",
    "2024-12",
    0
  );
}

module.exports = db;
