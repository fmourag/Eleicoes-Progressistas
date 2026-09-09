---
title: "Monetização"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Estratégias de Sustentabilidade Financeira

> **Resumo:** Diretrizes de monetização ética, incluindo fontes de receita sustentáveis e sem viés comercial para a plataforma.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Priorities Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Ads (Anúncios Éticos), Finance (Sustentabilidade PIX), Public-API (Tiered API), Watchdog (Observatório de Mandatos), Reports (Relatórios B2B)

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Conteúdo específico

### 1. Princípios
| Princípio | Descrição |
|-----------|-----------|
| Gratuidade primária | App sempre gratuito para eleitores |
| Cola Eleitoral gratuita | Geração de PDF, download, impressão e compartilhamento 100% livres de taxas ou paywalls |
| Sem endorsement | Nunca indicar/vetar candidatos |
| Transparência | Receitas públicas no site |
| LGPD/LEI | Sem venda de dados pessoais |
| Sem viés | Monetização não pode influenciar matching |

### 2. Fontes de Receita
#### 2.1 Doações Voluntárias (In-App)
| Item | Detalhes |
|------|---------|
| Modelo | Doação única ou recorrente (mensal) |
| Valores | R$5, R$10, R$25, R$50, personalizado |
| Canal | In-app purchase (Stripe/Pix) |
| Destaque | "Apoie a democracia" |
| Expectativa | 2% conversão × R$10 média |

#### 2.2 Parcerias com ONGs / Sociedade Civil
| Item | Detalhes |
|------|---------|
| Modelo | Co-branding, conteúdo patrocinado (transparency) |
| Exemplo | Transparência Internacional, Fórum Social |
| Receita | Doações de ONGs + visibility |
| Risco | Baixo (sem viés eleitoral) |

#### 2.3 API Pública Tiered (Pesquisadores & Jornalistas)
| Item | Detalhes |
|------|---------|
| **Modelo** | Modelo Tiered: FREE (Pesquisa/Geral) e PAID (Profissional/Jornalismo) |
| **Público-Alvo** | Universidades, centros de pesquisa, redações de jornalismo de dados e ONGs |
| **Tier FREE** | **R$ 0,00** — 1.000 req/dia, emissão self-service instantânea (`POST /api/public/keys`) |
| **Tier PAID** | **R$ 200,00 / mês** — 10.000 req/dia, votações nominais, integridade, gap analysis e CSV dump |
| **Cobrança Ética** | Ativação manual pós-pagamento PIX institucional (sem intermediários ou gateways com taxas predatórias) |
| **LGPD & Segurança** | Zero dados pessoais de eleitores (Coleta Zero); chaves armazenadas apenas em hash SHA-256 |

#### 2.4 Premium para Analistas Políticos
| Item | Detalhes |
|------|---------|
| Modelo | Assinatura mensal |
| Features | Export de dados, relatórios avançados, alerts |
| Preço | R$49-199/mês |
| Target | Jornalistas, analistas, consultores políticos |

#### 2.5 Grants e Financiamento
| Fonte | Tipo |
|-------|------|
| Google.org | Impacto social |
| Open Society | Democracia |
| FAPESP/CNPq | Pesquisa |
| Embaixadas | Cooperação democrática |

#### 2.6 Observatório de Mandatos & Monitoramento Cívico (Assinaturas para ONGs & Institutos)
| Item | Detalhes |
|------|---------|
| **Modelo** | Assinatura institucional mensal pós-eleição para monitoramento temático contínuo |
| **Público-Alvo** | ONGs socioambientais, sindicatos, coletivos cívicos, institutos de políticas públicas |
| **Faixa de Preço** | **R$ 100,00 a R$ 500,00 / mês** (por pilar temático monitorado) |
| **Entregáveis** | Relatórios trimestrais consolidados de fidelidade partidária, mapas de convergência legislativa, painéis analíticos com alertas imediatos de quebra de promessas e exportação tabular completa (CSV/JSON) |
| **Custo de Infra Adicional** | **R$ 0,00** — processamento em cron noturno com cache em memória e banco já provisionado |

