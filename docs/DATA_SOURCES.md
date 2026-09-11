---
title: "Fontes de Dados Públicos"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Fontes de Dados Públicos Brasileiros

> **Resumo:** Listagem e documentação de todas as fontes de dados externos da aplicação (TSE, IBGE, API, CEPESP), seus métodos de acesso, limites e integração com o Prisma.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Priorities Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Watchdog (Observatório de Mandatos), Ads (Anúncios Éticos), Finance (Sustentabilidade PIX), Public-API (Tiered API), Reports (Relatórios B2B)

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Conteúdo específico

### 1. Matriz de Fontes de Dados

| Fonte | Tipo | Endpoint Base | Autenticação | Rate Limit | Formato | Custo | Confiabilidade | Cobertura |
|-------|------|---------------|--------------|------------|---------|-------|----------------|-----------|
| TSE — Portal de Dados Abertos | CKAN/REST | `https://dadosabertos.tse.jus.br/` | Não | Sem limite público | JSON/CSV/ZIP | Gratuito | Máxima (Oficial e Confiável) | Nacional (Candidatos, Bens, Prestação de Contas, Estatísticas) |
| TSE — DivulgaCandContas | REST/CSV | `https://divulgacaocontas.tse.jus.br/divulga/rest/v1/` | Não | Não documentado | JSON/CSV | Gratuito | Alta | Nacional (candidatos 2002+) |
| TSE — Repositório de Dados | CSV/DBF | `https://cdn.tse.jus.br/estatistica/sead/odsele/` | Não | Sem limite | CSV/DBF/ZIP | Gratuito | Alta | Nacional (1982+) |
| TSE — Divulga Resultados | REST | `https://resultados.tse.jus.br/oficial/ele2024/` | Não | Não documentado | JSON | Gratuito | Alta | Nacional (eleições oficiais) |
| CEPESP Data | REST | `https://cepesp.io/api/` | API Key (gratuita) | [VERIFICAR] | JSON | Gratuito | Alta | Nacional (Câmara+Senado) |
| Câmara — Dados Abertos | REST/OAI | `https://dadosabertos.camara.leg.br/api/v2/` | Não | 10 req/s | JSON (LDP) | Gratuito | Alta | Deputados Federais |
| Senado — Dados Abertos | REST | `https://legis.senado.leg.br/dadosabertos/` | Não | [VERIFICAR] | JSON/XML | Gratuito | Alta | Senadores |
| Brasil.io | REST | `https://brasil.io/api/v1/` | Token (gratuito) | 10 req/min (free) | JSON | Gratuito | Média-Alta | Propostas + Autores |
| TCU — Consulta Processual | REST/HTML | `https://portal.tcu.gov.br/` | Não | [VERIFICAR] | HTML/JSON | Gratuito | Alta | Prestação de contas |
| CNJ — Consulta Processual | REST | `https://processual.trf1.jus.br/` | Não | [VERIFICAR] | JSON | Gratuito | Alta | Ações judiciais candidatos |
| CEIS/CNEP (Portal da Transparência) | CSV/API | `https://dadosabertos.tesouro.fazenda.gov.br/` | Não | [VERIFICAR] | CSV/JSON | Gratuito | Alta | Empresas e PF sancionadas |
| IBGE — Localidades | REST | `https://servicodados.ibge.gov.br/api/v1/` | Não | Sem limite | JSON | Gratuito | Alta | Municípios, microrregiões |
| ViaCEP | REST | `https://viacep.com.br/ws/` | Não | Sem limite | JSON | Gratuito | Alta | CEP → localidade |
| Assembleias Estaduais (SP, RJ, MG, BA, RS, PE, CE, PR, SC, PA) | REST/HTML | Diversos sites oficiais | Não | Variado | JSON/XML/HTML | Gratuito | Média | Deputados Estaduais específicos |

### 2. Mapeamento por Entidade do Schema Prisma

