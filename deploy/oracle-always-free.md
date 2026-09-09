---
title: "Deploy Backend Completo — Oracle Cloud Always Free"
version: "2.2.0"
last_updated: "2026-09-07"
---

# Deploy Backend Completo — Oracle Cloud Always Free (Custo R$ 0,00/mês)

Guia de provisionamento e operação do backend e banco de dados na camada **Always Free da Oracle Cloud Infrastructure (OCI)** utilizando instâncias Ampere ARM.

---

## 1. Recursos Always Free Disponíveis na OCI

A Oracle disponibiliza de forma permanente e sem custo:
- **Até 4 OCPUs** e **24 GB de memória RAM** (arquitetura Ampere A1 Compute ARM).
- **200 GB de Block Storage**.
- **10 TB de tráfego de saída gratuito por mês**.
- Custo mensal: **R$ 0,00 / mês vitalício**.

---

## 2. Docker Compose de Produção (`docker-compose.prod.yml`)

Salvar no servidor `/opt/eleicoes-progressistas/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: np-postgres-prod
    restart: always
    environment:
      POSTGRES_DB: eleicoes_progressistas
      POSTGRES_USER: np_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U np_user -d eleicoes_progressistas"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: np-api-prod
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      APP_MODE: full
      DATABASE_URL: postgresql://np_user:${POSTGRES_PASSWORD}@postgres:5432/eleicoes_progressistas?schema=public
      REDIS_ENABLED: "false"
      USE_LOCAL_MATCHING: "true"
      JWT_SECRET: ${JWT_SECRET}
      PIX_WEBHOOK_SECRET: ${PIX_WEBHOOK_SECRET}
      ADMIN_SECRET: ${ADMIN_SECRET}
      CORS_ORIGIN: "*"
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

> **Nota:** Caso opte por não executar o Redis, configure `REDIS_ENABLED=false` na API para ativar o fallback de cache in-memory.

---

## 3. Script de Backup Diário para Cloudflare R2 (10GB Free)

Criar o script em `/opt/eleicoes-progressistas/scripts/backup-r2.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/eleicoes-progressistas/backups"
BACKUP_FILE="${BACKUP_DIR}/dump_${TIMESTAMP}.sql.gz"
R2_BUCKET="s3://eleicoes-backups"

mkdir -p "${BACKUP_DIR}"

# 1. Dump comprimido do Postgres
docker exec np-postgres-prod pg_dump -U np_user eleicoes_progressistas | gzip > "${BACKUP_FILE}"

# 2. Sincronização para Cloudflare R2 via AWS CLI ou rclone (S3-compatible)
# Cloudflare R2 oferece 10GB de armazenamento gratuito e egress zero
aws s3 cp "${BACKUP_FILE}" "${R2_BUCKET}/" --endpoint-url "${R2_ENDPOINT_URL}"

# 3. Rotação local (manter últimos 7 dias)
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +7 -delete

echo "[$(date)] Backup concluído com sucesso: ${BACKUP_FILE}"
```

### Agendamento no Crontab

```bash
# Executar diariamente às 03:00 da manhã
0 3 * * * /opt/eleicoes-progressistas/scripts/backup-r2.sh >> /var/log/backup-r2.log 2>&1
```
