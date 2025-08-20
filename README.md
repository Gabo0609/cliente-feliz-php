# Cliente Feliz – API (Backend)

API REST para gestionar ofertas laborales y postulaciones, con historial de estados.
Stack: **Node.js + Express + PostgreSQL + pg**. Tests con **Jest + Supertest**.

> Nota: Este README consolida y ordena el contenido original con formato consistente, ejemplos de código y secciones claras.

---

## Tabla de contenidos

- [Requisitos](#requisitos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación](#instalación)
- [Migraciones (DB)](#migraciones-db)
- [Scripts de arranque](#scripts-de-arranque)
- [Documentación Swagger](#documentación-swagger)
- [Orden recomendado de inicio](#orden-recomendado-de-inicio)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Patrón de diseño aplicado](#patrón-de-diseño-aplicado)
- [CE1 — Especificación de Endpoints](#ce1--especificación-de-endpoints)
  - [1) Healthcheck — GET /api/v1/health](#1-healthcheck--get-apiv1health)
  - [2) Crear oferta — POST /api/v1/ofertas](#2-crear-oferta--post-apiv1ofertas)
  - [3) Listar ofertas — GET /api/v1/ofertas](#3-listar-ofertas--get-apiv1ofertas)
  - [4) Actualizar oferta — PUT /api/v1/ofertasid](#4-actualizar-oferta--put-apiv1ofertasid)
  - [5) Desactivar oferta (soft) — DELETE /api/v1/ofertasid](#5-desactivar-oferta-soft--delete-apiv1ofertasid)
  - [6) Crear postulación — POST /api/v1/postulaciones](#6-crear-postulación--post-apiv1postulaciones)
  - [7) Cambiar estado de postulación — PATCH /api/v1/postulacionesidestado](#7-cambiar-estado-de-postulación--patch-apiv1postulacionesidestado)
  - [8) Historial de postulación — GET /api/v1/postulacionesidcambios](#8-historial-de-postulación--get-apiv1postulacionesidcambios)
  - [9) Postulantes por oferta — GET /api/v1/ofertasidpostulantes](#9-postulantes-por-oferta--get-apiv1ofertasidpostulantes)
- [Notas generales (API)](#notas-generales-api)
- [Tests (Jest + Supertest)](#tests-jest--supertest)
- [Colección Postman (CE6)](#colección-postman-ce6)

---

## Requisitos

- **Node 18+** (recomendado **20+**)
- **PostgreSQL 13+**
- **pnpm / npm / yarn** (ejemplos con `npm`)

## Variables de entorno

Crea un archivo `.env` a partir de `.env.example`:

```env
DATABASE_URL=postgres://user:pass@localhost:5432/cliente_feliz
PORT=5080
NODE_ENV=development
```

## Instalación

```bash
npm i
```

## Migraciones (DB)

Usando `node-pg-migrate`:

```bash
# Crear archivo de migración (interactivo: pide nombre en CLI)
npm run migrate:create

# Aplicar migraciones
npm run migrate:up

# Revertir migraciones
npm run migrate:down
```

## Scripts de arranque

## Documentación Swagger

Para ver la documentación interactiva (Swagger UI), abre tu navegador y visita:

- <http://localhost:5080/api-docs/>

> Asegúrate de tener el servidor corriendo. Por defecto, el puerto es **5080**.

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción (sin nodemon)
npm start

# Tests (Jest + Supertest)
npm test
```

## Orden recomendado de inicio

1. Configurar `.env`
2. `npm i`
3. `npm run migrate:up`
4. `npm run dev`
5. Probar en Postman / ejecutar tests

## Estructura del proyecto

```text
backend/
├─ src/
│  ├─ app.js               # instancia de Express (sin listen)
│  ├─ server.js            # arranque del servidor + manejo de errores
│  ├─ docs
│  │  └─ swagger.js
│  ├─ routes/
│  │  ├─ health.routes.js
│  │  ├─ ofertas.routes.js
│  │  └─ postulaciones.routes.js
│  ├─ controllers/
│  │  ├─ ofertas.controller.js
│  │  └─ postulaciones.controller.js
│  ├─ services/
│  │  ├─ ofertas.service.js
│  │  └─ postulaciones.service.js
│  ├─ db/
│  │  ├─ pool.js           # pool de conexiones pg
│  │  └─ tx.js             # helper de transacciones (BEGIN/COMMIT/ROLLBACK)
│  ├─ middlewares/
│  │  ├─ errorHandler.js
│  │  └─ validators.js     # validador simple (query, params, body)
│  └─ utils/
│     └─ logger.js
├─ migrations/             # node-pg-migrate
├─ tests/
│  ├─ helpers/testUtils.js
│  ├─ ofertas.e2e.test.js
│  └─ postulaciones.e2e.test.js
├─ .env
├─ .env.example
├─ package.json
└─ README.md
```

## Patrón de diseño aplicado

**Arquitectura en Capas** con **Transaction Script (Vertical Slice)**:

- **Routes**: definen endpoints y validan el “shape” básico.
- **Controllers**: traducen HTTP ⇄ aplicación (status codes, parseo).
- **Services**: lógica de negocio (reglas, validaciones de dominio, orquestación de operaciones y transacciones).
- No se crean `repositories/`; los services hablan directo con `pg` para mantener simplicidad. Si el proyecto crece, es fácil extraer `repositories/` sin romper la API.
- **db/tx**: helpers de DB y transacciones.

**Ventajas**: código simple, testeable y alineado a la rúbrica (CRUD, validación, transacciones, documentación).

---

## CE1 — Especificación de Endpoints

**Prefijo global**: `/api/v1`  
**Content-Type**: `application/json`

**Errores comunes**:

- `422` ValidationError
- `404` NotFound
- `409` Conflicto / duplicado

### 1) Healthcheck — GET `/api/v1/health`

**Descripción**: Verifica que el servicio esté vivo.

**Request body**: —

**Response 200**

```json
{ "status": "ok" }
```

**Errores**: —  
**Notas**: Útil para monitoreo.

---

### 2) Crear oferta — POST `/api/v1/ofertas`

**Descripción**: Crea una nueva oferta laboral (**activa** por defecto).

**Request body**

```json
{
  "titulo": "Agente Call Center",
  "descripcion": "Atender clientes y registrar casos.",
  "location": "Santiago"
}
```

**Response 201**

```json
{
  "id": 1,
  "titulo": "Agente Call Center",
  "descripcion": "Atender clientes y registrar casos.",
  "location": "Santiago",
  "is_active": true,
  "created_at": "2025-08-18T15:00:00.000Z"
}
```

**Errores**: `422` (campos requeridos / formato)  
**Notas**: validación de longitud mínima en `descripcion`.

---

### 3) Listar ofertas — GET `/api/v1/ofertas?activas=true&page=1&limit=10`

**Descripción**: Lista ofertas con paginación. `activas=true` filtra solo vigentes.  
Admite `search` (texto) y otros query params definidos en la ruta.

**Request body**: —

**Response 200**

```json
[
  {
    "id": 1,
    "titulo": "Agente Call Center",
    "descripcion": "Atender clientes y registrar casos.",
    "location": "Santiago",
    "is_active": true,
    "created_at": "2025-08-18T15:00:00.000Z"
  }
]
```

**Errores**: `422` (query inválida)

---

### 4) Actualizar oferta — PUT `/api/v1/ofertas/:id`

**Descripción**: Actualiza campos de la oferta (actualización parcial soportada).

**Request body** _(alguno de los siguientes)_

```json
{ "titulo": "Agente Senior", "location": "Santiago Centro", "is_active": true }
```

**Response 200**

```json
{
  "id": 1,
  "titulo": "Agente Senior",
  "descripcion": "Atender clientes y registrar casos.",
  "location": "Santiago Centro",
  "is_active": true,
  "created_at": "2025-08-18T15:00:00.000Z"
}
```

**Errores**: `404` (no existe), `422` (body inválido)

---

### 5) Desactivar oferta (soft) — DELETE `/api/v1/ofertas/:id`

**Descripción**: Marca `is_active=false` (soft delete).

**Request body**: —

**Response 204**: sin contenido

**Errores**: `404` (no existe)  
**Notas**: No borra registros físicos.

---

### 6) Crear postulación — POST `/api/v1/postulaciones`

**Descripción**: Crea la postulación; si el email de postulante existe, se actualiza (**upsert**).

**Request body**

```json
{
  "oferta_id": 1,
  "postulante": {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "999-999-999"
  }
}
```

**Response 201**

```json
{
  "postulacion": {
    "id": 5,
    "oferta_id": 1,
    "postulante_id": 3,
    "estado": "POSTULANDO",
    "created_at": "2025-08-18T15:40:00.000Z"
  },
  "postulante": {
    "id": 3,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "999-999-999"
  }
}
```

**Errores**: `404` (oferta no existe), `409` (ya postuló a esa oferta), `422` (body inválido)  
**Notas**: valida unicidad `(oferta_id, postulante_id)`.

---

### 7) Cambiar estado de postulación — PATCH `/api/v1/postulaciones/:id/estado`

**Descripción**: Cambia estado y registra comentario en `cambios_estado` (transacción).

**Request body**

```json
{ "estado_nuevo": "REVISANDO", "comentario": "CV ok. Pasa a revisión." }
```

**Response 200**

```json
{
  "postulacion": {
    "id": 5,
    "oferta_id": 1,
    "postulante_id": 3,
    "estado": "REVISANDO",
    "created_at": "2025-08-18T15:40:00.000Z"
  },
  "cambio": {
    "id": 7,
    "postulacion_id": 5,
    "estado_nuevo": "REVISANDO",
    "comentario": "CV ok. Pasa a revisión.",
    "created_at": "2025-08-18T15:41:00.000Z"
  }
}
```

**Errores**: `404` (no existe), `422` (estado inválido)  
**Estados válidos**: `POSTULANDO` | `REVISANDO` | `ENTREVISTA_PSICO` | `ENTREVISTA_PERSONAL` | `SELECCIONADO` | `DESCARTADO`

---

### 8) Historial de postulación — GET `/api/v1/postulaciones/:id/cambios`

**Descripción**: Devuelve la postulación y su historial ordenado por fecha.

**Request body**: —

**Response 200**

```json
{
  "postulacion": {
    "id": 5,
    "oferta_id": 1,
    "postulante_id": 3,
    "estado": "REVISANDO"
  },
  "cambios": [
    {
      "id": 6,
      "estado_nuevo": "POSTULANDO",
      "comentario": null,
      "created_at": "..."
    },
    {
      "id": 7,
      "estado_nuevo": "REVISANDO",
      "comentario": "CV ok. Pasa a revisión.",
      "created_at": "..."
    }
  ]
}
```

**Errores**: `404` (no existe)  
**Notas**: lectura simple (sin transacción).

---

### 9) Postulantes por oferta — GET `/api/v1/ofertas/:id/postulantes`

**Descripción**: Lista postulantes asociados a una oferta, con estado actual.

**Request body**: —

**Response 200**

```json
[
  {
    "postulacion_id": 5,
    "postulante_id": 3,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "999-999-999",
    "estado": "REVISANDO",
    "postulacion_fecha": "2025-08-18T15:40:00.000Z"
  }
]
```

**Errores**: —  
**Notas**: ordenado por `created_at DESC`.

---

## Notas generales (API)

- Soft delete en **ofertas** (`is_active=false`).
- **Transacciones** en operaciones críticas (cambio de estado + historial).
- **Validación** a nivel de rutas (`middlewares/validators.js`).
- **Manejo de errores** centralizado (`middlewares/errorHandler.js`).

## Tests (Jest + Supertest)

Tests E2E básicos en `tests/`:

- `ofertas.e2e.test.js` (CRUD ofertas)
- `postulaciones.e2e.test.js` (crear, cambiar estado, historial, listar por oferta)

**Ejecutar**:

```bash
npm test
```

> Los tests usan `app` directamente (no se requiere `server.listen`). El pool se cierra con `afterAll`.

## Colección Postman (CE6)

- `GET /api/v1/health`
- `POST /api/v1/ofertas`
- `GET /api/v1/ofertas?activas=true&page=1&limit=10`
- `PUT /api/v1/ofertas/:id`
- `DELETE /api/v1/ofertas/:id`
- `POST /api/v1/postulaciones`
- `PATCH /api/v1/postulaciones/:id/estado`
- `GET /api/v1/postulaciones/:id/cambios`
- `GET /api/v1/ofertas/:id/postulantes`