#### 2.1 Candidate
| Campo Prisma | Fonte | Endpoint | Freq. | Transformação |
|-------------|-------|----------|-------|---------------|
| `tseId` | TSE DivulgaCandContas | `/candidatura/listar/{ano}/{uf}/{cargo}/candidatos` | Anual | `sq_candidato` → string |
| `name` | TSE DivulgaCandContas | `nm_candidato` | Anual | Title case |
| `socialName` | TSE DivulgaCandContas | `nm_urna_candidato` | Anual | Nullable |
| `viceName` | TSE DivulgaCandContas | `nm_candidato_vice` / `nm_urna_vice` | Anual | Nome do(a) Vice (Governador e Presidente) |
| `numeroUrna` | TSE DivulgaCandContas | `nr_candidato` | Anual | Número de votação na urna |
| `party` | TSE DivulgaCandContas | `partido.sigla` | Anual | Sigla (ex: PT) |
| `partyNumber` | TSE DivulgaCandContas | `partido.numero` | Anual | Number |
| `cargo` | TSE DivulgaCandContas | `cargo.codigo` + `cargo.nome` | Anual | Mapear para enum Cargo |
| `level` | Derivado | — | — | Cargo → ElectionLevel (lookup table) |
| `municipality` | TSE DivulgaCandContas | `descricao_ue` | Anual | Nome do município |
| `state` | TSE DivulgaCandContas | `sigla_uf` | Anual | UF 2 chars |
| `cpfHash` | TSE DivulgaCandContas | `cpf_candidato` | Anual | SHA-256(cpf + salt) |
| `photoUrl` | TSE DivulgaCandContas / Câmara / Senado | `/arquivo/img/{eleicao}/{sqCand}/{uf}` ou `/bandep/{id}.jpg` / `senador{id}.jpg` | Anual | Download de fotos oficiais (urna/institucional sozinho) para `apps/mobile/public/candidates/` |
| `fichaLimpa` | CEIS + CNJ | CEIS: `situacao_pessoa`; CNJ: processo judicial | Mensal | `situacao_pessoa IN ('INIDÔNEA', 'PUNIDA') → false` |
| `financedBy` | TSE DivulgaCandContas | `/prestador/consulta_candidato` | Anual | Agregar doações por fonte |
| `votingHistory` | CEPESP + TSE Resultados | CEPESP: `/candidatos?ano={ano}&cargo={cargo}` | Anual | Série temporal de votos |
| `proposals` | Brasil.io + TSE Programa | Brasil.io: `/propostas/`; TSE programa eleitoral | Anual | Normalizar por pilar |
| `profileScores` | Calculado | — | Sob demanda | Algoritmo de scoring (13 pilares) |
| `coalition` | TSE DivulgaCandContas | `composicao_coligacao` | Anual | Nome/Composição da coligação |
| `isProgressiveSupported` | TSE / Registros Partidários | Declarado / Atos de apoio | Sob demanda | Boolean indicando apoio de partidos progressistas |
| `supportedBy` | TSE / Registros Partidários | Atos de apoio | Sob demanda | Detalhes dos partidos/frentes que apoiam |

#### 2.2 User
| Campo Prisma | Fonte | Endpoint | Freq. | Transformação |
|-------------|-------|----------|-------|---------------|
| `id` | Supabase Auth | `auth.users.id` | Real-time | UUID direto |
| `email` | Supabase Auth | `auth.users.email` | Real-time | Lowercase |
| `cep` | App (input do usuário) | — | Manual | Formato XXXXX-XXX |
| `municipality` | App (seleção manual) + IBGE Localidades | `servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios` | sob demanda | `nome` |
| `state` | Geolocation API (GPS) ou seleção manual (UF) | — | sob demanda | UF 2 chars |

#### 2.3 Processamento Stateless de Matching (Sem Questionários)
> **Nota Arquitetural:** Os models legados de formulários ideológicos e `MatchResult` foram excluídos do Prisma Schema. O matching funciona de forma **100% stateless**: o eleitor seleciona até 3 prioridades temáticas na memória da sessão (`priority_pillars`), e o cálculo de afinidade é computado em tempo de execução, sem persistência de votos ou preferências no banco de dados.

#### 2.5 SavedCandidate
| Campo Prisma | Fonte |
|-------------|-------|
| `candidateId` | App (input do usuário) |

### 3. Entidades Adicionais Necessárias

#### 3.1 VotingRecord
```prisma
model VotingRecord {
  id          String   @id @default(uuid()) @db.Uuid
  candidateId String
  externalId  String?  // ID externo da fonte (CEPESP, Câmara)
  source      String   // "CEPESP", "CAMARA", "SENADO", "ALE_SP"
  year        Int
  electionType String  // "MUNICIPAL", "ESTADUAL", "FEDERAL"
  cargo       Cargo
  party       String
  votes       Int      // Quantidade de votos
  elected     Boolean  // Eleito(Sim/Não)
  createdAt   DateTime @default(now())
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  @@unique([candidateId, source, year, electionType])
  @@index([candidateId, year])
  @@map("voting_records")
}
```
**Fontes:** TSE Resultados, CEPESP Data, Câmara, etc.

