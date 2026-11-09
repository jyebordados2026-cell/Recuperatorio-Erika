/* ============================================================
   Portafolio de Erika — JavaScript del frontend
   Temas: DOM, eventos, validación, fetch/HTTP, sesiones,
   roles y CRUD (proyectos, habilidades y formación).
   ============================================================ */

/* ============================ CONFIGURACIÓN ============================ */

// Si el HTML se abre como archivo (file://), la API se busca en el servidor local.
// Si se abre desde http://localhost:3000, se usa el mismo origen.
const API_BASE = location.protocol === "file:" ? "http://localhost:3000" : "";
const CLAVE_TOKEN = "portafolio_erika_token";

const estado = {
  token: localStorage.getItem(CLAVE_TOKEN),
  usuario: null,
  proyectosAdmin: [],
  habilidadesAdmin: [],
  formacionAdmin: [],
};

const ETIQUETAS_CATEGORIA = {
  lenguaje: "Lenguaje",
  framework: "Framework",
  herramienta: "Herramienta",
  "base-de-datos": "Base de datos",
  otro: "Otro",
};

const ETIQUETAS_NIVEL = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

const ETIQUETAS_ESTADO = {
  publicado: "Publicado",
  "en-desarrollo": "En desarrollo",
  borrador: "Borrador",
};

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/* ============================ UTILIDADES ============================ */

const $ = (id) => document.getElementById(id);

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function setError(elemento, mensaje) {
  if (!elemento) return;
  elemento.textContent = mensaje || "";
  elemento.hidden = !mensaje;
}

let temporizadorToast = null;

function mostrarToast(mensaje, esError = false) {
  const toast = $("toast");
  if (!toast) return;

  clearTimeout(temporizadorToast);
  toast.textContent = mensaje;
  toast.classList.toggle("toast-error", esError);
  toast.hidden = false;

  temporizadorToast = setTimeout(() => {
    toast.hidden = true;
  }, 3400);
}

function mensajeDeError(error) {
  if (error?.datos?.errores?.length) return error.datos.errores.join(" ");
  if (error?.datos?.error) return error.datos.error;
  return error?.message || "Ocurrió un error inesperado.";
}

// Convierte "2024-03" en "Mar 2024".
function formatearFecha(fecha) {
  if (!fecha) return "";
  const [anio, mes] = String(fecha).split("-");
  const indice = Number(mes) - 1;
  if (!anio || Number.isNaN(indice) || !MESES[indice]) return fecha;
  return `${MESES[indice].charAt(0).toUpperCase()}${MESES[indice].slice(1)} ${anio}`;
}

function formatearRango(inicio, fin, enCurso) {
  const desde = formatearFecha(inicio);
  if (enCurso) return `${desde} – actualidad`;
  const hasta = formatearFecha(fin);
  return hasta ? `${desde} – ${hasta}` : desde;
}

/* ============================ CLIENTE HTTP ============================ */

/**
 * Realiza una petición a la API.
 * Agrega el token de sesión (si existe) y convierte los errores HTTP
 * en excepciones con el mensaje enviado por el servidor.
 */
