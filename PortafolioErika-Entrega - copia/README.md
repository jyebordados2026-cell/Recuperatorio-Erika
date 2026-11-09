# Portafolio Web — Erika

Aplicación web desarrollada como **recuperatorio de Programación Web 2026**. Parte del portfolio
de las etapas anteriores y le incorpora **autenticación de usuarios, validación de roles y un panel
de administración** con tres módulos CRUD: proyectos, habilidades/tecnologías y formación académica.

> Guía completa para la defensa oral (con ejemplos y referencias al código):
> **http://localhost:3000/guia.html**

---

## 1. Qué se presenta

| Componente | Descripción |
|---|---|
| **Portfolio público** | Inicio, Sobre mí, Proyectos publicados, Formación académica y Contacto. |
| **Login** | Ingreso con email o nombre de usuario + contraseña. |
| **Roles** | `admin` (gestión completa) y `visitante` (solo lectura). |
| **Panel de administración** | CRUD de proyectos, habilidades/tecnologías y formación. |
| **API REST** | Endpoints GET, POST, PUT y DELETE con validaciones y permisos. |
| **Base de datos** | SQLite con usuarios, sesiones, proyectos, habilidades y formación. |
| **Seguridad** | Contraseñas con hash scrypt + sal; sesiones con token y expiración. |

### Credenciales de demostración

| Rol | Email | Usuario | Contraseña |
|---|---|---|---|
| Administrador | `admin@erika.com` | `erika` | `Admin123!` |
| Visitante | `visitante@erika.com` | `visitante` | `Visita123!` |

> No existe registro público de usuarios: el administrador se carga previamente en la base,
> tal como permite la consigna.

---

## 2. Tecnologías

- **HTML5** semántico.
- **CSS3**: variables, Flexbox, Grid, modelo de caja, posicionamiento y media queries.
- **JavaScript** (frontend): DOM, eventos, validaciones, `fetch`, sesiones y roles.
- **TypeScript** (backend): interfaces y validaciones tipadas compiladas con `tsc`.
- **Node.js + Express** (backend): rutas, controladores y middlewares.
- **SQLite** mediante el módulo nativo `node:sqlite` (Node.js 22+).
- **Git / GitHub** para el control de versiones.

---

## 3. Estructura del proyecto

```text
PortafolioErika-Entrega/
├── frontend/
│   ├── index.html            # Portfolio + login + panel de administración
│   ├── guia.html             # Guía de defensa (temas del recuperatorio)
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── Img/
│       ├── Foto-perfil.jpeg
│       └── Foto.jpeg
├── backend/
│   ├── src/
│   │   ├── server.js         # Servidor Express
│   │   ├── db.js             # Conexión SQLite, tablas y datos iniciales
│   │   ├── auth.js           # Sesiones (crear, validar, eliminar)
│   │   ├── seguridad.js      # Hash scrypt y tokens
│   │   ├── models/           # Modelos y validaciones en TypeScript
│   │   │   ├── proyecto.ts
│   │   │   ├── habilidad.ts
│   │   │   └── formacion.ts
│   │   ├── routes/           # Rutas de la API
│   │   │   ├── auth.routes.js
│   │   │   ├── proyectos.routes.js
│   │   │   ├── habilidades.routes.js
│   │   │   └── formacion.routes.js
│   │   ├── controllers/      # Lógica de cada recurso
│   │   │   ├── auth.controller.js
│   │   │   ├── proyectos.controller.js
│   │   │   ├── habilidades.controller.js
│   │   │   └── formacion.controller.js
│   │   └── middlewares/
│   │       └── auth.js       # sesionOpcional, requiereSesion, requiereAdmin
│   ├── dist/                 # TypeScript compilado (generado por tsc)
│   ├── database/             # portfolio.db (se crea al iniciar)
│   ├── node_modules/         # Dependencias incluidas para ejecutar sin instalar
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── README.md
├── COMO-USAR.txt
└── .gitignore
```

---

## 4. Cómo ejecutar el proyecto

### Requisitos

- **Node.js 22 o superior** (se usa el módulo nativo `node:sqlite`).
- No hace falta instalar dependencias: la carpeta `node_modules` ya está incluida.

