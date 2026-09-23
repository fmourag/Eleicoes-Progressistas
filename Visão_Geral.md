# Visão Geral — Eleições Progressistas (para IDEs/agentes)

> Arquivo único de contexto. Fonte primária: código + `README.md`, `docs/PRD.md`, `docs/DOCUMENTACAO_TECNICA.md`, `docs/PRODUCTION_GUIDE.md`, `docs/BOOK_DE_PROJETO.md`, `docs/OPERATIONS.md`, `docs/SIDELOAD_KIT.md`. Versão do repo: `package.json:3` `2.2.15`, `apps/api/package.json:3` `2.2.15`, `apps/mobile/app.json:5` `2.2.15` (android `versionCode` 16 em `apps/mobile/app.json:28`).

## 1. O que é e para que serve

- Plataforma cívica gratuita para as **Eleições Gerais 2026** com o lema “Cheque o passado. Escolha o futuro.” (`README.md:3`).
- Conecta eleitores a **candidatos progressistas auditáveis** via dados públicos do TSE, sem recomendar voto e sem coletar opiniões políticas.
- Modelo **Consulta por Prioridades, 100% stateless e Coleta Zero** (`docs/PRD.md:23`): o usuário informa localização (GPS ou modal com 27 UFs/municípios IBGE) e opcionalmente marca **até 3 temas** de interesse. O backend ranqueia candidatos e devolve memória de cálculo `Votações 40% + Discursos 30% + Posturas 30%`, Gap Analysis, propostas em linguagem simples e **Cola Eleitoral unificada** que pode ser compartilhada ou salva localmente (`docs/PRD.md:61`, `docs/BOOK_DE_PROJETO.md:83`).
- Pós-eleição vira **Observatório de Mandatos / Promessômetro**: acompanha votações nominais (Câmara/Senado) e promessas de quem está na cola local, sem rastrear o usuário (`docs/BOOK_DE_PROJETO.md:84`).

## 2. Os 13 pilares (fonte de verdade no código)

- Definição canônica: `packages/shared/src/pillars-core.ts:3` `PILLARS = [p1..p13]`; rótulos em `packages/shared/src/pillars-core.ts:6` (`p1 Bem-Estar & Assistência Social`, `p2 Justiça Social`, `p3 Desenvolvimento Sustentável`, `p4 Valores Nacionais`, `p5 Reindustrialização`, `p6 Distribuição Justa de Renda`, `p7 Proteção do Vulnerável`, `p8 Governo Eficiente`, `p9 Saúde Pública`, `p10 Segurança Pública`, `p11 Educação`, `p12 Relações do Trabalho e Emprego`, `p13 Empreendedorismo e Desoneração Responsável`). Detalhe em `docs/PRD.md:32`.
- `packages/shared/src/quiz-core.ts:1` só reexporta `./pillars-core`; não duplicar listas de pilares fora daqui.

## 3. Arquitetura e stack

- Fluxo: `apps/mobile` (Expo React-Native, Expo Router) → `apps/api` (NestJS + Prisma) → `services/matching` (FastAPI, opcional) → PostgreSQL/Supabase ou SQLite local. Diagrama em `docs/DOCUMENTACAO_TECNICA.md:33`.
- Stack declarada em `docs/PRODUCTION_GUIDE.md:31`: frontend Expo SDK 52+ TS; backend NestJS/TS/Prisma; DB PostgreSQL 16 (Docker `eleicoes_progressistas` ou Supabase); auth Supabase JWT+RLS; matching Python 3.12+ FastAPI/Pydantic v2; ETL Node tsx+Prisma+axios+csv-parse; CI GitHub Actions; monitoramento Sentry.
- Monorepo npm workspaces (`package.json:5` `apps/*, packages/*, services/*`) orquestrado por `turbo.json:3` (`build` com `dependsOn ^build`, `typecheck` depende de `^build`, `test` depende de `build`). React único via `package.json:52` `overrides react/react-dom 18.3.1` (evita “Objects are not valid as a React child” no web, `docs/DOCUMENTACAO_TECNICA.md:625`).

## 4. Estrutura do repositório (o que mexer onde)