async function api(ruta, opciones = {}) {
  const headers = new Headers(opciones.headers || {});

  if (estado.token) {
    headers.set("Authorization", "Bearer " + estado.token);
  }

  if (opciones.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const respuesta = await fetch(API_BASE + ruta, {
    ...opciones,
    headers,
    credentials: "include", // envía/recibe la cookie httpOnly de sesión
  });

  const textoRespuesta = await respuesta.text();
  let datos = null;

  if (textoRespuesta) {
    try {
      datos = JSON.parse(textoRespuesta);
    } catch {
      datos = { error: textoRespuesta };
    }
  }

  if (!respuesta.ok) {
    const error = new Error(
      (datos && (datos.error || (datos.errores || []).join(" "))) ||
        `Error HTTP ${respuesta.status}`
    );
    error.status = respuesta.status;
    error.datos = datos;
    throw error;
  }

  return datos;
}

/* ============================ SESIÓN Y ROLES ============================ */

function guardarToken(token) {
  estado.token = token;
  localStorage.setItem(CLAVE_TOKEN, token);
}

function borrarToken() {
  estado.token = null;
  localStorage.removeItem(CLAVE_TOKEN);
}

/** Actualiza la interfaz según el usuario autenticado y su rol. */
function aplicarSesion(usuario) {
  estado.usuario = usuario;
  const logueado = Boolean(usuario);
  const esAdmin = usuario?.rol === "admin";

  $("btnAbrirLogin").classList.toggle("oculto", logueado);
  $("chipUsuario").classList.toggle("oculto", !logueado);
  $("btnIrPanel").classList.toggle("oculto", !esAdmin);

  if (logueado) {
    $("chipNombre").textContent = usuario.nombre;
    $("chipRol").textContent = esAdmin ? "Admin" : "Visitante";
    $("adminNombre").textContent = usuario.nombre;
    $("adminRol").textContent = esAdmin ? "Admin" : "Visitante";
  } else {
    $("adminNombre").textContent = "—";
    $("adminRol").textContent = "—";
  }

  if (!esAdmin) {
    ocultarAdmin();
  }
}

function mostrarAdmin() {
  if (estado.usuario?.rol !== "admin") {
    mostrarToast("El panel de administración es solo para usuarios admin.", true);
    return;
  }

  $("admin").classList.remove("oculto");
  activarTab("proyectos");
  cargarAdmin();

  requestAnimationFrame(() => {
    $("admin").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function ocultarAdmin() {
  const admin = $("admin");
  if (admin) admin.classList.add("oculto");
}

async function iniciarSesion(evento) {
  evento.preventDefault();

  const identificador = $("loginIdentificador").value.trim();
  const password = $("loginPassword").value;
  const boton = $("btnIngresar");

  setError($("loginError"), "");

  if (!identificador || !password) {
    setError($("loginError"), "Ingresá tu email o usuario y tu contraseña.");
    return;
  }

  boton.disabled = true;
  boton.textContent = "Ingresando...";

  try {
    const datos = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identificador, password }),
    });

    guardarToken(datos.token);
    aplicarSesion(datos.usuario);

    $("dialogoLogin").close();
    $("formLogin").reset();

    await recargarTodo();

    if (datos.usuario.rol === "admin") {
      mostrarToast(`Bienvenida, ${datos.usuario.nombre}.`);
      mostrarAdmin();
    } else {
      mostrarToast("Sesión iniciada como visitante. El panel es solo para administradores.");
    }
  } catch (error) {
    setError($("loginError"), mensajeDeError(error));
  } finally {
    boton.disabled = false;
    boton.textContent = "Ingresar";
  }
}

async function cerrarSesion() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    // Si el servidor no responde, igualmente cerramos la sesión local.
  }

  borrarToken();
  aplicarSesion(null);
  await recargarTodo();
  mostrarToast("Sesión cerrada correctamente.");
}

/** Al recargar la página, valida el token guardado contra el servidor. */
async function restaurarSesion() {
  if (!estado.token) {
    aplicarSesion(null);
    return;
  }

  try {
    const datos = await api("/api/auth/sesion");

    if (datos.autenticado && datos.usuario) {
      aplicarSesion(datos.usuario);
    } else {
      borrarToken();
      aplicarSesion(null);
    }
  } catch (error) {
    if (error.status === 401) {
      borrarToken();
    }
    aplicarSesion(null);
  }
}

/* ============================ PORTFOLIO PÚBLICO ============================ */

async function cargarProyectosPublicos() {
  const contenedor = $("listaProyectos");
  if (!contenedor) return;

  try {
    // Los visitantes solo reciben proyectos publicados.
    const proyectos = await api("/api/proyectos?estado=publicado");
    renderizarProyectos(proyectos, contenedor);
  } catch (error) {
    contenedor.innerHTML = "";
    contenedor.appendChild(
      crearElemento(
        "p",
        "cargando",
        "No se pudieron cargar los proyectos. Verificá que el backend esté corriendo."
      )
    );
  }
}

