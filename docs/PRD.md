---
title: "Product Requirements Document (PRD)"
version: "2.2.0"
last_updated: "2026-09-08"
---

# PRD — Eleições Progressistas

> **Resumo:** Especificação de requisitos da plataforma, cobrindo os 13 pilares ideológicos, user stories principais (incluindo Cola Eleitoral 2026 e Observatório de Mandatos), lógica do algoritmo e restrições de privacidade.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Priorities Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Watchdog (Observatório), Ads (Anúncios Éticos), Finance (Sustentabilidade PIX), Public-API (Tiered API), Reports (Relatórios B2B)

## Conteúdo específico

### 1. Objetivo & Visão Geral

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

### 2. Os 13 Pilares Ideológicos
| # | Pilar | Foco Temático |
|---|-------|---------------|
| P1 | Bem-Estar & Assistência Social | Segurança alimentar, saneamento, moradia digna e assistência básica. |
| P2 | Justiça Social & Direitos | Igualdade racial, de gênero e direitos trabalhistas dos cidadãos. |
| P3 | Desenvolvimento Sustentável | Transição energética, proteção ambiental e justiça climática. |
| P4 | Soberania & Valores Nacionais | Defesa das empresas públicas, riquezas estratégicas e cultura nacional. |
| P5 | Reindustrialização & Tecnologia | Nova Indústria Brasil, inovação e soberania tecnológica sem subsídios predatórios. |
| P6 | Distribuição Justa de Renda | Tributação progressiva sobre super-ricos, renda básica e justiça fiscal. |
| P7 | Proteção do Vulnerável | Primeira infância, idosos, PCDs e rede de proteção social legalmente garantida. |
| P8 | Governo Eficiente & Transparência | Prestação de contas, transparência ativa, dados abertos e combate à corrupção. |
| P9 | Saúde Pública Universal | Fortalecimento do SUS, equipes de Saúde da Família e atendimento 100% público e gratuito. |
| P10 | Segurança Pública Cidadã | Inteligência policial, perícia, desmilitarização gradual e direitos humanos. |
| P11 | Educação Pública & Emancipatória | Escola pública em tempo integral, valorização dos professores, financiamento (FUNDEB) e ciência. |
| P12 | Relações do Trabalho e Emprego | Valorização do trabalho formal, defesa dos direitos trabalhistas, combate à precarização, segurança jurídica laboral e qualificação profissional. |
| P13 | Empreendedorismo e Desoneração Responsável | Apoio ao microempreendedor (MEI), micro e pequenas empresas, microcrédito orientado e incentivos fiscais transparentes com contrapartidas. |

### 3. User Stories
#### 3.1 Consulta por Prioridades & Localização
| ID | Story | Critério de Aceitação |
|----|-------|----------------------|
| US-01 | Como eleitor, quero informar minha localização (GPS ou seleção manual em modal dos 27 estados e cidades) para ver candidatos da minha região | GPS ou modal interativo com todos os estados/cidades (IBGE Localidades) → UF + município + visão nacional com circunscrição respeitada |
| US-02n | Como eleitor, quero priorizar até 3 temas sem informar minhas opiniões (filtros apenas em sessão) | Seleção opcional de até 3 temas prioritários em memória local (peso 3.0x), sem persistência nem coleta de dados |

