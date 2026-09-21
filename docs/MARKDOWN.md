---
title: "Markdown Index"
version: "2.2.12"
last_updated: "2026-09-21"
---

# Markdown Master Index

> **Resumo:** Índice central de toda a documentação disponível na pasta `docs/`, apresentando a estrutura de diretórios e links externos fundamentais.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.12
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Prioridades (Stateless), Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Apuração em Tempo Real (Election Night), Apoio Cívico PIX, In-App Review Google Play, Ads (Anúncios Éticos), Finance, Public-API, Watchdog, Reports

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples, acompanhamento de apuração em tempo real e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável
- **Conformidade Google Play**: Ausência total de *Review Gating*, uso da *In-App Review API* nativa por marcos neutros e canal universal de suporte

## Conteúdo específico

### 1. Documentação do Projeto
| Doc | Descrição |
|-----|-----------|
| [PRD.md](./PRD.md) | Product Requirements Document — User Stories, 13 pilares, busca nacional, Cola Eleitoral 2026, blindagem cibernética e diretrizes de interesse nacional |
| [BOOK_DE_PROJETO.md](./BOOK_DE_PROJETO.md) | Visão macro — missão, público-alvo, jornada nacional do usuário com filtro lateral de cargos, mitigação de riscos e padronização visual |
| [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md) | Arquitetura, schemas, APIs, auditoria TSE, ColaModule (PDFKit), módulo de apuração em tempo real, matching e blindagem defense-in-depth |
| [DOCUMENTACAO_SEGURANCA.md](./DOCUMENTACAO_SEGURANCA.md) | LGPD, anonimização via device hash, sigilo do voto na Cola e blindagem anti-hacker (Throttler, Helmet, GlobalFilter, timing attack protection) |
| [PLAYSTORE_REVIEW_POLICY.md](./PLAYSTORE_REVIEW_POLICY.md) | Diretrizes oficiais do Google Play, proibição de Review Gating, marcos neutros e conformidade da In-App Review API |
| [PLAYSTORE_DATA_SAFETY.md](./PLAYSTORE_DATA_SAFETY.md) | Declaração oficial de segurança de dados (Google Play Data Safety), Coleta Zero e criptografia TLS |
| [CIVIC_SUPPORT_MODEL.md](./CIVIC_SUPPORT_MODEL.md) | Modelo de sustentabilidade cívica e apoio voluntário via PIX celular `(21) 97194-3298` (E.164 BACEN) com persistência 100% local |
| [SIDELOAD_KIT.md](./SIDELOAD_KIT.md) | Kit de distribuição Sideload do Beta Fechado v2.2.5 (APK direto, SHA-256 e templates de comunicação) |
| [AUDITORIA_CONSISTENCIA_TSE.md](./AUDITORIA_CONSISTENCIA_TSE.md) | Relatório de auditoria e consistência dos dados de candidaturas oficiais do TSE |
| [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) | Deploy, build de assets estáticos de fotos, variáveis de ambiente (segredos HMAC e Admin), checklist de segurança |
| [MANUAL_DO_USUARIO.md](./MANUAL_DO_USUARIO.md) | Fluxo de uso do app, busca nacional de cargos, apuração ao vivo, fotos oficiais e Cola Eleitoral (PDF/WhatsApp) |
| [MONETIZACAO.md](./MONETIZACAO.md) | Estratégias de sustentabilidade financeira sem fins comerciais (Anúncios Éticos, Apoio Cívico PIX, API Tiered e Relatórios B2B) |
| [ADS_OUTREACH_KIT.md](./ADS_OUTREACH_KIT.md) | Kit de prospecção comercial ética, cronograma pós-blackout e minuta contratual para os primeiros patrocinadores |
| [API_PUBLICA.md](./API_PUBLICA.md) | Especificação da API Pública Tiered (Free/Pro), chaves HMAC, rate limits e catálogo de dados eleitorais |
| [CONSUMO_DE_TOKENS.md](./CONSUMO_DE_TOKENS.md) | Diretrizes de uso de IA e controle de custo (Gemini API) |
| [DATA_SOURCES.md](./DATA_SOURCES.md) | Fontes de dados públicos (Portal de Dados Abertos do TSE, DivulgaCandContas, Câmara, Senado) |
| [PRIVACY_FIRST.md](./PRIVACY_FIRST.md) | Arquitetura de privacidade (Privacy by Design, cola e apuração 100% locais e transparência eleitoral) |
| [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) | Política de privacidade formal e conformidade LGPD |
| [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md) | Termos de serviço e uso de dados abertos oficiais |
| [DEV_MODE_LEVE.md](./DEV_MODE_LEVE.md) | Setup rápido sem Docker usando SQLite e build web estático |
| [NOTA_TRANSPARENCIA_LANCAMENTO.md](./NOTA_TRANSPARENCIA_LANCAMENTO.md) | Nota Oficial de Transparência do Lançamento v2.2.5 |
| [NOTA_TRANSPARENCIA.md](./NOTA_TRANSPARENCIA.md) | Nota de Transparência Pública — Evolução para Coleta Zero e Consulta por Prioridades |
| [OPERATIONS.md](./OPERATIONS.md) | Manual Operacional, runbooks de incidentes e links críticos de infraestrutura |
| [RELATORIO_CORRECOES_V2.2.12.md](./RELATORIO_CORRECOES_V2.2.12.md) | Relatório técnico de correções v2.2.10 a v2.2.12: cola persistente, PDF anexo, crash PDF, scroll, FAB, versão dinâmica |
| [RELATORIO_CORRECOES_V2.2.2.md](./RELATORIO_CORRECOES_V2.2.2.md) | Relatório técnico de correções v2.2.0 a v2.2.2 |
| [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) | Checklist operacional completo pré e pós-lançamento de produção |
| [ROLLBACK.md](./ROLLBACK.md) | Plano de contingência e procedimentos de rollback em 4 cenários críticos |