function renderizarProyectos(proyectos, contenedor) {
  contenedor.innerHTML = "";

  if (!proyectos.length) {
    contenedor.appendChild(
      crearElemento("p", "cargando", "Todavía no hay proyectos publicados.")
    );
    return;
  }

  proyectos.forEach((proyecto, indice) => {
    const articulo = crearElemento("article", "proyecto");

    articulo.appendChild(
      crearElemento("span", "proyecto-num", String(indice + 1).padStart(2, "0"))
    );

    if (proyecto.imagenUrl) {
      const imagen = document.createElement("img");
      imagen.className = "proyecto-imagen";
      imagen.src = proyecto.imagenUrl;
      imagen.alt = "Imagen del proyecto " + proyecto.nombre;
      imagen.loading = "lazy";
      articulo.appendChild(imagen);
    }

    articulo.appendChild(crearElemento("h3", null, proyecto.nombre));
    articulo.appendChild(crearElemento("p", null, proyecto.descripcion));

    articulo.appendChild(
      crearElemento(
        "p",
        "tecnologias",
        Array.isArray(proyecto.tecnologias)
          ? proyecto.tecnologias.join(" · ")
          : proyecto.tecnologias
      )
    );

    articulo.appendChild(
      crearElemento(
        "span",
        "estado estado-" + proyecto.estado,
        ETIQUETAS_ESTADO[proyecto.estado] || proyecto.estado
      )
    );

    if (proyecto.enlaceUrl) {
      const enlace = document.createElement("a");
      enlace.href = proyecto.enlaceUrl;
      enlace.target = "_blank";
      enlace.rel = "noopener";
      enlace.className = "boton boton-mini";
      enlace.textContent = "Ver enlace";
      articulo.appendChild(enlace);
    }

    contenedor.appendChild(articulo);
  });
}

async function cargarHabilidadesPublicas() {
  const contenedor = $("listaHabilidades");
  if (!contenedor) return;

  try {
    const habilidades = await api("/api/habilidades");
    contenedor.innerHTML = "";

    if (!habilidades.length) {
      contenedor.appendChild(
        crearElemento("li", "cargando", "Todavía no hay habilidades cargadas.")
      );
      return;
    }

    habilidades.forEach((habilidad) => {
      const item = crearElemento("li", "habilidad");
      item.appendChild(crearElemento("span", "habilidad-nombre", habilidad.nombre));

      const meta = crearElemento("span", "habilidad-meta");
      meta.appendChild(
        crearElemento(
          "span",
          "tag",
          ETIQUETAS_CATEGORIA[habilidad.categoria] || habilidad.categoria
        )
      );
      meta.appendChild(
        crearElemento(
          "span",
          "nivel nivel-" + habilidad.nivel,
          ETIQUETAS_NIVEL[habilidad.nivel] || habilidad.nivel
        )
      );

      item.appendChild(meta);
      contenedor.appendChild(item);
    });
  } catch (error) {
    contenedor.innerHTML = "";
    contenedor.appendChild(
      crearElemento("li", "cargando", "No se pudieron cargar las habilidades.")
    );
  }
}

async function cargarFormacionPublica() {
  const contenedor = $("listaFormacion");
  if (!contenedor) return;

  try {
    const registros = await api("/api/formacion");
    contenedor.innerHTML = "";

    if (!registros.length) {
      contenedor.appendChild(
        crearElemento("p", "cargando", "Todavía no hay formación cargada.")
      );
      return;
    }

    registros.forEach((registro) => {
      const tarjeta = crearElemento("article", "formacion-item");

      tarjeta.appendChild(crearElemento("h3", null, registro.titulo));
      tarjeta.appendChild(
        crearElemento("p", "formacion-institucion", registro.institucion)
      );
      tarjeta.appendChild(
        crearElemento(
          "span",
          "formacion-fechas",
          formatearRango(registro.fechaInicio, registro.fechaFin, registro.enCurso)
        )
      );
      tarjeta.appendChild(crearElemento("p", null, registro.descripcion));

      contenedor.appendChild(tarjeta);
    });
  } catch (error) {
    contenedor.innerHTML = "";
    contenedor.appendChild(
      crearElemento("p", "cargando", "No se pudo cargar la formación académica.")
    );
  }
}

async function recargarTodo() {
  await Promise.allSettled([
    cargarProyectosPublicos(),
    cargarHabilidadesPublicas(),
    cargarFormacionPublica(),
    estado.usuario?.rol === "admin" ? cargarAdmin() : Promise.resolve(),
  ]);
}

