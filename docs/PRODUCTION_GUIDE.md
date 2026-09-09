---
title: "Guia de Produção e Deploy"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Guia de Produção — Eleições Progressistas

> **Resumo:** Instruções completas para configuração local, variáveis de ambiente obrigatórias, pipeline de CI/CD e rotinas de build e deploy da plataforma.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Priorities Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Ads (Anúncios Éticos), Finance (Sustentabilidade PIX), Public-API (Tiered API), Watchdog (Observatório de Mandatos), Reports (Relatórios B2B), OpsMode (Ciclo de Vida & Sunset)

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Conteúdo específico

### 1. Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React Native (Expo SDK 52+) / TypeScript |
| Backend | NestJS / TypeScript / Prisma |
| DB | PostgreSQL 16 (Docker local `eleicoes_progressistas` ou Supabase) |
| Auth | Supabase Auth (JWT + RLS) |
| Matching | Python 3.12+ (FastAPI / Pydantic v2) |
| ETL | Node.js (tsx + Prisma + axios + csv-parse) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry |

### 2. Variáveis de Ambiente
#### Backend (NestJS) — `apps/api/.env`
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
MATCHING_SERVICE_URL=http://localhost:8002
MATCHING_API_KEY=<shared secret>
GEMINI_API_KEY=<opcional para batch translation LLM>
DEVICE_HASH_SALT=<random, rotacionar 90 dias>
VIA_CEP_URL=https://viacep.com.br
IBGE_URL=https://servicodados.ibge.gov.br/api/v1
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
PORT=3000
PIX_WEBHOOK_SECRET=<segredo HMAC para webhook de doações PIX>
ADMIN_SECRET=<segredo seguro para endpoints operacionais de administração>
REPORT_DELIVERY_SIGNING_KEY=<segredo para assinatura e entrega de relatórios B2B>
THROTTLE_TTL=60
THROTTLE_LIMIT=120
```

#### Python (Matching) — `services/matching/.env`
```env
API_KEY=<shared secret with NestJS>
LOG_LEVEL=info
```

#### ETL — `services/etl/.env`
```env
DATABASE_URL=postgresql://...
TSE_DIVULGA_URL=https://divulgacaocontas.tse.jus.br/divulga/rest/v1
ETL_YEAR=2026 # Eleições Gerais 2026
ETL_UFS=SP,RJ,MG,BA,RS,PE,CE,PR,SC,PA
ETL_DELAY_MS=500
ETL_BATCH_SIZE=100
```

#### Frontend (Expo) — `apps/mobile/.env`
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Setup Local

#### Modo Lite (recomendado, sem Docker)
```bash
iniciar.bat            # Windows: cria dev.db (SQLite) + build web + API e abre http://localhost:3000
reiniciar.bat          # Reinicia a porta 3000 e recompila o front após mudanças
# ou
npm run setup:quick    # 1ª vez: npm install + prisma db push (sqlite) + seed
npm run start:lite     # http://localhost:3000 (API + Web estático)
```

#### Modo Completo (Docker)
```bash
# 1. Instalar dependências
npm install

# 1.1. Fix de versão do React (web)
# O package.json raiz fixa react/react-dom em 18.3.1 via "overrides"
# para evitar duplicata de React (erro "Objects are not valid as a React child"
# no Expo web). Se o erro aparecer, rode `npm ls react` e confirme 18.3.1.

# 2. Subir infra
docker compose up -d

# 3. Setup banco
cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Setup Supabase (RLS + auth)
# Rodar supabase/auth-setup.sql no SQL Editor

# 5. Iniciar serviços
npm run dev:api       # :3000
npm run dev:mobile    # Expo
# Matching (FastAPI) — via Docker expõe 8002 → 8001 no container:
docker compose up -d redis matching
# Ou localmente:
cd services/matching && uvicorn app.main:app --port 8001

# 6. (Opcional) Rodar ETL
cd services/etl && npm run start
```

### 4. CI/CD Pipeline
```yaml
push to main:
  ├─ lint (ESLint)
  ├─ typecheck (tsc)
  ├─ test-api (Jest + PostgreSQL)
  ├─ test-python (pytest)
  ├─ build-api → Vercel
  ├─ build-mobile → EAS Build
  └─ deploy-matching → Railway
```

### 5. Comandos
```bash
# Dev
npm run dev:api
npm run dev:mobile
npm run dev:matching

# DB
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio

# ETL
cd services/etl && npm run start

# Docker
docker compose up -d
docker compose down

# Assets e Imagens dos Candidatos
# Todas as fotos de campanha (TSE) e retratos parlamentares oficiais individuais (Câmara e Senado)
# são armazenadas localmente em apps/mobile/public/candidates/ e copiadas para apps/mobile/dist/candidates/
npm run build:web -w @np/mobile

