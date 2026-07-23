# Plan de Ejecución y Stack Técnico — WhatsApp Order Notification

## 1. Resumen del proyecto

Aplicación de aprendizaje que permite registrar clientes y notificarles automáticamente por WhatsApp cuando su pedido está listo. Alcance intencionalmente reducido: **solo CRUD de clientes**, sin autenticación, sin usuarios, sin productos ni pedidos. El objetivo es aprender la integración entre ASP.NET Core, PostgreSQL y n8n, y tener un proyecto funcional de portafolio.

---

## 2. Stack técnico

### Backend

| Tecnología | Rol |
|---|---|
| ASP.NET Core 8 | API REST |
| Entity Framework Core | ORM / acceso a datos |
| PostgreSQL | Base de datos |
| Swagger | Documentación/exploración de la API |

Arquitectura por capas simple (sin Clean Architecture):

```
Controllers   -> exponen los endpoints HTTP
Services      -> lógica de negocio (validaciones, orquestación del webhook)
Repositories  -> acceso a datos vía EF Core
Data          -> DbContext, entidades, migraciones
```

### Frontend

| Tecnología | Rol |
|---|---|
| Next.js | Framework de la SPA (una sola pantalla) |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos |
| React Hook Form | Manejo de formularios (crear/editar cliente) |

### Automatización

| Tecnología | Rol |
|---|---|
| n8n | Workflow que recibe el webhook del backend |
| Evolution API | Envío del mensaje de WhatsApp |

### Herramientas de desarrollo sugeridas

- **Docker Compose**: levantar PostgreSQL y n8n localmente sin instalación manual.
- **dotnet-ef**: generar y aplicar migraciones.
- **.env / User Secrets**: connection string de PostgreSQL y URL del webhook de n8n.

---

## 3. Modelo de datos

Tabla `Customer`:

| Campo | Tipo | Notas |
|---|---|---|
| Id | int/guid | PK |
| Name | string | requerido, no vacío |
| Document | string | requerido, **único** (cédula) |
| Phone | string | requerido, no vacío |
| Status | enum/string | `Pendiente` \| `Listo` — default `Pendiente` |
| CreatedAt | datetime | asignado al crear |

Reglas de negocio:
- No se permiten teléfonos ni nombres vacíos.
- No se permiten cédulas duplicadas.
- El botón "Marcar como listo" solo está disponible si `Status = Pendiente`.
- Tras notificar por WhatsApp, `Status` pasa a `Listo`.

---

## 4. Contrato de API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/customers` | Listar todos los clientes |
| POST | `/customers` | Crear cliente (Nombre, Cédula, Teléfono; estado por defecto `Pendiente`) |
| PUT | `/customers/{id}` | Editar Nombre, Cédula, Teléfono |
| DELETE | `/customers/{id}` | Eliminar cliente |
| POST | `/customers/{id}/ready` | Cambiar estado a `Listo` y disparar notificación |

Payload que el backend envía al webhook de n8n al llamar `POST /customers/{id}/ready`:

```json
{
    "name": "Juan Pérez",
    "phone": "573103620056"
}
```

Flujo: Backend → Webhook n8n → Evolution API → WhatsApp → Cliente recibe el mensaje de plantilla ("Hola {nombre} 👋, tu pedido ya está listo...").

---

## 5. Plan de ejecución por fases

**Fase 0 — Setup**
- Crear solución .NET (proyecto Web API) y proyecto Next.js.
- `docker-compose.yml` con PostgreSQL (y opcionalmente n8n).
- Estructura de carpetas del backend: `Controllers/`, `Services/`, `Repositories/`, `Data/`.

**Fase 1 — Backend base**
- Entidad `Customer` y `DbContext`.
- Migración inicial y creación de la tabla en PostgreSQL.
- Capas `Repositories` (acceso a datos) y `Services` (lógica de negocio) conectadas.

**Fase 2 — Endpoints CRUD**
- Implementar `GET/POST/PUT/DELETE /customers`.
- Validaciones: nombre y teléfono no vacíos, cédula única.
- Configurar Swagger para explorar la API.

**Fase 3 — Endpoint de notificación**
- Implementar `POST /customers/{id}/ready`.
- Al invocarse: validar que el estado sea `Pendiente`, cambiar a `Listo`, y hacer POST al webhook de n8n con `{ name, phone }`.

**Fase 4 — Automatización n8n + Evolution API** *(parcialmente completada)*
- Crear workflow en n8n que reciba el webhook. ✅ Hecho y probado (`Webhook` → `HTTP Request`).
- Conectar con Evolution API para enviar el mensaje de WhatsApp con la plantilla definida. ⏳ Pendiente: el nodo HTTP Request tiene URL y `apikey` en placeholder a la espera de las credenciales reales de Evolution API (ver [`README.md`](./README.md#pendiente-credenciales-de-evolution-api)).

**Fase 5 — Frontend**
- Pantalla única: tabla de clientes (Nombre, Cédula, Teléfono, Estado, Acciones).
- Botón superior "Nuevo cliente" con formulario (React Hook Form).
- Acciones por fila: Editar, Eliminar, Marcar como listo (deshabilitado si `Status = Listo`).
- Consumo de la API del backend (fetch/axios).

**Fase 6 — Integración y pruebas end-to-end**
- Probar el flujo completo: crear cliente → marcar como listo → recibir WhatsApp.
- Manejo básico de errores (cédula duplicada, campos vacíos, fallos de red al webhook).

**Fase 7 — Documentación y cierre**
- README con instrucciones de setup (docker-compose, backend, frontend, n8n).
- Capturas de pantalla y notas de aprendizaje para el portafolio.

---

## 6. Riesgos y consideraciones

- **Evolution API** requiere un número de WhatsApp previamente conectado/autenticado antes de poder enviar mensajes.
- **CORS**: habilitar en el backend para que Next.js (otro origen/puerto) pueda consumir la API.
- **Configuración sensible**: connection string de PostgreSQL y URL del webhook de n8n deben ir en variables de entorno, nunca hardcodeadas.
- **n8n**: si corre en Docker, verificar que la URL del webhook sea accesible desde el backend (red del contenedor vs. `localhost`).