/* ============================ ADMINISTRACIÓN ============================ */

function activarTab(nombre) {
  document.querySelectorAll(".tab").forEach((tab) => {
    const activo = tab.dataset.tab === nombre;
    tab.classList.toggle("activo", activo);
    tab.setAttribute("aria-selected", String(activo));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("oculto", panel.id !== "tab-" + nombre);
  });
}

async function cargarAdmin() {
  if (estado.usuario?.rol !== "admin") return;

  await Promise.allSettled([
    cargarTablaProyectos(),
    cargarTablaHabilidades(),
    cargarTablaFormacion(),
  ]);
}

/* ---------- Tabla de proyectos ---------- */

async function cargarTablaProyectos() {
  const tbody = $("tablaProyectos");
  if (!tbody) return;

  try {
    const proyectos = await api("/api/proyectos");
    estado.proyectosAdmin = proyectos;
    tbody.innerHTML = "";

    if (!proyectos.length) {
      tbody.appendChild(filaVacia(4, "No hay proyectos cargados."));
      return;
    }

    proyectos.forEach((proyecto) => {
      const fila = document.createElement("tr");

      fila.appendChild(celda(proyecto.nombre));
      fila.appendChild(
        celdaCon(
          crearElemento(
            "span",
            "estado estado-" + proyecto.estado,
            ETIQUETAS_ESTADO[proyecto.estado] || proyecto.estado
          )
        )
      );
      fila.appendChild(
        celda(proyecto.tecnologias.join(", "), "tecnologias-tabla")
      );

      fila.appendChild(
        celdaCon(
          accionesTabla(
            () => cargarProyectoEnFormulario(proyecto.id),
            () => eliminarProyecto(proyecto.id)
          )
        )
      );

      tbody.appendChild(fila);
    });
  } catch (error) {
    tbody.innerHTML = "";
    tbody.appendChild(filaVacia(4, mensajeDeError(error)));
  }
}

function cargarProyectoEnFormulario(id) {
  const proyecto = estado.proyectosAdmin.find((p) => p.id === id);
  if (!proyecto) return;

  $("proyectoId").value = proyecto.id;
  $("pNombre").value = proyecto.nombre;
  $("pDescripcion").value = proyecto.descripcion;
  $("pTecnologias").value = proyecto.tecnologias.join(", ");
  $("pImagen").value = proyecto.imagenUrl || "";
  $("pEnlace").value = proyecto.enlaceUrl || "";
  $("pEstado").value = proyecto.estado;

  $("tituloGestion").textContent = "Editar proyecto";
  $("btnCancelarEdicion").hidden = false;
  setError($("errorProyecto"), "");
  activarTab("proyectos");
  $("formProyecto").scrollIntoView({ behavior: "smooth", block: "center" });
}

function limpiarFormularioProyecto() {
  $("formProyecto").reset();
  $("proyectoId").value = "";
  $("tituloGestion").textContent = "Agregar nuevo proyecto";
  $("btnCancelarEdicion").hidden = true;
  setError($("errorProyecto"), "");
}

async function guardarProyecto(evento) {
  evento.preventDefault();

  const id = $("proyectoId").value;
  const datos = {
    nombre: $("pNombre").value.trim(),
    descripcion: $("pDescripcion").value.trim(),
    tecnologias: $("pTecnologias").value.trim(),
    imagenUrl: $("pImagen").value.trim(),
    enlaceUrl: $("pEnlace").value.trim(),
    estado: $("pEstado").value,
  };

  setError($("errorProyecto"), "");

  try {
    await api(id ? `/api/proyectos/${id}` : "/api/proyectos", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(datos),
    });

    limpiarFormularioProyecto();
    await recargarTodo();
    mostrarToast(id ? "Proyecto actualizado." : "Proyecto creado.");
  } catch (error) {
    setError($("errorProyecto"), mensajeDeError(error));
  }
}

async function eliminarProyecto(id) {
  if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;

  try {
    await api(`/api/proyectos/${id}`, { method: "DELETE" });
    await recargarTodo();
    mostrarToast("Proyecto eliminado.");
  } catch (error) {
    mostrarToast(mensajeDeError(error), true);
  }
}