#### 2.7 Relatórios Analíticos B2B (Catálogo sob Demanda com PIX Manual)
| Item | Detalhes |
|------|---------|
| **Modelo** | Venda avulsa de relatórios analíticos estratégicos baseados em dados abertos públicos e telemetria estritamente agregada |
| **Público-Alvo** | Redações de jornalismo investigativo, institutos de pesquisa, think tanks, federações e entidades do terceiro setor |
| **Catálogo Inicial** | • Relatório Nacional de Prioridades Cívicas (R$ 250,00)<br>• Painel do Promessômetro Legislativo (R$ 300,00)<br>• Índice de Comprometimento Progressista por Bancada (R$ 350,00)<br>• Mapeamento de Financiamento Cívico (R$ 400,00) |
| **Formato de Entrega** | JSON, CSV tabular e PDF estruturado com chancela técnica |
| **Hospedagem Fiscal & Pagamento** | Pagamento via PIX manual com conciliação offline — zero taxas de gateways predatórios |
| **Garantia Coleta Zero** | Baseado exclusivamente em contadores numéricos sem identificadores de dispositivos, sessões ou eleitores |

### 3. Projeção de Receita (12 meses)
| Fonte | Mês 3 | Mês 6 | Mês 12 |
|-------|-------|-------|--------|
| Doações | R$2K | R$8K | R$25K |
| ONGs | R$0 | R$5K | R$15K |
| API B2B | R$0 | R$2K | R$10K |
| Premium | R$0 | R$1K | R$8K |
| Grants | R$10K | R$20K | R$30K |
| **Total** | **R$12K** | **R$36K** | **R$88K** |

### 4. Restrições Legais
| Regra | Implicação |
|-------|-----------|
| Lei 9.504/97 | Sem doação de empresas; pessoa física até limite |
| Lei 9.790/99 | OSCIP para receber doações (se aplicável) |
| LGPD | Sem venda de dados; consentimento obrigatório |
| TSE Res. | Sem uso de app para captação de votos remunerada |

#### Compliance
- App NÃO capta doações para candidatos
- Doações recebidas são APENAS para manutenção do app
- Transparente: página pública de receitas/despesas
- Advogado eleitoral consultado previamente

### 5. Estrutura Legal Recomendada
```
Opção A: OSCIP (Organização da Sociedade Civil de Interesse Público)
  → Vantagem: isenção fiscal, credibilidade
  → Razo: burocracia, prestação de contas

Opção B: Associação Civil (sem fins lucrativos)
  → Vantagem: flexibilidade
  → Razo: sem isenção fiscal automática

Recomendação: Iniciar como Associação, migrar para OSCIP no mês 6.
```

### 6. Não-Monetização (Linhas Vermelhas)
- ❌ Vender dados de eleitores
- ❌ Patrocínio de candidatos/partidos
- ❌ Paywall em dados públicos de candidatos
- ❌ Algoritmo de matching manipulável por patrocinador
- ❌ Publicidade política paga dentro do app

### 7. Rede de Anúncios Éticos (Ethical Ad Network)
A plataforma conta com um subsistema nativo de anúncios éticos, projetado sob os princípios de *Zero Tracking*, curadoria ideológica e transparência irrestrita:

#### 7.1 Categorias Permitidas (Whitelist)
Apenas organizações com missão alinhada aos 13 pilares podem veicular apoios:
- **ONGs & Fundações de Direitos Humanos / Justiça Social** (P1, P2, P7)
- **Cooperativas de Produção, Reforma Agrária & Energia Limpa** (P3, P6)
- **Empresas Verdes & Sustentáveis** (B-Corps, economia circular, transição ecológica - P3, P5)
- **Sindicatos, Associações Profissionais & Centrais de Trabalhadores** (P12)
- **Institutos de Pesquisa, Editoras & Plataformas de Educação Popular** (P11, P13)

