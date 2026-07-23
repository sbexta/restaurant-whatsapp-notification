# WhatsApp Order Notification

Aplicación de aprendizaje que permite registrar clientes y notificarles automáticamente por WhatsApp cuando su pedido está listo. Proyecto de portafolio enfocado en integrar **ASP.NET Core**, **PostgreSQL**, **Next.js** y **n8n + Evolution API**.

Ver [`Plan-Requerimientos.md`](./Plan-Requerimientos.md) para el detalle de requerimientos y [`plan-cc.md`](./plan-cc.md) para el plan de ejecución y stack técnico.

## Demo

![Demo: crear cliente y marcar como listo](./docs/screenshots/demo-crear-y-marcar-listo.gif)

Flujo mostrado: pantalla vacía → crear cliente ("Juan Perez") → queda en estado `Pendiente` → clic en "Marcar como listo" → cambia a `Listo` (notificación enviada exitosamente vía un webhook simulado de n8n/Evolution API).

## Estructura del repositorio

```
backend/     API REST en ASP.NET Core 8 (Controllers, Services, Repositories, Data)
frontend/    Next.js + TypeScript + Tailwind CSS + React Hook Form
docker-compose.yml   PostgreSQL para desarrollo local
```

## Requisitos previos

- .NET 8 SDK
- Node.js 18+
- Docker (para PostgreSQL, Evolution API, Redis)
- Una instancia de [n8n](https://n8n.io/) (self-hosted o cloud)

## Puesta en marcha

### 1. Variables de entorno

```bash
cp .env.example .env
```

Define `EVOLUTION_API_KEY` (cualquier string secreto que tú elijas) — es la API key global que usará Evolution API.

### 2. Base de datos + Evolution API

```bash
docker compose up -d
```

Esto levanta:
- **postgres** (`localhost:5432`) — base de datos de la aplicación (`whatsapp_order_notification`).
- **evolution-postgres** + **evolution-redis** — dependencias internas de Evolution API.
- **evolution-api** (`localhost:8080`) — servidor de Evolution API. Manager web en `http://localhost:8080/manager` (login con la `EVOLUTION_API_KEY` de tu `.env`).

### 3. Backend

```bash
cd backend/WhatsAppOrderNotification.Api
dotnet ef database update   # aplica la migración inicial (ya incluida en el repo)
dotnet run --urls http://localhost:5199
```

- Swagger disponible en `http://localhost:5199/swagger`.
- Configuración relevante en `appsettings.json`:
  - `ConnectionStrings:DefaultConnection` — cadena de conexión a PostgreSQL.
  - `N8n:WebhookUrl` — URL del webhook de n8n que dispara la notificación de WhatsApp.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

- App disponible en `http://localhost:3000`.
- Variable de entorno en `.env.local`: `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:5199`).

### 5. n8n (automatización de WhatsApp)

El workflow **"Customer Ready Notification"** está creado, configurado y **probado con envío real de WhatsApp**, con dos nodos:

1. **Webhook** (`POST /webhook/customer-ready`) — recibe `{ "name": "...", "phone": "..." }` desde el backend.
2. **HTTP Request** → `POST http://host.docker.internal:8080/message/sendText/{instancia}` con header `apikey` y body `{ "number": "...", "text": "..." }` — envía el mensaje vía Evolution API.

El workflow debe estar **activado** ("Publish"/Active) para que la URL de producción del webhook responda.

### 6. Conectar el número de WhatsApp en Evolution API

1. Entra al Manager (`http://localhost:8080/manager`) y crea una instancia (canal **Baileys**).
2. Haz clic en la instancia → **Get QR Code**.
3. Escanea el QR con WhatsApp → Ajustes → Dispositivos vinculados → Vincular un dispositivo. El QR expira en segundos; si falla, genera uno nuevo.
4. Cuando `connectionStatus` pase a `open` (visible en el dashboard de la instancia), el número queda conectado y listo para enviar mensajes.

**Nota de red:** si n8n corre en un contenedor Docker distinto al de Evolution API (como en este proyecto), usa `http://host.docker.internal:8080` en la URL del nodo HTTP Request en vez de `localhost`, ya que ambos contenedores no comparten red por defecto.

## Flujo funcional

1. El empleado registra un cliente (queda en estado `Pendiente`).
2. Cuando el pedido está listo, hace clic en "Marcar como listo".
3. El backend cambia el estado a `Listo` y llama al webhook de n8n con `{ name, phone }`.
4. n8n reenvía el mensaje a Evolution API, que lo entrega por WhatsApp.

## Pruebas realizadas

- CRUD completo de clientes (crear, listar, editar, eliminar) probado end-to-end vía UI.
- Validaciones: nombre/teléfono/cédula obligatorios, cédula duplicada (tanto en creación como edición).
- Flujo de notificación probado primero con un servidor mock simulando a n8n/Evolution API (éxito y fallo), confirmando que el estado solo cambia a `Listo` cuando la notificación se envía correctamente.
- **Envío real de WhatsApp verificado end-to-end**: backend → webhook n8n → Evolution API → WhatsApp, con mensaje confirmado por WhatsApp (`SERVER_ACK`) y recibido en el dispositivo.
- Persistencia verificada recargando la aplicación tras cada operación.

## Aprendizajes del proyecto

- Integración de ASP.NET Core con PostgreSQL vía Entity Framework Core (migraciones, índices únicos).
- Arquitectura por capas simple (Controllers → Services → Repositories → Data) sin Clean Architecture.
- Consumo de una API REST desde Next.js (App Router) con manejo de errores tipado.
- Diseño de un webhook saliente desde el backend hacia n8n, y construcción de un workflow n8n con nodos Webhook + HTTP Request.
- Reemplazo de diálogos nativos del navegador (`alert`/`confirm`) por UI propia para evitar bloqueos y mejorar la experiencia de usuario.
- En n8n, un campo de tipo JSON con `{{ }}` debe estar en modo **Expression** (no "Fixed") para que las expresiones se evalúen en tiempo de ejecución — en modo "Fixed" el texto `{{ ... }}` se envía literal.
- Al desplegar Evolution API y n8n en contenedores Docker distintos (redes separadas), hay que usar `host.docker.internal` en vez de `localhost` para que un contenedor alcance el puerto publicado por otro en el host.