/* ---------- Tabla de habilidades ---------- */

async function cargarTablaHabilidades() {
  const tbody = $("tablaHabilidades");
  if (!tbody) return;

  try {
    const habilidades = await api("/api/habilidades");
    estado.habilidadesAdmin = habilidades;
    tbody.innerHTML = "";

    if (!habilidades.length) {
      tbody.appendChild(filaVacia(4, "No hay habilidades cargadas."));
      return;
    }

    habilidades.forEach((habilidad) => {
      const fila = document.createElement("tr");

      fila.appendChild(celda(habilidad.nombre));
      fila.appendChild(
        celda(ETIQUETAS_CATEGORIA[habilidad.categoria] || habilidad.categoria)
      );
      fila.appendChild(
        celdaCon(
          crearElemento(
            "span",
            "nivel nivel-" + habilidad.nivel,
            ETIQUETAS_NIVEL[habilidad.nivel] || habilidad.nivel
          )
        )
      );
      fila.appendChild(
        celdaCon(
          accionesTabla(
            () => cargarHabilidadEnFormulario(habilidad.id),
            () => eliminarHabilidad(habilidad.id)
          )
        )
      );

      tbody.appendChild(fila);
    });
  } catch (error) {
    tbody.innerHTML = "";
    tbody.appendChild(filaVacia(4, mensajeDeError(error)));
  }
}

function cargarHabilidadEnFormulario(id) {
  const habilidad = estado.habilidadesAdmin.find((h) => h.id === id);
  if (!habilidad) return;

  $("habilidadId").value = habilidad.id;
  $("hNombre").value = habilidad.nombre;
  $("hCategoria").value = habilidad.categoria;
  $("hNivel").value = habilidad.nivel;

  $("tituloHabilidad").textContent = "Editar habilidad o tecnología";
  $("btnCancelarHabilidad").hidden = false;
  setError($("errorHabilidad"), "");
  activarTab("habilidades");
  $("formHabilidad").scrollIntoView({ behavior: "smooth", block: "center" });
}

function limpiarFormularioHabilidad() {
  $("formHabilidad").reset();
  $("habilidadId").value = "";
  $("tituloHabilidad").textContent = "Agregar habilidad o tecnología";
  $("btnCancelarHabilidad").hidden = true;
  setError($("errorHabilidad"), "");
}

async function guardarHabilidad(evento) {
  evento.preventDefault();

  const id = $("habilidadId").value;
  const datos = {
    nombre: $("hNombre").value.trim(),
    categoria: $("hCategoria").value,
    nivel: $("hNivel").value,
  };

  setError($("errorHabilidad"), "");

  try {
    await api(id ? `/api/habilidades/${id}` : "/api/habilidades", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(datos),
    });

    limpiarFormularioHabilidad();
    await recargarTodo();
    mostrarToast(id ? "Habilidad actualizada." : "Habilidad creada.");
  } catch (error) {
    setError($("errorHabilidad"), mensajeDeError(error));
  }
}

async function eliminarHabilidad(id) {
  if (!confirm("¿Eliminar esta habilidad?")) return;

  try {
    await api(`/api/habilidades/${id}`, { method: "DELETE" });
    await recargarTodo();
    mostrarToast("Habilidad eliminada.");
  } catch (error) {
    mostrarToast(mensajeDeError(error), true);
  }
}

/* ---------- Tabla de formación ---------- */

async function cargarTablaFormacion() {
  const tbody = $("tablaFormacion");
  if (!tbody) return;

  try {
    const registros = await api("/api/formacion");
    estado.formacionAdmin = registros;
    tbody.innerHTML = "";

    if (!registros.length) {
      tbody.appendChild(filaVacia(4, "No hay formación cargada."));
      return;
    }

    registros.forEach((registro) => {
      const fila = document.createElement("tr");

      fila.appendChild(celda(registro.institucion));
      fila.appendChild(celda(registro.titulo));
      fila.appendChild(
        celda(
          formatearRango(registro.fechaInicio, registro.fechaFin, registro.enCurso)
        )
      );
      fila.appendChild(
        celdaCon(
          accionesTabla(
            () => cargarFormacionEnFormulario(registro.id),
            () => eliminarFormacion(registro.id)
          )
        )
      );

      tbody.appendChild(fila);
    });
  } catch (error) {
    tbody.innerHTML = "";
    tbody.appendChild(filaVacia(4, mensajeDeError(error)));
  }
}