#### 3.2 CampaignFinance
```prisma
model CampaignFinance {
  id              String   @id @default(uuid()) @db.Uuid
  candidateId     String
  electionYear    Int
  totalReceived   Decimal  @db.Decimal(15,2)
  totalSpent      Decimal  @db.Decimal(15,2)
  totalDonations  Int
  maxDonation     Decimal  @db.Decimal(15,2)?
  donors          Json?    // [{ name, amount, type, cpfCnpj }]
  expenses        Json?    // [{ category, amount, description }]
  source          String   // "TSE_DIVULGA"
  lastSyncAt      DateTime @default(now())
  createdAt       DateTime @default(now())
  candidate       Candidate @relation(fields: [candidateId], references: [id])
  @@unique([candidateId, electionYear])
  @@map("campaign_finance")
}
```
**Fontes:** TSE DivulgaCandContas, TSE Repositório.

#### 3.3 IntegrityFlag
```prisma
model IntegrityFlag {
  id          String   @id @default(uuid()) @db.Uuid
  candidateId String
  source      String   // "CEIS", "CNEP", "TCU", "TST", "CNJ"
  flagType    String   // "SANCAO", "PROCESSO", "IRREGULARIDADE", "INIDONEA"
  description String
  severity    String   // "BAIXA", "MEDIA", "ALTA", "CRITICA"
  date        DateTime?
  resolved    Boolean  @default(false)
  referenceUrl String?
  createdAt   DateTime @default(now())
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  @@index([candidateId, source])
  @@map("integrity_flags")
}
```
**Fontes:** CEIS, CNEP, TCU, TST, CNJ.

#### 3.4 Proposal
```prisma
model Proposal {
  id          String   @id @default(uuid()) @db.Uuid
  candidateId String
  pillar      String   // "p1"-"p10"
  title       String
  description String
  source      String   // "TSE_PROGRAMA", "BRASILIO", "CROWDSOURCE"
  version     Int      @default(1)
  createdAt   DateTime @default(now())
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  @@index([candidateId, pillar])
  @@map("proposals")
}
```
**Fontes:** TSE Programa Eleitoral, Brasil.io, Crowdsourcing.

### 4. Estratégia de ETL

#### 4.1 Jobs de Ingestão
| Job | Fonte | Frequência | Runtime Esperado | Prioridade | Dependências |
|-----|-------|------------|------------------|------------|--------------|
| `sync_candidates_tse` | TSE DivulgaCandContas | Anual (+ 30/60/90 dias pós-eleição) | 10-30 min | P0 | Nenhuma |
| `sync_candidates_local` | TSE Repositório (CSV) | Anual | 5-15 min | P0 | `sync_candidates_tse` |
| `sync_voting_results` | TSE Resultados | Pós-eleição (24h) | 30-60 min | P0 | `sync_candidates` |
| `sync_voting_history` | CEPESP Data | Anual | 15-30 min | P1 | `sync_candidates` |
| `sync_finance_divulga` | TSE DivulgaCandContas | Mensal (durante campanha) | 5-10 min | P1 | `sync_candidates` |
| `sync_finance_csv` | TSE Repositório CSV | Anual | 10-20 min | P1 | `sync_candidates` |
| `sync_integrity_ceis` | CEIS (Tesouro) | Mensal | 2-5 min | P1 | Nenhuma |
| `sync_integrity_cnep` | CNEP (Tesouro) | Mensal | 2-5 min | P1 | Nenhuma |
| `sync_integrity_tcu` | TCU | Trimestral | 10-20 min | P2 | Nenhuma |
| `sync_integrity_cnj` | CNJ | Mensal | 5-10 min | P2 | Nenhuma |
| `sync_proposals_tse` | TSE Programa | Anual | 5-10 min | P1 | `sync_candidates` |
| `sync_proposals_brasilio` | Brasil.io | Semanal | 5-10 min | P2 | Nenhuma |
| `sync_ibge_localities` | IBGE | Semestral | < 1 min | P2 | Nenhuma |
| `compute_matching` | (interno) | Sob demanda | < 1s por consulta | P0 | `sync_candidates`, `priority_pillars` |
| `compute_profile_scores` | (interno) | Sob demanda | 1-5s por candidato | P0 | `sync_candidates`, `voting_records`, `campaign_finance` |