#### 7.2 Lista Negra (Blacklist Estrita)
Veto absoluto e permanente a:
- Candidatos, comitês de campanha e partidos políticos
- Instituições financeiras tradicionais e bancos privados especulativos
- Casas de apostas esportivas, cassinos online e "bets"
- Esquemas de criptomoedas e day trade
- Indústria armamentista, bélica e de segurança privada predatória
- Indústria de tabaco, fumígenos e ultraprocessados predatórios

#### 7.3 Modelos de Sustentabilidade Financeira
- **Parceria Fixa / Apoio Institucional:** Patrocínio por cota mensal com contrato transparente.
- **CPT (Custo por Tempo):** Contratos temporais sem dependência de volume de cliques.
- **CPM / CPC Ético:** Métricas contadas localmente de forma agregada (apenas contadores inteiros no banco, sem perfilamento).

#### 7.4 Compliance Eleitoral (Suspensão Automática)
- **Blackout Eleitoral:** Conforme as normas da Justiça Eleitoral e do TSE, o sistema suspende automaticamente a veiculação de qualquer anúncio no período oficial de campanha eleitoral (**16 de agosto a 05 de outubro**). Qualquer requisição à API de anúncios durante esta janela retorna imediatamente nula.

#### 7.5 Transparência Radical & Opt-out
- **Página Pública de Transparência:** Qualquer cidadão pode auditar receitas, CNPJs, pilares alinhados e contratos ativos via `GET /api/ads/transparency`.
- **Opt-out Respeitado:** Usuários têm direito a optar por não visualizar anúncios por 30 dias com 1 clique (`POST /api/ads/opt-out`), registrado apenas via hash anonimizado do dispositivo.

#### 7.6 Onboarding Self-Service & Fila de Aprovação de Anunciantes
O ciclo de vida comercial da plataforma é automatizado com controle estrito de conformidade cívica:
- **Submissão Pública (`POST /api/ads/apply`):** Formulário self-service no app (`/anuncie`) e web com validação de CNPJ brasileiro (dígitos verificadores oficiais), seleção de 1 a 3 pilares temáticos, categoria e dados de contato. Protegido por rate limiting (10 req/min) e campo anti-bot *honeypot* (`website`).
- **Status do Anunciante:** Fluxo governado por máquina de estados (`PROPOSTA` → `EM_ANALISE` → `APROVADO` / `RECUSADO` → `ATIVO` → `ENCERRADO`).
- **Fila de Triagem Editorial (`GET /api/ads/admin/applications`):** Painel restrito a administradores (`AdminGuard`) para avaliação de conformidade com a Whitelist/Blacklist com SLA operacional de 48 horas.
- **Revisão Formal (`PATCH /api/ads/admin/advertisers/:id/review`):** Transição de estado com registro de parecer editorial (`approved`, `reviewNotes`).
- **Formalização Contratual (`PATCH /api/ads/admin/advertisers/:id/contract`):** Homologação do valor contratual e janelas de veiculação (`startDate`, `endDate`). O sistema impõe programaticamente que `startDate` seja posterior ao término do blackout eleitoral (`>= 2026-10-05`).
- **Motor de Exibição Contextual (`AdsService.getContextualAd`):** Requer concomitantemente que a data esteja fora do blackout (16/08 a 05/10), status do anunciante seja `APROVADO` ou `ATIVO`, e que a data corrente esteja dentro da janela contratual estipulada.
- **Status de Ativação (`GET /api/ads/activation`):** Rota pública que informa a contagem regressiva para o término do blackout e se o inventário está servindo anúncios em tempo real.

### 8. Apoio Pontual e Publicação Sem Prejuízo

O pacote "Publicação Sem Prejuízo" implementa o compromisso de manter o aplicativo no ar enquanto houver utilidade pública e sustentabilidade financeira, sem transferir prejuízos pessoais aos mantenedores nem recorrer a práticas comerciais abusivas.