function cargarFormacionEnFormulario(id) {
  const registro = estado.formacionAdmin.find((f) => f.id === id);
  if (!registro) return;

  $("formacionId").value = registro.id;
  $("fInstitucion").value = registro.institucion;
  $("fTitulo").value = registro.titulo;
  $("fDescripcion").value = registro.descripcion;
  $("fFechaInicio").value = registro.fechaInicio;
  $("fFechaFin").value = registro.fechaFin || "";
  $("fEnCurso").checked = registro.enCurso;
  actualizarFechaFin();

  $("tituloFormacion").textContent = "Editar formación académica";
  $("btnCancelarFormacion").hidden = false;
  setError($("errorFormacion"), "");
  activarTab("formacion");
  $("formFormacion").scrollIntoView({ behavior: "smooth", block: "center" });
}

function limpiarFormularioFormacion() {
  $("formFormacion").reset();
  $("formacionId").value = "";
  $("tituloFormacion").textContent = "Agregar formación académica";
  $("btnCancelarFormacion").hidden = true;
  actualizarFechaFin();
  setError($("errorFormacion"), "");
}

// Si "en curso" está marcado, la fecha de fin se deshabilita.
function actualizarFechaFin() {
  const enCurso = $("fEnCurso").checked;
  $("fFechaFin").disabled = enCurso;
  if (enCurso) $("fFechaFin").value = "";
}

async function guardarFormacion(evento) {
  evento.preventDefault();

  const id = $("formacionId").value;
  const enCurso = $("fEnCurso").checked;
  const datos = {
    institucion: $("fInstitucion").value.trim(),
    titulo: $("fTitulo").value.trim(),
    descripcion: $("fDescripcion").value.trim(),
    fechaInicio: $("fFechaInicio").value,
    fechaFin: enCurso ? "" : $("fFechaFin").value,
    enCurso,
  };

  setError($("errorFormacion"), "");

  try {
    await api(id ? `/api/formacion/${id}` : "/api/formacion", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(datos),
    });

    limpiarFormularioFormacion();
    await recargarTodo();
    mostrarToast(id ? "Formación actualizada." : "Formación creada.");
  } catch (error) {
    setError($("errorFormacion"), mensajeDeError(error));
  }
}

async function eliminarFormacion(id) {
  if (!confirm("¿Eliminar este registro de formación?")) return;

  try {
    await api(`/api/formacion/${id}`, { method: "DELETE" });
    await recargarTodo();
    mostrarToast("Registro de formación eliminado.");
  } catch (error) {
    mostrarToast(mensajeDeError(error), true);
  }
}

/* ---------- Helpers de tablas ---------- */

function celda(texto, clase) {
  const td = document.createElement("td");
  if (clase) td.className = clase;
  td.textContent = texto;
  return td;
}

function celdaCon(elemento) {
  const td = document.createElement("td");
  td.appendChild(elemento);
  return td;
}

function filaVacia(columnas, mensaje) {
  const fila = document.createElement("tr");
  const td = celda(mensaje, "tabla-vacia");
  td.colSpan = columnas;
  fila.appendChild(td);
  return fila;
}

function accionesTabla(alEditar, alEliminar) {
  const contenedor = crearElemento("div", "tabla-acciones");

  const btnEditar = crearElemento("button", "boton boton-mini boton-claro", "Editar");
  btnEditar.type = "button";
  btnEditar.addEventListener("click", alEditar);

  const btnEliminar = crearElemento(
    "button",
    "boton boton-mini boton-peligro",
    "Eliminar"
  );
  btnEliminar.type = "button";
  btnEliminar.addEventListener("click", alEliminar);

  contenedor.appendChild(btnEditar);
  contenedor.appendChild(btnEliminar);
  return contenedor;
}