- `apps/api/` — NestJS. Entrada `apps/api/src/main.ts:14`, módulos em `apps/api/src/app.module.ts:14` (Auth, Candidates, Matching, Quiz, Geo, Proposals, Cola, Watchdog, Ads, Finance, Public-API, Reports, OpsMode, Telemetry, System). Prisma `apps/api/prisma/schema.prisma:1` (Postgres) e `apps/api/prisma/schema-sqlite.prisma:1` (Lite). Seed `apps/api/prisma/seed.ts:1`. Estáticos servidos em `apps/api/static/`, build web copiado para `apps/mobile/dist/`.
- `apps/mobile/` — Expo Router (`app.json:1`, `eas.json:1`). Telas em `app/` (`(tabs)`, `(auth)`, `/transparencia`, `/observatorio`, `/relatorios`, `/anuncie`, `/media-kit`, `/api-publico`, `/apoie`, `/manual`, `/cola`, `/apuracao`), componentes em `components/`, stores zustand em `stores/`, API client em `apps/mobile/services/api.ts:10` (`PRODUCTION_API_URL=https://eleicoes-progressistas.onrender.com`). Env dev `apps/mobile/.env:1` aponta `http://localhost:3000`.
- `packages/shared/` — tipos, `pillars-core.ts`, quiz-core, build `tsc` (`packages/shared/tsconfig.json:1`).
- `services/matching/` — FastAPI stateless `services/matching/app/main.py:8` (`/health`, `POST /matching/rank`, `POST /matching/batch`), algoritmo `services/matching/app/algorithm/core.py:9` `rank_by_pillars`. Testes `services/matching/tests/test_core.py:1`.
- `services/etl/` — ingestão TSE (`services/etl/src/extractors.ts:1`).
- `scripts/` — `sync-docs.ts` (gera `.md` a partir do código), `sync-real-candidates.ts`, `render-copy-assets.js`, health/hotfix/rollback.
- `deploy/` — `deploy/render.yaml:1` (build `npm ci + build @np/shared + build:api`, start `node apps/api/dist/main.js`, healthcheck `/api/health`), `deploy/cloudflare-pages.md`, `deploy/oracle-always-free.md`, segredos em `deploy/secrets.md`.
- `docs/` — índice em `docs/MARKDOWN.md:1`. Leitura mínima: `PRD.md`, `DOCUMENTACAO_TECNICA.md`, `PRODUCTION_GUIDE.md`, `BOOK_DE_PROJETO.md`, `OPERATIONS.md`, `SIDELOAD_KIT.md`, `DOCUMENTACAO_SEGURANCA.md`, `PRIVACY_POLICY.md`.
- Raiz: `iniciar.bat:1` (Modo Lite Windows), `parar.bat`, `reiniciar.bat`, `publicar-web.bat/.ps1`, `e2e.js:1`, `render.yaml:1` (espelho do deploy).

## 5. Como rodar (dois modos — não misturar URLs de banco)

- **Modo Lite (padrão local, 1 servidor :3000)**: `iniciar.bat:9` mata portas 3000/8081/8001/8002, confere `node_modules`, cria `apps/api/dev.db` via `npm run seed:quick` (`package.json:15`, schema sqlite), rebuild inteligente de `@np/shared`, `@np/api`, web `@np/mobile`, copia `public/candidates` e `static/*` para `dist`, fixa `DATABASE_URL=file:./dev.db`, `DB_PROVIDER=sqlite`, `USE_LOCAL_MATCHING=true`, `JWT_SECRET=dev-secret…`, `PORT=3000`, `CORS_ORIGINS=http://localhost:3000,http://localhost:8081` (`iniciar.bat:178`), abre `http://localhost:3000` e executa `node dist/main.js` em `apps/api` (`iniciar.bat:220`). Flags: `--rebuild/-r`, `--clean`, `--reset-db`, `--sync`, `--no-browser` (`iniciar.bat:23`).
- **Modo Completo (Docker)**: `package.json:35` `docker:up`, `npm run db:generate/db:push/db:seed`, `npm run dev:api` (:3000), `npm run dev:mobile` (Expo :8081), matching `uvicorn app.main:app --port 8002` ou `docker compose up -d redis matching` (`docs/PRODUCTION_GUIDE.md:99`). `.env.example` Postgres em `apps/api/.env.example:2`, Supabase/Matching/Redis/TSE/Sentry em `apps/api/.env.example:4`.
- Regra crítica: `DATABASE_URL` SQLite **relativa ao CWD do processo**. `iniciar.bat` roda `node dist/main.js` com CWD `apps/api`, logo usa `file:./dev.db` (o arquivo real é `apps/api/dev.db`, com cópia em `apps/api/prisma/dev.db`). Rodar da raiz exige `file:./apps/api/dev.db`. Esquema incorreto gera `Health {status: degraded, database: disconnected}` (`apps/api/src/modules/common/health.controller.ts:1`).