#### 3.2 Matching, Transparência & Auditoria
| ID | Story | Critério de Aceitação |
|----|-------|----------------------|
| US-04 | Como eleitor, quero ver candidatos compatíveis por afinidade política | Ranqueamento por % de alinhamento com ponderação dos 13 pilares, respeitando o filtro comportamental empírico e iluminista (exclusão de bancadas com votos contrários a consensos científicos e salvaguardas técnicas: PL, Republicanos, PP, União Brasil, Avante, Patriotas, PRD, MDB, PSD, Podemos, NOVO, PSDB e Missão) |
| US-05 | Como eleitor, quero ver chapas majoritárias unificadas | Presidente, Governador e Prefeito exibidos com indicação do cabeça e Vice |
| US-06 | Como eleitor, quero ver o Plano Oficial de Governo | Exibição obrigatória do plano de governo TSE com link para o PDF oficial em cargos executivos |
| US-07 | Como eleitor, quero propostas traduzidas por IA | Tradução em linguagem simples via pipeline LLM batch noturno |
| US-08 | Como eleitor, quero buscar qualquer candidato do Brasil por nome, partido ou cargo com rolagem lateral fluida | Barra de busca em tempo real e filtro de cargos horizontal ("Todos", "Presidente", "Governador", "Senador", "Dep. Fed.", "Dep. Est.") com setas de navegação lateral (`‹` e `›`), suporte a rolagem via roda do mouse e touch swipe |
| US-09 | Como eleitor, quero verificar a veracidade das informações na fonte oficial | Banner e botões de atalho direto para o Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`) |
| US-10 | Como eleitor, quero entender o percentual de comprometimento no Card Expandido | Memória de cálculo auditável `(Votações: 40%) + (Discursos: 30%) + (Posturas: 30%)`, acompanhada de Gap Analysis com o motivo do afastamento de 100% |
| US-11 | Como eleitor, quero ver apenas a foto oficial de campanha ou retrato individual sozinho(a) | Exclusivo foto oficial de campanha do TSE ou retrato oficial da Câmara/Senado sozinho, sem fotos em grupo ou de comícios |
| US-12 | Como eleitor, quero selecionar meus candidatos e gerar uma colinha eleitoral em PDF | Seleção de candidatos por cargo na ordem oficial da urna (Resolução TSE nº 23.736/2024), com fotos, números em destaque, download de PDF, impressão e compartilhamento via WhatsApp e E-mail |
| US-13 | Como eleitor, quero visualizar os candidatos à Presidência da República em qualquer estado | Circunscrição nacional oficial: Presidente é retornado e exibido em qualquer UF selecionada (ex: RJ, SP, DF) sem truncamento alfabético |
| US-14 | Como eleitor, quero acompanhar o mandato dos eleitos da minha cola no pós-eleição | Monitoramento 100% stateless de votações nominais e promessas de campanha (Promessômetro) via dados abertos da Câmara e Senado, com alertas de divergência e zero rastreamento do usuário |

#### 3.3 Sustentabilidade, Monetização Ética & API Pública
| ID | Story | Critério de Aceitação |
|----|-------|----------------------|
| US-15 | Como anunciante cívico, quero veicular anúncios éticos e contextualizados | Onboarding self-service (`/ads/submit`), moderação ética rigorosa, pagamento manual via PIX (hospedagem fiscal), blackout eleitoral 48h antes do pleito e contadores agregados |
| US-16 | Como pesquisador ou jornalista, quero consumir dados eleitorais programaticamente | API Pública Tiered (`/v1/public/*`) com chaves SHA-256, autenticação timing-safe, rate limits diários por tier (Free 1.000, Pro 50.000, Enterprise ilimitado) e exportação aberta |
| US-17 | Como organização civil ou analista, quero adquirir relatórios analíticos B2B | Catálogo público (`/reports/catalog`), pedidos via PIX, entrega assinada via HMAC-SHA256 em JSON/CSV/PDF e telemetria baseada em agregação anônima |
| US-18 | Como eleitor, quero perguntar diretamente à proposta de mandato por tema de interesse | Mecanismo inteligente client-side in-memory de busca semântica e expansão cívica, com ordenação por relevância e highlight visual em diretrizes e metas (Prejuízo Zero e Coleta Zero) |

### 4. Algoritmo de Matching (rank_by_pillars)
```
Input: priority_pillars (até 3, opcional)
       candidate.profileScores (0.0-1.0 para p1..p13)

Cálculo:
  weight = 3.0 se pilar é prioridade, senão 1.0
  focus = candidate_score (ou 0.5 se ausente, is_estimated = true)
  score = Σ(focus × weight) / Σ(weights) × 100
  +5 bônus Ficha Limpa (cap 100)

Output: score (0-100), match_reason, is_estimated, priority_aligned
```

### 5. Diretriz Conceitual: Interesse Nacional e Desonerações
- Voto contrário ou ressalva a pacotes de desoneração fiscal bilionária para grandes multinacionais e montadoras sem salvaguardas trabalhistas rígidas **NÃO compromete o índice progressista**, pois a concessão de renúncia fiscal sem contrapartidas econômicas e sociais comprovadas contraria o interesse público e nacional.

### 6. Funcionalidades Core
| Feature | Dependências | Status |
|---------|-------------|--------|
| Geolocalização (GPS + seleção modal UF/Município) | Geolocation API + IBGE Localidades | Produção |
| Consulta por Prioridades (Stateless, 13 pilares) | Shared Package `@np/shared` | Produção |
| Matching Ponderado com Fallback Local | Python FastAPI Microservice + TS Local | Produção |
| Chapas Majoritárias Unificadas | Prisma DB + CandidateCard | Produção |
| Plano Oficial de Governo (TSE) | DivulgaCandContas TSE | Produção |
| Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`) | REST / CKAN API + UI Banner | Produção |
| Batch Translation LLM | Gemini API + Cron 03:00 AM | Produção |
| Resiliência & Fallback Offline | CandidatesService + Client Cache | Produção |
| Busca Nacional e Filtros de Cargos (Rolagem Lateral & Âmbito Nacional) | Candidates API + Sticky Header + Lateral Scroll UI | Produção |
| Card Expandido com Justificativa e Gap Analysis | Shared Package + Raio-X UI | Produção |
| Padronização de Retratos Individuais Oficiais | TSE + Câmara + Senado | Produção |
| Gerar Cola Eleitoral (PDF, Impressão & Compartilhamento) | ColaModule (PDFKit) + useColaStore + ColaModal | Produção |
| Blindagem Anti-Hacker (Defense-in-Depth) | `@nestjs/throttler` + `GlobalHttpExceptionFilter` + `helmet` + `crypto.timingSafeEqual` | Produção |
| Rede de Anúncios Éticos & Onboarding Self-Service | AdsModule + BlackoutGuard + Local Device Hash Opt-out | Produção |
| Sustentabilidade Cívica & Transparência Financeira | FinanceModule + PIX Manual + Livro-Caixa Aberto | Produção |
| API Pública Tiered v1 para Pesquisa & Mídia | PublicApiModule + ApiKeyGuard + Throttler | Produção |
| Observatório de Mandatos & Promessômetro | WatchdogModule + Dados Abertos Congresso Nacional + Stateless Alerts | Produção |
| Relatórios B2B & Telemetria Agregada | ReportsModule + AggregateCounters (Anônimos) + PDFKit | Produção |
| Gestão de Ciclo de Vida & Sunset Clause | OpsModeService + Cláusula de Pôr do Sol (Prejuízo Zero) | Produção |
| Rotas Mobile Cívicas (/transparencia, /observatorio, /relatorios, /anuncie, /media-kit, /api-publico, /apoie, /manual) | Expo Router + Interface Responsiva | Produção |
| Pergunte à Proposta de Mandato (Busca Semântica Client-Side) | civic-search.ts (In-Memory TF-IDF + Dicionário Cívico) + Raio-X UI | Produção |

### 7. Restrições
- **LGPD:** Nenhuma preferência ou opinião política armazenada; matching 100% stateless
- **Device Hash:** Utilizado exclusivamente para opt-out voluntário de anúncios éticos
- **Legislação Eleitoral:** Sem endorsement, sem financiamento de campanha
- **Escopo Nacional:** Cobertura de todas as 27 UFs para Eleições Gerais 2026
- **Segurança Cibernética:** Rate limiting inteligente, sanitização total de stack traces e capping de payload em 512 KB contra DoS/brute-force

### 8. Métricas de Sucesso
| Métrica | Target (6 meses) |
|---------|-------------------|
| Downloads | 100K |
| Matching views | > 80% das sessões |
| Prioridades selecionadas | > 50% dos usuários escolhem ao menos 1 tema prioritário |
| Retenção semanal | > 45% durante campanha eleitoral |