#### 4.2 Pipeline de Scoring (perfil do candidato)
```
Input: voting_records + campaign_finance + integrity_flags + proposals
        ↓
Normalizar cada dimensão (0-100) (p1 a p13)
        ↓
Média ponderada (votações 40%, discursos 30%, posturas 30%)
        ↓
Output: candidate.profileScores { p1..p13 }
```

#### 4.3 Mapeamento de Cargos
| Cargo TSE | Cargo Prisma | Level |
|-----------|-------------|-------|
| Vereador | VEREADOR | MUNICIPAL |
| Prefeito | PREFEITO | MUNICIPAL |
| Vice-Prefeito | VICE_PREFEITO | MUNICIPAL |
| Deputado Estadual | DEPUTADO_ESTADUAL | ESTADUAL |
| Governador | GOVERNADOR | ESTADUAL |
| Vice-Governador | VICE_GOVERNADOR | ESTADUAL |
| 1º Suplente de Senador / 2º Suplente | SENADOR | ESTADUAL |
| Deputado Federal | DEPUTADO_FEDERAL | FEDERAL |
| Presidente | PRESIDENTE | FEDERAL |
| Vice-Presidente | VICE_PRESIDENTE | FEDERAL |

#### 4.4 Formato e Ordenação da Cola Eleitoral 2026 (Resolução TSE nº 23.736/2024)
| Ordem de Votação | Cargo | Dígitos na Urna | Escopo Territorial |
|------------------|-------|-----------------|---------------------|
| 1º | Deputado Federal | 4 dígitos | Estadual (UF) |
| 2º | Deputado Estadual / Distrital | 5 dígitos | Estadual (UF/DF) |
| 3º | Senador (1º Voto) | 3 dígitos | Estadual (UF) |
| 4º | Senador (2º Voto) | 3 dígitos | Estadual (UF) |
| 5º | Governador | 2 dígitos | Estadual (UF) |
| 6º | Presidente da República | 2 dígitos | Nacional |

#### 4.5 Endpoints Detalhados
*(Consulte a seção correspondente para APIs REST do TSE, CEPESP, Câmara, Senado e Brasil.io - alguns dados requerem chave de acesso)*

### 5. Cronograma de Atualização
| Dado | Frequência | Trigger |
|------|------------|---------|
| Candidatos | Anual + pós-eleição | Eleição municipal/estadual/federal |
| Financiamento | Mensal (campanha) | Período eleitoral |
| Votações | Pós-eleição | TSE publica resultado |
| Integridade (CEIS/CNEP) | Mensal | Tesouro atualiza base |
| Integridade (TCU/CNJ) | Trimestral | Publicação de acórdãos |
| Propostas | Anual | Programa eleitoral |
| IBGE localidades | Semestral | Atualização IBGE |
| Matching scores | Sob demanda | Consulta de Prioridades em sessão |

### 6. Limitações e Riscos
| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| TSE muda estrutura JSON | Alto | Versionamento de schemas + fallback CSV |
| Rate limit CEPESP | Médio | Cache 24h + batch queries |
| Dados Assembleias inconsistentes | Alto | Priorizar TSE/CEPESP como fonte primária |
| Dados atrasados (TCU/CNJ) | Médio | Mostrar data da última atualização |
| Ausência de dados para mun. pequenos | Médio | Crowdsourcing + dados estaduais |
| CEPESP API Key rate limit | Médio | Cache + fila de processamento |

### 7. Checklist de Setup
- [ ] Obter API Key CEPESP: `https://cepesp.io/`
- [ ] Obter Token Brasil.io: `https://brasil.io/conta/token/`
- [ ] Verificar endpoints TSE DivulgaCandContas para eleição mais recente
- [ ] Testar parsing de CSVs TSE Repositório
- [ ] Verificar endpoints das 10 Assembleias estaduais
- [ ] Configurar fila de jobs (Bull/BullMQ + Redis)
- [ ] Criar cron de atualização automática
- [ ] Implementar dedup de candidatos (CPF hash)