# Tests
cd apps/api && npm test
cd services/matching && pytest tests/
```

### 6. Deploy Checklist
#### Pré-deploy
- [ ] Migrações executadas (`prisma db push`)
- [ ] Banco populado com candidaturas das 27 UFs (`npm run db:seed`)
- [ ] Retratos oficiais individuais verificados em `apps/mobile/public/candidates/` e compilados em `dist/candidates/`
- [ ] Variáveis de ambiente setadas (`PORT`, `CORS_ORIGINS`, `DATABASE_URL`)
- [ ] `DEVICE_HASH_SALT` definido e seguro
- [ ] `PIX_WEBHOOK_SECRET` e `ADMIN_SECRET` configurados com entropia adequada
- [ ] `MATCHING_API_KEY` idêntico em NestJS + Python (se usando matching microservice) ou `USE_LOCAL_MATCHING=true` ativado
- [ ] Blindagem anti-hacker ativa: Helmet (CSP, HSTS), Throttler (120 req/min), limite de payload (512 KB)
- [ ] Integração com Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`) ativa
- [ ] Sentry DSN configurado

#### Pós-deploy
- [ ] `GET /api/health` → 200
- [ ] `GET /api/candidates?state=RJ` → 200 com URLs de fotos oficiais locais e candidatos à Presidência inclusos
- [ ] `GET /candidates/dep_220605.jpg` → 200 (asset estático servido da raiz web dist/candidates/ — NÃO é rota /api; rotas de API vivem sob /api/*)
- [ ] Flow: localização → prioridades (stateless) → matching
- [ ] Matching < 500ms (p95)
- [ ] Busca em tempo real, navegação lateral de cargos e atalho do Portal de Dados Abertos do TSE operantes
- [ ] `GET /api/cola/pdf?ids=...&state=SP` → 200 (download / stream de PDF da colinha eleitoral gerado pelo PDFKit)
- [ ] Fluxo de Minha Cola: seleção de candidatos, ordenação oficial da urna, compartilhamento WhatsApp/E-mail e impressão web/mobile
- [ ] Teste de Segurança: `POST /api/system/reset-memory` sem secret retorna `403 Forbidden`
- [ ] Teste de Segurança: requisições em excesso retornam `429 Too Many Requests`
- [ ] Teste de Segurança: respostas de erro seguem RFC sem expor stack traces ou detalhes do Prisma/Postgres

### 7. Deploy Free-Tier (Zero Custo)

Configuração para operação em produção com custo zero de infraestrutura:

| Serviço | Provedor | Plano | Limite Free | Custo |
|---|---|---|---|---|
| **Frontend Web** | Cloudflare Pages | Free | Bandwidth ilimitada, 500 builds/mês, 100 domínios | R$ 0,00 |
| **API Backend** | Render.com | Free | 512MB RAM, scale-to-zero (15 min) | R$ 0,00 |
| **Banco de Dados** | Supabase ou Oracle | Free | 500MB (Supabase) ou 200GB / 4 OCPU (Oracle OCI) | R$ 0,00 |
| **Storage / Backup** | Cloudflare R2 | Free | 10GB de storage, egress gratuito | R$ 0,00 |
| **Total** | — | — | — | **R$ 0,00/mês** |

#### Passo a Passo de Configuração

1. **Frontend Web (Cloudflare Pages)**:
   - Conecte o repositório Git ao Cloudflare Pages.
   - Configure o comando de build `npm run build:web -w @np/mobile` e diretório de saída `apps/mobile/dist`.
   - Defina as variáveis `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_PIX_KEY`.
   - Consulte detalhes em [cloudflare-pages.md](file:///d:/Dev%20Aplicativos/Apps/Elei%C3%A7%C3%B5es%20Progressistas/deploy/cloudflare-pages.md).

2. **API Backend (Render.com)**:
   - Conecte o repositório utilizando o arquivo de manifesto [render.yaml](file:///d:/Dev%20Aplicativos/Apps/Elei%C3%A7%C3%B5es%20Progressistas/deploy/render.yaml).
   - Configure a variável `DATABASE_URL` apontando para o banco Supabase ou instância Oracle.
   - Configure `APP_MODE=full` e `REDIS_ENABLED=false` (para uso de cache in-memory nativo).
   - O healthcheck configurado em `/api/health` valida a integridade da aplicação.

3. **Banco de Dados (Supabase ou Oracle Always Free)**:
   - **Opção A (Supabase)**: Criar projeto gratuito (PostgreSQL 16, 500MB). Executar migrações via `npx prisma db push`.
   - **Opção B (Oracle Always Free)**: Provisionar VM Ampere A1 (4 OCPUs, 24GB RAM). Executar `docker-compose` com Postgres e script de backup automatizado para Cloudflare R2. Consulte o guia [oracle-always-free.md](file:///d:/Dev%20Aplicativos/Apps/Elei%C3%A7%C3%B5es%20Progressistas/deploy/oracle-always-free.md).

4. **CI/CD Automatizado**:
   - Utilize a pipeline do GitHub Actions [.github/workflows/deploy-free.yml](file:///d:/Dev%20Aplicativos/Apps/Elei%C3%A7%C3%B5es%20Progressistas/.github/workflows/deploy-free.yml) para disparo automático em tags de versão (`v*`) ou pushes na branch `main`.