## 6. Backend — endpoints que a IDE deve conhecer

Prefixo global `api` com exclusões SPA/estáticas em `apps/api/src/main.ts:80` (`privacidade`, `beta`, `download/apk`, `web`, `feedback`, `_expo`, `assets`, etc.). Rotas web raiz `/`, `/web`, `/beta`, `/privacidade`, `/feedback`, `/download/apk`, `/painel` servidas pelo próprio Nest com fallback SPA em `apps/api/src/main.ts:271`.

- `GET /api/health` → `{status, database, timestamp}`.
- Auth: `POST /api/auth/sync`, `GET /api/auth/me`, `POST /api/auth/dev-login` (tabela em `docs/DOCUMENTACAO_TECNICA.md:486`).
- Matching: `POST /api/matching/rank` e alias `POST /api/matching/compute`, body `RankMatchDto { priority_pillars? ≤3, location? {uf, ibge_code}, includePending? }` (`docs/DOCUMENTACAO_TECNICA.md:493`). Stateless: `match_results` não recebe escrita nesse fluxo.
- Candidates: `GET /api/candidates?state&municipality&cargo&party&search` (respeita circunscrição: PRESIDENTE nacional), `GET /api/candidates/tse/dados-abertos-search`, `GET /api/candidates/tse/live`, `GET /api/candidates/tse/source-info`, `GET /api/candidates/cargos/:level`, `GET /api/candidates/:id`, `GET /api/candidates/:id/raio-x` (ficha limpa, doações, votações, `justificativa` + gap por pilar).
- Quiz: `GET /api/quiz/:version`, `POST /api/quiz/submit`.
- Geo: `GET /api/geo/cep/:cep`.
- Proposals: `POST /api/proposals/translate-batch`, `GET /api/proposals/translation-stats`.
- Cola: `GET /api/cola/pdf`, `GET /api/cola/pdf/download`, `POST /api/cola/pdf` (PDFKit, ordem de urna Res. TSE 23.736/2024).
- Watchdog: `GET /api/watchdog/votes|alerts|pledges|dashboard`, admin `POST /api/watchdog/admin/vote-mapping`, `PATCH .../pledges/:id/status`, `PATCH .../candidates/:id/result` (`x-admin-secret`).
- Reports: `GET /api/reports/products[/:slug]`, `POST /api/reports/orders`, `GET /api/reports/orders/:id`, `GET /api/reports/download/:orderId`, admin confirm/deliver.
- Públicos/estáticos: `/privacidade`, `/beta`, `/download/apk` (+ `/sha256`), `/feedback`, `/painel`, `/web/*`, `/_expo/*`, `/assets/*`, `/candidates/*`.
- Segurança aplicada em `apps/api/src/main.ts:38`: `helmet` (HSTS 1 ano, CSP), `compression`, `json/urlencoded limit 512kb`, `GlobalHttpExceptionFilter` (sem stack/SQL), `ValidationPipe whitelist+forbidNonWhitelisted+transform`, CORS allowlist `apps/api/src/main.ts:110` (pages.dev, onrender.com, localhost) + `CORS_ORIGINS`, throttler e `timingSafeEqual` no webhook PIX (`docs/DOCUMENTACAO_TECNICA.md:640`).

## 7. Algoritmo de matching (contrato estável)