### Opción A — PowerShell (recomendada en Windows)

```powershell
cd backend
npm.cmd start
```

> En PowerShell puede estar bloqueado `npm.ps1`. Por eso se usa `npm.cmd`.
> Si aun así falla, ejecutar directamente:

```powershell
cd backend
node src/server.js
```

### Opción B — Símbolo del sistema (CMD)

```bat
cd backend
npm start
```

### Abrir el sitio

Una vez que la consola muestra:

```text
Servidor escuchando en http://localhost:3000
```

Abrir en el navegador:

- **Portfolio:** http://localhost:3000
- **Guía de defensa:** http://localhost:3000/guia.html

> Importante: abrir el sitio desde `http://localhost:3000` (no con doble clic en `index.html`)
> para que las sesiones con cookie funcionen correctamente.

### Detener el servidor

`Ctrl + C` en la consola.

### Reiniciar la base de datos

Detener el servidor, borrar `backend/database/portfolio.db` y volver a iniciarlo.
Se recrean las tablas y los datos de ejemplo (incluidos los usuarios).

---

## 5. API REST

Base: `http://localhost:3000/api`

### Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/login` | Público | Inicia sesión. Devuelve token y usuario. |
| POST | `/auth/logout` | Autenticado | Cierra la sesión y elimina el token. |
| GET | `/auth/sesion` | Público | Indica si hay sesión activa y quién es el usuario. |

### Proyectos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/proyectos` | Público | Admin: todos. Visitante: solo publicados. |
| GET | `/proyectos?estado=publicado` | Público | Filtra por estado (visitante solo puede pedir `publicado`). |
| GET | `/proyectos/:id` | Público | Detalle. Un visitante no ve borradores. |
| POST | `/proyectos` | Admin | Crea un proyecto. |
| PUT | `/proyectos/:id` | Admin | Modifica un proyecto. |
| DELETE | `/proyectos/:id` | Admin | Elimina un proyecto. |

Campos: `nombre`, `descripcion`, `tecnologias` (array o texto separado por comas), `imagenUrl`,
`enlaceUrl` y `estado` (`publicado`, `en-desarrollo` o `borrador`).

### Habilidades y tecnologías

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/habilidades` | Público | Lista todas. |
| GET | `/habilidades/:id` | Público | Detalle. |
| POST | `/habilidades` | Admin | Crea. |
| PUT | `/habilidades/:id` | Admin | Modifica. |
| DELETE | `/habilidades/:id` | Admin | Elimina. |

Campos: `nombre`, `categoria` (`lenguaje`, `framework`, `herramienta`, `base-de-datos`, `otro`) y
`nivel` (`basico`, `intermedio`, `avanzado`).

### Formación académica

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/formacion` | Público | Lista todos los registros. |
| GET | `/formacion/:id` | Público | Detalle. |
| POST | `/formacion` | Admin | Crea. |
| PUT | `/formacion/:id` | Admin | Modifica. |
| DELETE | `/formacion/:id` | Admin | Elimina. |

Campos: `institucion`, `titulo`, `descripcion`, `fechaInicio` (AAAA-MM), `fechaFin` (AAAA-MM o `null`)
y `enCurso` (booleano).

### Códigos de estado usados

- `200 OK` — consulta o actualización correcta.
- `201 Created` — recurso creado.
- `204 No Content` — eliminación o logout correcto.
- `400 Bad Request` — datos inválidos.
- `401 Unauthorized` — sin sesión o credenciales incorrectas.
- `403 Forbidden` — sesión válida pero rol sin permisos.
- `404 Not Found` — recurso inexistente.
- `500 Internal Server Error` — error no controlado.

---

## 6. Seguridad implementada

1. **Hash de contraseñas:** scrypt con sal aleatoria (`scrypt$sal$hash`); nunca se guarda texto plano.
2. **Comparación segura:** `crypto.timingSafeEqual` para evitar filtraciones por tiempo.
3. **Sesiones en base de datos:** token aleatorio de 32 bytes con vencimiento a las 8 horas.
4. **Cookie httpOnly:** el JavaScript del navegador no puede leer el token de la cookie.
5. **Token Bearer:** alternativa para pruebas desde otro origen (por ejemplo Live Server).
6. **Autorización en el servidor:** `requiereAdmin` protege todas las escrituras; no alcanza con
   ocultar botones en el frontend.
