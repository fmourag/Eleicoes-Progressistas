---
title: "Book de Projeto"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Book de Projeto

> **Resumo:** Documento de visão, missão, valores, público-alvo, jornada, impactos, riscos e ciclo de vida pós-eleição (Observatório de Mandatos) da plataforma Eleições Progressistas.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Prioridades (Stateless), Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Observatório de Mandatos (Watchdog), Anúncios Éticos (Ads), Sustentabilidade PIX (Finance), API Pública Tiered (Public-API), Relatórios B2B (Reports)

## Conteúdo específico

### 1. Objetivo & Missão

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

### 2. Visão
Ser a principal ferramenta de matching eleitoral do Brasil até 2030, com cobertura em todos os municípios e níveis de governo.

### 3. Valores
| Valor | Descrição |
|-------|-----------|
| Transparência Radical | Dados públicos, algoritmo auditável |
| Acessibilidade | App gratuito, linguagem simples, baixa renda |
| Imparcialidade | Matching baseado em dados, não viés editorial |
| Privacidade | LGPD-first, dados anonimizados |
| Impacto Social | Medir e publicar impacto democrático |

### 4. Público-Alvo

#### Primário
| Segmento | Idade | Perfil |
|----------|-------|--------|
| Primeiro eleitor | 16-24 | Pouca informação política, mobile-first |
| Eleitor undecided | 25-44 | Informado mas indeciso, busca dados |
| Ativista digital | 18-35 | Engajado, compartilha conteúdo |

#### Secundário
| Segmento | Perfil |
|----------|--------|
| Jornalistas/Analistas | Usam dados para cobertura |
| ONGs/Sociedade Civil | Usam para advocacy |
| Candidatos | Para entender audiência (sem endorsement) |

### 5. Jornada do Usuário

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Entrada/ │───▶│ Local/   │───▶│Prioridad.│───▶│ Matching │
│ Busca BR │    │Modal UFs │    │Opcionais │    │Stateless │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                         │
                                                         ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Observat.│◀───│   Cola   │◀───│ Auditoria│◀───│ Raio-X & │
│ Mandatos │    │Eleitoral │    │ Dados TSE│    │Retrato So│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

