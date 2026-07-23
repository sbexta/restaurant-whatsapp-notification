# Guía de despliegue a producción (gratis)

Arquitectura: **Frontend en Vercel** + **Backend + PostgreSQL + n8n + Evolution API en una sola VM de Google Cloud (e2-micro, Always Free)**.

## 1. Crear la VM en Google Cloud

1. Crea una cuenta en [console.cloud.google.com](https://console.cloud.google.com) (pide tarjeta solo para verificar identidad; no cobra mientras no actives facturación manual).
2. Crea un proyecto nuevo.
3. Ve a **Compute Engine → Instancias de VM → Crear instancia**:
   - **Región**: `us-west1`, `us-central1` o `us-east1` (las únicas elegibles para el free tier de e2-micro).
   - **Tipo de máquina**: `e2-micro` (2 vCPU compartidas, 1 GB RAM).
   - **Disco de arranque**: Ubuntu 22.04 LTS, disco estándar (no SSD), 30 GB o menos.
   - **Firewall**: marca "Permitir tráfico HTTP" (no es estrictamente necesario, pero no molesta).
4. Una vez creada, anota la **IP externa** de la VM (ej. `34.123.45.67`).
5. Ve a **VPC de red → Firewall → Crear regla de firewall**:
   - Nombre: `allow-app-ports`
   - Destinos: todas las instancias (o con la etiqueta de tu VM)
   - Rango de IP de origen: `0.0.0.0/0`
   - Protocolos y puertos: TCP `22, 5678, 8080, 8081`

## 2. Preparar la VM

Conéctate por SSH (botón "SSH" en la consola de GCP abre una terminal en el navegador, no necesitas configurar claves manualmente).

```bash
git clone <URL_DE_TU_REPO> app
cd app/deploy
bash setup-vm.sh
```

Esto crea un swap de 2GB (necesario en una VM de 1GB de RAM) e instala Docker. Cierra sesión y vuelve a entrar por SSH para que el grupo `docker` tome efecto.

## 3. Configurar variables de entorno

```bash
cd ~/app/deploy
cp .env.example .env
nano .env
```

Completa:
- `POSTGRES_PASSWORD`: una contraseña fuerte cualquiera.
- `FRONTEND_ORIGIN`: la URL que te dé Vercel en el paso 5 (puedes dejar el placeholder y actualizarlo después con `docker compose up -d` de nuevo).
- `VM_HOST`: la IP externa de tu VM (paso 1.4), sin `http://`.
- `EVOLUTION_API_KEY`: cualquier string aleatorio (por ejemplo, generado con `openssl rand -hex 24`).
- Deja los puertos por defecto (`8081`, `5678`, `8080`) salvo que ya los uses para otra cosa.

## 4. Desplegar

```bash
bash deploy.sh
```

Verifica que todo responda:

```bash
curl http://localhost:8081/customers        # backend -> []
curl http://localhost:5678/healthz            # n8n -> {"status":"ok"}
curl http://localhost:8080                    # evolution-api -> mensaje de bienvenida
```

Desde tu computador, deberías poder acceder a:
- Backend/Swagger: `http://<VM_HOST>:8081/swagger`
- n8n: `http://<VM_HOST>:5678`
- Evolution Manager: `http://<VM_HOST>:8080/manager`

## 5. Reconstruir el workflow de n8n y reconectar Evolution API

n8n en la VM empieza vacío (es una instancia nueva). Tienes que:
1. Entrar a `http://<VM_HOST>:5678`, crear cuenta de owner.
2. Recrear el workflow "Customer Ready Notification" (Webhook + HTTP Request), igual que en local, pero:
   - La URL del HTTP Request ahora es `http://evolution-api:8080/message/sendText/<instancia>` (mismo docker network, no hace falta `host.docker.internal`).
   - El header `apikey` es el mismo `EVOLUTION_API_KEY` que pusiste en `.env`.
   - **Recuerda dejar el campo JSON del body en modo "Expression"**, no "Fixed".
3. Publica y activa el workflow.
4. Entra a `http://<VM_HOST>:8080/manager`, inicia sesión con tu `EVOLUTION_API_KEY`, crea la instancia de WhatsApp y escanea el QR de nuevo (las sesiones no se migran automáticamente desde local).

## 6. Desplegar el frontend en Vercel

1. Sube el repo a GitHub (si no lo está ya) y entra a [vercel.com](https://vercel.com) con tu cuenta de GitHub (no pide tarjeta para el plan Hobby).
2. **Add New → Project**, importa el repo, y en **Root Directory** selecciona `frontend`.
3. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_API_URL` = `http://<VM_HOST>:8081`
4. Deploy. Vercel te da una URL pública (`https://tu-proyecto.vercel.app`).
5. Vuelve al `.env` de la VM y actualiza `FRONTEND_ORIGIN` con esa URL exacta, luego:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
   para que el backend acepte peticiones CORS desde el dominio real de Vercel.

## Notas y limitaciones

- La VM e2-micro solo tiene 1GB de RAM. Con swap configurado corre backend + postgres + n8n + evolution-api de forma estable para uso de portafolio/demo, pero no para tráfico alto.
- No hay HTTPS configurado (se accede por IP y puerto plano). Para un dominio propio con TLS gratuito, se puede añadir Caddy o Nginx + Certbot más adelante.
- Evolution API corre sin Redis (`CACHE_REDIS_ENABLED=false`) para ahorrar RAM; es suficiente para una sola instancia de WhatsApp de bajo volumen.
- Si reinicias la VM, todos los contenedores con `restart: unless-stopped` vuelven a levantar solos.
