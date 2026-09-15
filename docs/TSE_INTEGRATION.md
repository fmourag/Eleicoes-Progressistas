# 🏛️ Módulo de Sincronização Oficial TSE — Eleições Progressistas v2.2.3

Este módulo implementa a integração automatizada e resiliente com os sistemas oficiais do **Tribunal Superior Eleitoral (TSE)** para obtenção, higienização, mapeamento de matching e armazenamento em cache local de candidatos registrados nas **Eleições Gerais 2026**.

---

## 📐 Arquitetura do Módulo

\\\	ext
┌────────────────────────────────────────────────────────────────────────┐
│                        FONTES DE DADOS OFICIAIS                       │
├────────────────────────────────────────┬───────────────────────────────┤
│  API DivulgaCandContas (Primária)      │  Dados Abertos TSE (Fallback) │
│  https://divulgacandcontas.tse.jus.br  │  https://cdn.tse.jus.br       │
└───────────────────┬────────────────────┴───────────────┬───────────────┘
                    │                                    │
                    ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    TseHttpService (Rate Limiting)                      │
│        • 1 req/s estrito • Backoff Exponencial • User-Agent Oficial    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│          TsePhotoService             │ │       TseMapperService        │
│ • Download /public/candidates/tse_*  │ │ • TSE Code -> Prisma Cargo    │
│ • Validação Magic Bytes (JPEG/PNG)   │ │ • Filtro de Partidos          │
│ • Cache local permanente             │ │ • Scores de Matching Base     │
└───────────────────┬──────────────────┘ └───────────────┬───────────────┘
                    │                                    │
                    └───────────────┬────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    TseSyncService (Idempotência)                       │
│        • Upsert por (tseId, electionYear) no banco de dados            │
│        • Geração de logs estruturados em logs/tse-sync-*.log           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌──────────────────────────────────┐ ┌───────────────────────────────────┐
│     TseSyncController            │ │       TseSchedulerService         │
│ • POST /api/candidates/sync-tse  │ │ • Cron diário às 03:00 BRT        │
│ • POST /api/candidates/sync-csv  │ │ • Retry automático em falhas      │
│ • GET  /api/candidates/sync-stats│ └───────────────────────────────────┘
└──────────────────────────────────┘
\\\

---

## 🛡️ Regras de Rate Limiting e Boas Práticas TSE
1. **Frequência:** Máximo de 1 requisição por segundo para evitar sobrecarga na infraestrutura da Justiça Eleitoral.
2. **Backoff Exponencial:** Esperas progressivas (2s, 4s, 8s) em caso de HTTP 429 ou 5xx.
3. **Persistência de Fotos:** As fotos dos candidatos são baixadas e armazenadas localmente em pps/api/public/candidates/tse_<id>.jpg para evitar links expirados do TSE.
4. **Idempotência:** Toda sincronização executa upsert baseado na chave única (tseId, electionYear), garantindo que execuções repetidas atualizem registros sem duplicação.

---

## 🔌 Endpoints Administrativos

| Método | Endpoint | Proteção | Descrição |
|---|---|---|---|
| POST | /api/candidates/sync-tse | x-admin-token | Sincroniza todas as 27 UFs e todos os cargos |
| POST | /api/candidates/sync-tse/uf/:uf/cargo/:cargoId | x-admin-token | Sincroniza estado e cargo específicos |
| POST | /api/candidates/sync-csv | x-admin-token | Dispara carga do arquivo de Dados Abertos |
| GET | /api/candidates/sync-stats | Pública | Retorna estatísticas da última sincronização |
| GET | /api/candidates/sync-logs | Pública | Lista os arquivos de log de auditoria disponíveis |
| POST | /api/candidates/sync-scheduled | x-cron-secret | Execução disparada por rotinas de cron |

---

## 💻 Execução Manual via CLI

\\\powershell
# Sincronização completa de 27 UFs e todos os cargos:
npx tsx scripts/sync-tse.ts

# Sincronização de UF e Cargo específicos (ex: Deputados Distritais do DF):
npx tsx scripts/sync-tse.ts --uf DF --cargo 8

# Simulação sem gravar no banco de dados:
npx tsx scripts/sync-tse.ts --dry-run
\\\

---

## 📜 Citação da Fonte e Conformidade Legal
- **Fonte Oficial:** Tribunal Superior Eleitoral — Portal DivulgaCandContas e Dados Abertos TSE.
- **Base Legal:** Dados estritamente públicos de candidaturas conforme Lei das Eleições (Lei nº 9.504/1997) e LGPD (Art. 7º, § 4º da Lei nº 13.709/2018).