#### Fluxo Detalhado
1. **Entrada, Localização Nacional & Filtro de Cargos com Rolagem Lateral**: Usuário acessa o app, informa localização via GPS ou seleção modal dos 27 estados e cidades (IBGE) ou busca candidaturas no Brasil inteiro. O filtro de cargos conta com rolagem lateral dinâmica e botões de navegação (`‹` e `›`), roda do mouse (`wheel`) e gestos de toque, garantindo visibilidade total para Presidente (circunscrição nacional exibida em qualquer UF), Governador, Senador, Deputado Federal e Deputado Estadual sem corte visual em telas pequenas.
2. **Consulta por Prioridades (13 Pilares)**: O usuário pode opcionalmente destacar até 3 pilares de seu maior interesse (peso 3.0x no ranking). Não há questionário ideológico nem armazenamento de opiniões; as preferências ficam unicamente na memória de sessão.
3. **Matching Stateless com Filtro Comportamental Empírico e Iluminista**: Algoritmo ordena candidatos por proximidade aos pilares priorizados com exclusão de siglas com histórico de votação contra salvaguardas científicas e ambientais ou com contradições antiempíricas severas (como PL, REPUBLICANOS, PP, UNIÃO BRASIL, AVANTE, PATRIOTAS, PRD, MDB, PSD, PODEMOS, NOVO, PSDB e MISSÃO) e chapas majoritárias unificadas (Presidente/Vice). Nenhuma persistência de match é gravada no banco.
4. **Retratos Oficiais Padronizados**: Apresentação visual estrita com fotos oficiais de campanha registradas na urna pelo TSE ou retratos institucionais do parlamento (Câmara e Senado) do candidato sozinho(a).
5. **Raio-X & Justificativa do Comprometimento**: No card expandido de cada pilar, exibição da memória de cálculo auditável `(Votações: 40%) + (Discursos: 30%) + (Posturas: 30%)` e o diagnóstico detalhado do afastamento de 100% (Gap Analysis).
6. **Alinhamento ao Interesse Nacional**: Posturas contrárias a desonerações fiscais indiscriminadas a multinacionais sem contrapartidas sociais/trabalhistas são pontuadas positivamente como compromisso soberano com o país.
7. **Auditoria no Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`)**: Links e atalhos diretos na busca e no Raio-X para checagem imediata de registros na Justiça Eleitoral.
8. **Plano Oficial de Governo & Tradutor LLM**: Exibição obrigatória do documento oficial registrado no TSE e síntese em linguagem simples processada via pipeline noturno de IA.
9. **Cola Eleitoral 2026 (PDF & Compartilhamento)**: Montagem da colinha com fotos, dígitos da urna e ordem oficial do TSE (Resolução TSE nº 23.736/2024), com visualização instantânea, download em PDF para impressão em papel (conforme exigido na cabine de votação) e compartilhamento facilitado via WhatsApp e E-mail.
10. **Observatório de Mandatos & Promessômetro (Pós-Eleição)**: Transição contínua para fiscalização pós-pleito. O app lê os candidatos eleitos da cola local do dispositivo e consome dados abertos oficiais da Câmara dos Deputados e Senado Federal, gerando alertas de divergência cívica e acompanhamento de promessas de campanha registradas no TSE — de forma 100% stateless e com zero armazenamento de dados do eleitor.

### 6. Impacto Social Esperado
| Indicador | Meta |
|-----------|------|
| Eleitores informados | 100K+ em 6 meses |
| Redução de voto "em branco/nulo" | 5% dos usuários |
| Engajamento cívico | 30% DAU/MAU |
| Cobertura municipal | 100% dos municípios (fase 3) |
| Acessibilidade | App + Web, offline mode para baixa renda |

### 7. Riscos e Mitigações
| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Dados do TSE desatualizados | Alto | Sync diário + crowdsource atualização |
| Viés algorítmico | Alto | Algoritmo open-source, auditoria externa |
| Rejeição de candidatos | Médio | Dados públicos verificáveis, LGPD |
| Custo de LLM (Tradutor) | Médio | Cache, batch processing, rate limit |
| Eleições off-cycle | Baixo | Suporte a pleitos municipais/estaduais |
| Ataques cibernéticos (DDoS / Injeção / Força Bruta) | Crítico | Blindagem defense-in-depth: `@nestjs/throttler`, `GlobalHttpExceptionFilter`, `helmet` CSP/HSTS, teto de 512KB em payloads e `timingSafeEqual` |

### 8. Sustentabilidade Financeira e Monetização Ética (v2.2.0)
Para manter o aplicativo 100% gratuito ao eleitor, com independência editorial e sem custos de infraestrutura excedentes (Prejuízo Zero):
1. **Rede de Anúncios Éticos Contextuais**: Espaço para cooperativas, editoras, projetos sustentáveis e organizações cívicas alinhadas aos 13 pilares, com self-service, aprovação administrativa e blackout absoluto durante a campanha eleitoral oficial (16/08 a 05/10).
2. **Apoio Cívico Direto (PIX)**: Doações voluntárias transparentes via chave PIX sem intermediários pagos, com prestação de contas pública de custos operacionais.
3. **API Pública Tiered**: Acesso programático gratuito generoso (1.000 req/dia) e tiers profissionais sob demanda (10k a 50k req/dia) para jornalismo investigativo e institutos de pesquisa.
4. **Relatórios B2B Cívicos**: Catálogo de inteligência e estudos comparativos sobre dados públicos do TSE com entrega de relatórios em PDF/CSV/JSON e telemetria estritamente agregada (Coleta Zero).
5. **Governança Operacional & Sunset Clause (`OpsMode`)**: Gestão formal de ciclo de vida (`full`, `watchdog` e `archive`) com cláusula de pôr do sol automática para modo estático arquivado caso haja déficit após o 2º turno (26/10/2026), blindando os mantenedores contra custos de infraestrutura.

#### Rotas Mobile de Acesso Público
- `/transparencia`: Livro-caixa aberto e prestação de contas de infraestrutura.
- `/observatorio`: Monitoramento de mandatos e promessômetro no pós-pleito.
- `/relatorios`: Catálogo e aquisição de relatórios temáticos B2B.
- `/anuncie`: Formulário de submissão self-service para anunciantes éticos.
- `/media-kit`: Formatos, cotas e normas de conformidade de anúncios.
- `/api-publico`: Emissão de chaves de acesso à API Pública Tiered.
- `/apoie`: Apoio cívico direto via PIX manual e transparência contábil.
- `/manual`: Manual do Usuário interativo (definição de progressismo, FAQ e auditoria).