#### 8.1 Princípio de Autofinanciamento Comunitário (PIX Direto)
- **Zero Intermediários Abusivos:** Doações são realizadas diretamente via PIX pontual (chave Pix estática configurável por env).
- **Sem Dados Pessoais (LGPD):** A plataforma não armazena nome, CPF, e-mail ou dados bancários do doador. O registro do webhook armazena unicamente o identificador de evento para garantia de idempotência e o valor em centavos.
- **Blindagem do Webhook PIX (`/api/finance/pix/webhook`):** Protegido por assinatura HMAC com comparação em tempo constante via `crypto.timingSafeEqual` (mitigando ataques de canal lateral/timing attacks), rate limit restrito a 30 req/min e idempotência por chave de evento.
- **Sem Paywall e Sem Assinatura:** Todas as funcionalidades do app, incluindo matching com 13 pilares e geração/compartilhamento de Cola Eleitoral em PDF, são 100% gratuitas e irrestritas para qualquer cidadão.

#### 8.2 Custos Reais Estimados vs. Arrecadação para Break-Even

| Item | Provedor | Custo Mensal Estimado |
|---|---|---|
| Frontend Web & CDN | Cloudflare Pages | R$ 0,00 |
| API Backend | Render.com (ou Oracle Free Tier) | R$ 0,00 a R$ 35,00 |
| Banco de Dados | Supabase Free / Oracle Always Free | R$ 0,00 |
| Storage & Backups | Cloudflare R2 | R$ 0,00 |
| Domínio Registrado | Registro.br (.org.br) | R$ 3,33 (~R$ 40/ano) |
| **Custo Mensal Total Estimado** | — | **~R$ 38,33 / mês** |

> **Meta de Break-Even:** Bastam 8 doações pontuais de R$ 5,00 por mês para custear 100% da operação do aplicativo. Qualquer superávit acumulado é registrado publicamente no painel de transparência (`GET /api/finance/transparency`).

#### 8.3 Modos de Operação e Pôr do Sol Automático

A plataforma opera com três modos de governança de infraestrutura (`APP_MODE`):

1. **`full` (Padrão):**
   - Todas as rotas ativas (matching dinâmico, download de PDF da Cola, busca nacional, visualização de candidatos e módulo de transparência).
2. **`watchdog` (Vigilância Cívica):**
   - Otimizado para mandatos eletivos pós-pleito.
   - Rotas eleitorais de campanha e cálculo sob demanda retornam `410 Gone`.
   - Rotas de fiscalização parlamentar, histórico de votos e integridade permanecem ativas.
3. **`archive` (Arquivo Histórico Offline):**
   - Toda computação dinâmica do backend é desativada (`410 Gone`).
   - O frontend mobile/web exibe banner informativo permanente com link para o manifesto de arquivo.
   - O sistema passa a consumir estritamente os arquivos pré-computados estáticos.

**Cláusula de Pôr do Sol Automático:**
Se após **26 de outubro de 2026** (conclusão do 2º turno das Eleições Gerais 2026) a operação registrar déficit acumulado por 2 meses consecutivos, o sistema entra automaticamente em modo `archive`, eliminando quaisquer custos contínuos de computação dinâmica.

#### 8.4 Como Rodar o App Localmente com o Bundle Estático

Qualquer cidadão, pesquisador ou organização pode auditar ou executar o acervo histórico das Eleições 2026 localmente sem necessidade de servidor backend:

```bash
# 1. Gerar ou clonar os arquivos da pasta dist-archive/
npx tsx scripts/export-archive.ts

# 2. Inspecionar o acervo:
# - dist-archive/candidates-2026.json (todos os candidatos e scores dos 13 pilares)
# - dist-archive/scores-summary.json (médias consolidadas por partido e cargo)
# - dist-archive/cola-template.json (layout da colinha eleitoral para preenchimento)
# - dist-archive/manifest.json (hashes SHA-256 de integridade e data de corte)

# 3. Servir os arquivos localmente com qualquer servidor estático:
npx serve dist-archive
```