- Python: `services/matching/app/algorithm/core.py:3` `PILLARS p1..p13`, `PRIORITY_WEIGHT=3.0`, `DEFAULT_WEIGHT=1.0`, `FICHA_LIMPA_BONUS=5.0`. `rank_by_pillars(candidate, priority_pillars, ficha_limpa)` → `score = Σ(focus×peso)/Σ(pesos)×100`, `focus` ausente `0.5 + is_estimated=True`, `+5` ficha limpa cap 100, `priority_aligned` quando `focus≥0.7`, `reason` correspondente (`services/matching/app/algorithm/core.py:57`). `compute_rank` retorna só float.
- TS local espelha a mesma fórmula quando `USE_LOCAL_MATCHING=true` (usado no Lite sem Python).
- Nunca persistir opiniões: só `priority_pillars` opcionais transitam; `deviceHash` (SHA-256) só para opt-out de ads (`docs/PRD.md:120`).

## 8. Dados e Prisma

- Postgres (`apps/api/prisma/schema.prisma:5`) vs SQLite Lite (`apps/api/prisma/schema-sqlite.prisma:1`). Entidades: `User`, `Candidate` (`tseId+electionYear` único, `profileScores Json p1..p13`, `fichaLimpa`, `candidaturaStatus`, `visible`, `source`, `tseValidated`, `electionResult`, `coalition`), `MatchResult` (legado), `SavedCandidate`, `Proposal` (tradução PENDING/TRANSLATED/FAILED), `IntegrityFlag`, `Advertiser/Ad/AdOptOut`, `DonationEvent`, `ApiKey` (SHA-256, tiers FREE/RESEARCH/PRO), `LegislativeVote/CandidateVote`, `Pledge`, `ReportProduct/ReportOrder`, `AggregateCounter` (chaves sem dispositivo), `Feedback`. Esquema completo em `docs/DOCUMENTACAO_TECNICA.md:63`.
- ETL TSE: DivulgaCandContas + Dados Abertos (`dadosabertos.tse.jus.br`), Câmara/Senado, IBGE/ViaCEP (`docs/DATA_SOURCES.md:1`, `services/etl/src/extractors.ts:1`). Seed local gera 7.256 candidatos oficiais citados em `docs/SIDELOAD_KIT.md:27`.
- Fotos: `apps/mobile/public/candidates/` → copiadas para `apps/mobile/dist/candidates/` no build (`iniciar.bat:161`, `docs/PRODUCTION_GUIDE.md:165`).

## 9. Frontend — o que a IDE deve presumir

- Expo Router; `EXPO_PUBLIC_API_URL` prod `https://eleicoes-progressistas.onrender.com` (`apps/mobile/.env.production:1`, `apps/mobile/eas.json:19`); dev `http://localhost:3000` (`apps/mobile/.env:1`); client com fallback Render em `apps/mobile/services/api.ts:10`.
- Rotas cívicas web: `/`, `/candidatos`, `/matching`, `/cola`, `/apuracao`, `/feedback`, `/beta`, `/privacidade`, `/apoie`, `/transparencia`, `/observatorio`, `/relatorios`, `/anuncie`, `/media-kit`, `/api-publico`, `/manual` (`iniciar.bat:199`, `docs/DOCUMENTACAO_TECNICA.md:746`).
- Build web: `npm run build:web -w @np/mobile` (`expo export --platform web --output-dir dist`, `apps/mobile/package.json:1`); `publicar-web.bat/.ps1` publica em `eleicoes-progressistas.pages.dev`.
- Mobile nativo: `eas.json:5` profiles `development/preview/production` (APK preview, AAB production), `projectId 706fc29e-…` (`app.json:55`).

## 10. Deploy e versões carregadas (estado verificado)

- API Render `https://eleicoes-progressistas.onrender.com` (`docs/OPERATIONS.md:47`, `deploy/render.yaml:1` free, `startCommand node apps/api/dist/main.js`, healthcheck `/api/health`): versão viva e legível.
- Web Cloudflare `https://eleicoes-progressistas.pages.dev` (`docs/OPERATIONS.md:46`): responde só `Eleições Progressistas` no fetch texto.
- Play testing `https://play.google.com/apps/testing/com.eleicoesprogressistas.app` (`docs/OPERATIONS.md:56`): exige login Google, versão não raspável. Atenção: `app.json:27` declara package Android `eleicoes.progressistas`, enquanto docs citam trilha `com.eleicoesprogressistas.app` e `feedback.service.ts:93` cita `id=eleicoes.progressistas` — conferir antes de publicar.
- Versão alvo do repo: **v2.2.15 / versionCode 16** (`docs/SIDELOAD_KIT.md:1`). Artefatos estáticos atualizados.

