// Servidor Express: API del portfolio + archivos del frontend.
//
// El mismo servidor entrega el sitio (frontend/) y la API (/api/...).
// Abrir http://localhost:3000 en el navegador.

const path = require("node:path");
const express = require("express");

const { sesionOpcional } = require("./middlewares/auth");
const { limpiarSesionesVencidas } = require("./auth");
const authRouter = require("./routes/auth.routes");
const proyectosRouter = require("./routes/proyectos.routes");
const habilidadesRouter = require("./routes/habilidades.routes");
const formacionRouter = require("./routes/formacion.routes");

const app = express();
const PUERTO = process.env.PORT || 3000;

// Permite recibir JSON en el cuerpo de las peticiones (POST/PUT).
app.use(express.json());

// CORS básico: útil si se prueba el frontend con Live Server en otro puerto.
app.use((req, res, next) => {
  const origen = req.headers.origin;
  res.header("Access-Control-Allow-Origin", origen || "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Carga req.sesion (si existe) en todas las peticiones.
app.use(sesionOpcional);

// Ruta de prueba rápida del servidor.
app.get("/api/salud", (req, res) => {
  res.json({ ok: true, mensaje: "API del portfolio funcionando" });
});

// API
app.use("/api/auth", authRouter);
app.use("/api/proyectos", proyectosRouter);
app.use("/api/habilidades", habilidadesRouter);
app.use("/api/formacion", formacionRouter);

// Frontend (HTML, CSS, JS e imágenes)
const carpetaFrontend = path.join(__dirname, "..", "..", "frontend");
app.use(express.static(carpetaFrontend));

// 404 para rutas de API inexistentes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Recurso no encontrado." });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

limpiarSesionesVencidas();

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
