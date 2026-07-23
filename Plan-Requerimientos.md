# Proyecto: WhatsApp Order Notification

## Objetivo

Desarrollar una aplicación sencilla que permita registrar clientes y enviar automáticamente una notificación por WhatsApp cuando su pedido esté listo.

El propósito es aprender integración entre ASP.NET Core, PostgreSQL y n8n, además de tener un proyecto funcional para el portafolio.

---

# Stack Tecnológico

## Backend

- ASP.NET Core 8
- Entity Framework Core
- PostgreSQL
- Swagger

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React Hook Form

## Automatización

- n8n
- Evolution API (WhatsApp)

---

# Alcance

El sistema tendrá únicamente un CRUD de clientes.

No habrá autenticación.

No habrá usuarios.

No habrá productos.

No habrá pedidos.

El único objetivo es registrar clientes y notificarles por WhatsApp.

---

# Cliente

Campos

- Id
- Nombre
- Cédula
- Teléfono
- Estado

Estado

- Pendiente
- Listo

---

# Funcionalidades

## Listar clientes

Mostrar todos los clientes registrados.

---

## Crear cliente

Campos requeridos

- Nombre
- Cédula
- Teléfono

El estado por defecto será:

Pendiente

---

## Editar cliente

Permitir modificar

- Nombre
- Cédula
- Teléfono

---

## Eliminar cliente

Eliminar un cliente.

---

## Cambiar estado

Cada cliente tendrá un botón:

"Marcar como listo"

Cuando el usuario haga clic:

- Cambiar Estado = Listo
- Enviar un POST al webhook de n8n

---

# Webhook

Endpoint

POST /api/customers/{id}/ready

El backend enviará:

```json
{
    "name": "Juan Pérez",
    "phone": "573103620056"
}
```

---

# Flujo

Empleado registra cliente

↓

Estado = Pendiente

↓

Cuando el pedido está listo

↓

Click en

"Marcar como listo"

↓

Backend llama Webhook n8n

↓

n8n

↓

Evolution API

↓

WhatsApp

↓

Cliente recibe

Hola Juan 👋

Tu pedido ya está listo.

Puedes acercarte al mostrador.

¡Buen provecho!

---

# Base de datos

Customer

- Id
- Name
- Document
- Phone
- Status
- CreatedAt

---

# API

GET /customers

POST /customers

PUT /customers/{id}

DELETE /customers/{id}

POST /customers/{id}/ready

---

# Diseño

Una sola pantalla.

Tabla con:

Nombre

Cédula

Teléfono

Estado

Acciones

Editar

Eliminar

Marcar como listo

Botón superior

Nuevo cliente

---

# Reglas

No permitir teléfonos vacíos.

No permitir nombres vacíos.

No permitir cédulas duplicadas.

El botón "Marcar como listo" solo estará disponible si el estado es Pendiente.

Después de enviar la notificación el estado cambiará a Listo.

---

# Objetivo del proyecto

Aprender:

- ASP.NET Core
- PostgreSQL
- Entity Framework
- Next.js
- Integración HTTP
- Webhooks
- n8n
- Evolution API
- Automatización de WhatsApp

El código debe ser limpio y organizado utilizando una arquitectura por capas sencilla (Controllers, Services, Repositories y Data), sin aplicar Clean Architecture para mantener el proyecto simple y fácil de entender.