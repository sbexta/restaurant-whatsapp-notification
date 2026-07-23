#!/bin/bash
# Run from the deploy/ folder on the VM after cloning the repo and creating .env.
set -euo pipefail

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.example to .env and fill in real values first."
  exit 1
fi

docker compose -f docker-compose.prod.yml pull n8n evolution-api postgres
docker compose -f docker-compose.prod.yml up -d --build

echo "== Containers =="
docker compose -f docker-compose.prod.yml ps
