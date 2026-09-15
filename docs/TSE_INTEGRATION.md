# 🏛️ Módulo de Sincronização Oficial TSE — Eleições Progressistas v2.2.3

Este módulo implementa a integração automatizada, resiliente e segura com os sistemas oficiais do **Tribunal Superior Eleitoral (TSE)** para obtenção, higienização, mapeamento de matching e armazenamento em cache local de candidatos registrados nas **Eleições Gerais 2026**.

---

## 📐 Arquitetura do Módulo

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FONTES DE DADOS OFICIAIS                       │
├────────────────────────────────────────┬───────────────────────────────┤
│  API DivulgaCandContas (Primária)      │  Dados Abertos TSE (Fallback) │
│  https://divulgacandcontas.tse.jus.br  │  https://cdn.tse.jus.br       │
└───────────────────┬────────────────────┴───────────────┬───────────────┘
                    │                                    │
                    ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    TseSyncService (Rate Limiting)                      │
│        • 1 req/s estrito • Backoff Exponencial • User-Agent Oficial    │
│        • TLS estrito (rejectUnauthorized: true) • Zero Detalhes        │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ├───────────────────────────────┐
                    ▼                               ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│          TsePhotoService             │ │       TseMapperService        │
│ • Download /public/candidates/tse_*  │ │ • TSE Code -> Prisma Cargo    │
│ • Validação Magic Bytes (JPEG/PNG)   │ │ • Filtro de Partidos          │
│ • Job Noturno Dedicado (Teto: 2.000) │ │ • Scores de Matching Base     │
└───────────────────┬──────────────────┘ └───────────────┬───────────────┘
                    │                                    │
                    └───────────────┬────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    TseSyncService (Idempotência)                       │
│        • Upsert por (tseId, electionYear) no banco de dados            │
│        • Somente payloads de listagem (baixo tráfego de rede)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌──────────────────────────────────┐ ┌───────────────────────────────────┐
│     TseSyncController            │ │       TseSchedulerService         │
│ • POST /api/candidates/sync-tse  │ │ • Cron diário às 03:00 BRT (dados)│
│ • POST /api/candidates/sync-photos││ • Cron noturno às 05:00 BRT(fotos)│
│ • POST /api/candidates/sync-csv  │ └───────────────────────────────────┘
│ • GET  /api/candidates/sync-stats│
└──────────────────────────────────┘
```

---

## ⚡ Estimativa de Volume & Performance

| Rotina | Frequência | Requisições | Tempo Estimado | Estratégia |
|---|---|---|---|---|
| **Sincronização de Dados** | Diária (03:00 BRT) | ~140 requisições | ~3 minutos | Coleta apenas os payloads de listagem por UF/Cargo. Sem chamadas individuais de detalhe. Fotos desligadas por padrão. |
| **Cache Noturno de Fotos** | Noturna (05:00 BRT) | ≤ 2.000 requisições | ~35 minutos | Fila incremental com teto de 2.000 fotos/dia em lote com intervalo estrito de 1s e validação de magic bytes JPEG. |

---

## 🛡️ Regras de Rate Limiting e Segurança
1. **Verificação TLS Estrita:** Sem desativação de validação de certificados (`rejectUnauthorized: true`).
2. **User-Agent Transparente:** Identificação declarada:
   `EleicoesProgressistas/2.2.3 (+https://eleicoes-progressistas.pages.dev; contato: fmourag@gmail.com)`.
3. **Autenticação Fail-Closed:** Ausência de `ADMIN_SECRET` bloqueia imediatamente todas as rotinas administrativas (retorna HTTP 401). Segredos nunca são aceitos via query string.
4. **Idempotência:** Upsert com chave composta `(tseId, electionYear)`.

---

## 🔌 Endpoints Administrativos

| Método | Endpoint | Proteção | Descrição |
|---|---|---|---|
| `POST` | `/api/candidates/sync-tse` | Header `x-admin-token` | Sincroniza todas as 27 UFs e todos os cargos (listagem) |
| `POST` | `/api/candidates/sync-tse/uf/:uf/cargo/:cargoId` | Header `x-admin-token` | Sincroniza estado e cargo específicos |
| `POST` | `/api/candidates/sync-photos` | Header `x-admin-token` | Dispara job de download de fotos (`?limit=2000`) |
| `POST` | `/api/candidates/sync-csv` | Header `x-admin-token` | Carga de fallback via Dados Abertos (CSV/ZIP) |
| `GET` | `/api/candidates/sync-stats` | Pública | Estatísticas da base de dados e última sincronização |
| `GET` | `/api/candidates/sync-logs` | Pública | Histórico em memória dos logs de sincronização |
| `POST` | `/api/candidates/sync-scheduled` | Header `x-cron-secret`| Endpoint acionado por cron externo |

---

## 💻 Execução Manual via CLI

```powershell
# Sincronização geral de dados (listagens de todas as UFs):
npx tsx scripts/sync-tse.ts

# Sincronização de UF e Cargo específicos (ex: Deputados Distritais do DF):
npx tsx scripts/sync-tse.ts --uf DF --cargo 8

# Job exclusivo de fotos com teto de 500 fotos:
npx tsx scripts/sync-tse.ts --photos-only --limit 500

# Simulação sem gravar no banco de dados (dry-run):
npx tsx scripts/sync-tse.ts --dry-run
```

---

## 📜 Citação da Fonte e Conformidade Legal
- **Fonte Oficial:** Tribunal Superior Eleitoral — Portal DivulgaCandContas e Dados Abertos TSE.
- **Base Legal:** Dados estritamente públicos de candidaturas conforme Lei das Eleições (Lei nº 9.504/1997) e LGPD (Art. 7º, § 4º da Lei nº 13.709/2018).