/* ============================ CONTACTO ============================ */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarContacto() {
  let valido = true;

  const nombre = $("nombre");
  const email = $("email");
  const mensaje = $("mensaje");

  if (!nombre.value.trim()) {
    setError($("errorNombre"), "El nombre es obligatorio.");
    valido = false;
  } else {
    setError($("errorNombre"), "");
  }

  if (!EMAIL_REGEX.test(email.value.trim())) {
    setError($("errorEmail"), "Ingrese un email válido.");
    valido = false;
  } else {
    setError($("errorEmail"), "");
  }

  if (mensaje.value.trim().length < 10) {
    setError($("errorMensaje"), "El mensaje debe tener al menos 10 caracteres.");
    valido = false;
  } else {
    setError($("errorMensaje"), "");
  }

  return valido;
}

function inicializarContacto() {
  const form = $("formContacto");
  if (!form) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    $("avisoExito").classList.add("oculto");

    if (validarContacto()) {
      $("avisoExito").classList.remove("oculto");
      form.reset();
      $("contador").textContent = "0 caracteres";
    }
  });

  $("mensaje").addEventListener("input", () => {
    $("contador").textContent = $("mensaje").value.length + " caracteres";
    if ($("mensaje").value.trim().length >= 10) {
      setError($("errorMensaje"), "");
    }
  });

  ["nombre", "email", "mensaje"].forEach((id) => {
    $(id).addEventListener("input", () => {
      const errores = {
        nombre: "errorNombre",
        email: "errorEmail",
        mensaje: "errorMensaje",
      };
      setError($(errores[id]), "");
    });
  });
}

/* ============================ INTERFAZ GENERAL ============================ */

function inicializarInterfaz() {
  // Botón "Ver más" de la sección Sobre mí.
  let extraVisible = false;
  $("btnVerMas").addEventListener("click", () => {
    extraVisible = !extraVisible;
    $("infoExtra").classList.toggle("oculto", !extraVisible);
    $("btnVerMas").textContent = extraVisible ? "Ver menos" : "Ver más";
  });

  // Botón "Ver mis proyectos".
  $("btnProyectos").addEventListener("click", () => {
    $("proyectos").scrollIntoView({ behavior: "smooth" });
  });

  // Botón para volver arriba (posicionamiento fijo).
  $("btnSubir").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    $("btnSubir").classList.toggle("mostrar", window.scrollY > 200);
  });

  // Marca el enlace activo según la sección visible.
  const navLinks = document.querySelectorAll(".nav a[href^='#']");
  const secciones = document.querySelectorAll("main section:not(#admin)");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle(
                "activo",
                link.getAttribute("href") === "#" + entrada.target.id
              );
            });
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0.2 }
    );

    secciones.forEach((seccion) => observer.observe(seccion));
  }

  // Pestañas del panel de administración.
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => activarTab(tab.dataset.tab));
  });
}

function inicializarLogin() {
  const dialogo = $("dialogoLogin");

  $("btnAbrirLogin").addEventListener("click", () => {
    setError($("loginError"), "");
    dialogo.showModal();
    $("loginIdentificador").focus();
  });

  $("btnCerrarLogin").addEventListener("click", () => dialogo.close());
  $("btnSalir").addEventListener("click", cerrarSesion);
  $("btnIrPanel").addEventListener("click", mostrarAdmin);
  $("formLogin").addEventListener("submit", iniciarSesion);

  // Cerrar al hacer clic fuera del contenido del diálogo.
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
}

function inicializarFormulariosAdmin() {
  $("formProyecto").addEventListener("submit", guardarProyecto);
  $("btnCancelarEdicion").addEventListener("click", limpiarFormularioProyecto);

  $("formHabilidad").addEventListener("submit", guardarHabilidad);
  $("btnCancelarHabilidad").addEventListener("click", limpiarFormularioHabilidad);

  $("formFormacion").addEventListener("submit", guardarFormacion);
  $("btnCancelarFormacion").addEventListener("click", limpiarFormularioFormacion);
  $("fEnCurso").addEventListener("change", actualizarFechaFin);
}

/* ============================ INICIO ============================ */

async function iniciar() {
  inicializarInterfaz();
  inicializarContacto();
  inicializarLogin();
  inicializarFormulariosAdmin();
  actualizarFechaFin();

  await restaurarSesion();
  await recargarTodo();
}

document.addEventListener("DOMContentLoaded", iniciar);