7. **Mensaje de login genérico:** no revela si falló el usuario o la contraseña.
8. **Borradores protegidos:** un visitante recibe 404 al pedir un proyecto no publicado por ID.
9. **Validación doble:** el frontend valida para mejorar la experiencia; el backend valida siempre.

> Las credenciales de demostración están pensadas para la entrega académica. En un entorno real
> se cambiarían y se agregaría HTTPS, límite de intentos y registro de auditoría.

---

## 7. Roles y permisos

| Acción | Visitante | Administrador |
|---|:---:|:---:|
| Ver portfolio público | ✅ | ✅ |
| Ver proyectos publicados | ✅ | ✅ |
| Ver habilidades y formación | ✅ | ✅ |
| Iniciar / cerrar sesión | ✅ | ✅ |
| Acceder al panel de administración | ❌ | ✅ |
| Crear / editar / eliminar proyectos | ❌ | ✅ |
| Crear / editar / eliminar habilidades | ❌ | ✅ |
| Crear / editar / eliminar formación | ❌ | ✅ |

---

## 8. Defensa del recuperatorio

La página **`/guia.html`** contiene las respuestas desarrolladas para:

1. Página web, sistema y aplicación: qué es cada uno y qué tipo de proyecto es este.
2. Modelo cliente-servidor con un ejemplo real de intercambio.
3. HTML: definición, etiquetas básicas y su ubicación en el código.
4. CSS: selectores, modelo de caja, posicionamiento y responsive, demostrado en el proyecto.
5. JavaScript: función en la web y concepto de DOM.
6. Diferencias entre JavaScript y TypeScript.
7. Métodos HTTP GET, POST, PUT y DELETE con ejemplos del proyecto y códigos de estado.
8. Manejo de usuarios y sesiones (hash, token, cookie, roles, 401/403).
9. Recorrido paso a paso para la demostración en vivo.

También se puede mostrar el intercambio real abriendo **DevTools → Network** mientras se navega,
se inicia sesión y se realizan operaciones del CRUD.

---

## 9. Git y GitHub

El proyecto conserva la separación frontend/backend y está preparado para el repositorio de la
primera etapa. Para registrar esta entrega:

```bash
git add .
git commit -m "Agrega autenticación, roles y panel de administración con CRUD"
git push origin main
```

Sugerencias de commits descriptivos:

```text
feat: agrega login con hash de contraseñas y sesiones
feat: incorpora roles admin y visitante
feat: agrega CRUD de habilidades y tecnologías
feat: agrega CRUD de formación académica
feat: protege los endpoints de escritura con middleware de rol
docs: actualiza README y guía de defensa
```

El archivo `.gitignore` excluye `node_modules/`, `dist/`, la base `.db` y `.env`.

> La carpeta `node_modules` y `dist` se incluyen en esta entrega comprimida para que el proyecto
> pueda ejecutarse sin conexión, pero no deben subirse al repositorio.

---

## 10. Solución de problemas

| Problema | Solución |
|---|---|
| `npm.ps1 no se puede cargar...` | Usar `npm.cmd start` o `node src/server.js`. |
| `EADDRINUSE` (puerto ocupado) | Cerrar el otro servidor o iniciar con `set PORT=3001` (CMD) / `$env:PORT=3001` (PowerShell). |
| `database is locked` | Cerrar otras instancias del servidor antes de iniciar una nueva. |
| No se ven los proyectos | Verificar que el backend esté corriendo en `http://localhost:3000`. |
| El panel no aparece | Iniciar sesión con la cuenta **admin**, no con la de visitante. |
| La sesión no persiste | Abrir el sitio desde `http://localhost:3000`, no desde `file://`. |
| La base quedó con datos de prueba | Detener el servidor, borrar `backend/database/portfolio.db` y reiniciar. |

---

**Autora:** Erika  
**Materia:** Programación Web  
**Institución:** INCADE · 2026