## 11. Testes e validação

- `turbo test` exige `build` antes (`turbo.json:16`): API Jest `apps/api` (`*.spec.ts`, ex. `feedback.controller.spec.ts:17` com URLs Play), Python `pytest tests/` (`services/matching/tests/test_core.py:1`), E2E `e2e.js:1` (`/auth/dev-login` → `/matching/compute` → `/candidates?state=SP` → `/raio-x`).
- `turbo typecheck` (`turbo.json:13`) e `turbo lint` (`expo lint` no mobile; API sem eslint — script é `echo skip` em `apps/api/package.json:11`).
- Operação: `docs/OPERATIONS.md:3` (`quick-health.ps1`, `health-monitor.ps1`, `test:feedback`, `collect-feedback.ps1`, `hotfix-template.ps1`, `rollback.ps1`, `emergency-scale.ps1`), keep-alive Render em `.github/workflows/keep-alive.yml:17`, deploy free em `.github/workflows/deploy-free.yml:1`, build Android em `.github/workflows/build-android.yml:66`.
- Checklist produção em `docs/PRODUCTION_GUIDE.md:175` e free-tier $0 em `docs/PRODUCTION_GUIDE.md:201` (Pages + Render + Supabase/Oracle + R2).

## 12. Privacidade, segurança e compliance (regras duras)

- LGPD/Privacy by design (`docs/DOCUMENTACAO_SEGURANCA.md:1`, `docs/PRIVACY_POLICY.md:1`, `docs/PRIVACY_FIRST.md:1`): sem CPF/email para matching, sem persistência de preferências, `Row Level Security`, TLS/HSTS, `DEVICE_HASH_SALT` rotativo 90 dias, CPF de candidato só como hash.
- Eleitoral: sem endorsement/financiamento de campanha, sem propaganda; blackout de ads 16/08–05/10; sem review-gating, só In-App Review oficial (`docs/PLAYSTORE_REVIEW_POLICY.md:1`, `README.md:32`).
- Play Data Safety/Ads/Target Audience/Content Rating em `docs/PLAYSTORE_DATA_SAFETY.md:1` e vizinhos; `STORE_ASSETS_CHECKLIST.md:52` fixa privacidade em `pages.dev/privacidade`.
- Monetização ética (`docs/MONETIZACAO.md:1`, `docs/CIVIC_SUPPORT_MODEL.md:1`): PIX manual `(21) 97194-3298` sem gateway, API Tiered, relatórios B2B assinados HMAC, `OpsMode full/watchdog/archive` + sunset pós 2º turno 26/10/2026 (`docs/DOCUMENTACAO_TECNICA.md:736`).

## 13. Armadilhas conhecidas para a IDE

- Caminho Windows com acento `D:\Dev Aplicativos\Apps\Eleições Progressistas`: sessões antigas usavam `subst X:`; o `iniciar.bat` atual usa `cd /d "%~dp0"` (`iniciar.bat:7`) e relativos — prefira caminhos relativos ou drive mapeado ao chamar ferramentas.
- `apps/api/.env` local ainda pode conter `DATABASE_URL=postgresql://…` do exemplo; o Lite precisa do `set` do `iniciar.bat` (não confiar só no `.env`).
- `npx tsc` sem `-p` no `apps/api` gera `dist` vazio; usar scripts do pacote (`build:api`, `typecheck`) e `turbo`.
- Duplicata de React no web: manter `overrides` 18.3.1; conferir com `npm ls react`.
- `apps/mobile/node_modules` já esteve corrompido (metro/ajv/expo-router incompletos); se `expo start --web` falhar com `Cannot find module`, reinstalar mobile com `--legacy-peer-deps` em vez de `robocopy` parcial.
- `metro.config.js` em `apps/mobile` só deve existir se o projeto realmente precisar; hoje o web final é `expo export` estático, não dev-server :8081 no Lite.
- Divergências de versão/banner: `iniciar.bat:4` ainda rotula antigas e `main.ts:300` tem fallback APK `v2.2.15` (e link GitHub v2.2.15 em `main.ts:315`, SHA fallback atualizado) enquanto a release é v2.2.15 — atualizar esses literais antes do próximo release.