### 2. Estrutura de Código
```
eleicoes-progressistas/
├── apps/
│   ├── mobile/                  # React Native (Expo SDK 52)
│   │   ├── app/                 # File-based routing (Expo Router)
│   │   │   ├── (auth)/          # Login, Cadastro
│   │   │   ├── (tabs)/          # Candidatos, cola, matching, Perfil, raio-x
│   │   │   ├── apuracao.tsx     # /apuracao: Apuração Eleitoral em Tempo Real (TSE 2026)
│   │   │   ├── apoie.tsx        # /apoie: Apoio Cívico Voluntário via PIX
│   │   │   ├── candidate/[id]   # Raio-X detalhado (card expandido auditável)
│   │   │   ├── transparencia.tsx# /transparencia: Livro-caixa aberto e custos de infra
│   │   │   ├── observatorio.tsx # /observatorio: Monitoramento de votações nominais
│   │   │   ├── relatorios.tsx   # /relatorios: Catálogo cívico B2B com telemetria Coleta Zero
│   │   │   ├── anuncie.tsx      # /anuncie: Onboarding de anunciantes éticos
│   │   ├── services/
│   │   │   ├── store-review.service.ts # In-App Review oficial Google Play por marcos neutros
│   │   │   ├── media-kit.tsx    # /media-kit: Tabela de cotas, regras éticas e blackout eleitoral
│   │   │   ├── api-publico.tsx  # /api-publico: Emissão self-service de chaves API públicas Tier Free
│   │   │   ├── apoie.tsx        # /apoie: Contribuição cívica via PIX manual e prestação de contas
│   │   │   └── manual.tsx       # /manual: Manual do Usuário interativo (Progressismo, FAQ, Auditoria)
│   │   ├── components/          # ScoreBar, CandidateCard, Dropdown Responsivo, CivicEmblem, CivicLogo, ColaBottomBar, EthicalAd, PixApoio, etc.
│   │   ├── public/candidates/   # Fotos oficiais de campanha (TSE) e retratos individuais (Câmara/Senado)
│   │   ├── dist/                # Build estático web exportado pelo Expo
│   │   ├── services/            # api.ts (com suporte a busca, matching por prioridades e fallback offline)
│   │   ├── utils/               # civic-search.ts (Busca Semântica Client-Side), theme.ts, responsive.ts
│   │   └── stores/              # auth.store.ts, location.store.ts, cola.store.ts
│   └── api/                     # NestJS Backend
│       ├── src/modules/
│       │   ├── auth/            # Auth controller & service (com dev-login)
│       │   ├── candidates/      # CRUD, Raio-X, busca nacional e integração Dados Abertos TSE
│       │   ├── cola/            # Geração de PDF e download de Cola Eleitoral em conformidade com TSE (PDFKit)
│       │   ├── proposals/       # Batch LLM Proposal Translation (Gemini)
│       │   ├── matching/        # Orquestração de matching stateless (/api/matching/rank)
│       │   ├── ads/             # Rede de Anúncios Éticos, Onboarding Self-Service, BlackoutGuard e Media Kit
│       │   ├── finance/         # Transparência financeira, livro-caixa aberto e doações PIX manuais
│       │   ├── public-api/      # API Pública Tiered (Free/Pro/Enterprise), HMAC keys SHA-256 e rate limits
│       │   ├── watchdog/        # Observatório de Mandatos, votações nominais (Câmara/Senado) e promessômetro
│       │   ├── reports/         # Relatórios B2B cívicos e telemetria agregada Coleta Zero
│       │   ├── common/ops-mode/ # OpsModeModule: Gestão de ciclo de vida (Active, Watchdog, Sunset/Archive)
│       │   ├── geo/             # Geolocation API + IBGE Localidades
│       │   └── common/          # Prisma, Health, Filters, Throttler, Timing-Safe Guarantees
│       └── prisma/
│           ├── schema.prisma    # Models (Candidate, Proposal, User, Advertiser, ApiKey, LegislativeVote, ReportProduct, etc.)
│           ├── schema-sqlite.prisma # Schema adaptado para SQLite
│           └── seed.ts          # Candidaturas oficiais sincronizadas nas 27 UFs
├── packages/
│   └── shared/
│       ├── src/index.ts         # Exportação central
│       ├── src/pillars-core.ts  # Definição e catálogo dos 13 pilares
│       └── src/pillar-justificativa.ts # Memória de cálculo auditável (40/30/30) e Gap Analysis
├── services/
│   ├── matching/                # Python FastAPI Microservice
│   │   ├── app/
│   │   │   ├── schemas.py       # Pydantic v2 models
│   │   │   ├── algorithms.py    # Matching ponderado 13 pilares (rank_by_pillars)
│   │   │   └── main.py          # /matching/rank & /matching/batch endpoints
│   │   └── tests/
│   │       └── test_core.py     # Unittests & pytest
│   └── etl/                     # Pipeline de dados TSE
├── docs/                        # Documentação completa do projeto
├── docker-compose.yml
├── turbo.json
└── package.json
```

### 3. Links Externos
| Recurso | URL |
|---------|-----|
| TSE — Portal de Dados Abertos | https://dadosabertos.tse.jus.br |
| TSE — DivulgaCandContas | https://divulgacandcontas.tse.jus.br |
| Câmara dos Deputados — Dados Abertos | https://dadosabertos.camara.leg.br |
| Senado Federal — Dados Abertos | https://legis.senado.leg.br/dadosabertos |
| CEPESP Data | https://cepesp.io |
| Supabase Dashboard | https://supabase.com/dashboard |
| Expo Docs | https://docs.expo.dev |
| NestJS Docs | https://docs.nestjs.com |
| LGPD | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm |
