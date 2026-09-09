# Eleições Progressistas

> **"Cheque o passado. Escolha o futuro."**  
> *Tecnologia Cívica Auditável • 100% Independente • Eleições Gerais 2026*

Plataforma de transparência cívica e alinhamento eleitoral que conecta eleitores a candidaturas das Eleições Gerais 2026 alinhadas a 13 pilares progressistas estruturantes, com dados auditáveis e abertos do TSE, Câmara dos Deputados e Senado Federal. Modelo **Consulta por Prioridades**: zero coleta de dados de opinião, matching stateless em memória e total conformidade com a LGPD.

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React Native (Expo v52) / TypeScript / Web Estático (Stitch UI) |
| Backend | NestJS / TypeScript / Express |
| DB | SQLite (desenvolvimento leve) / PostgreSQL (Prisma / Docker local ou Supabase) |
| Auth | Supabase Auth (JWT + RLS) ou Dev-Login local |
| Matching | Python (FastAPI + NumPy) com Fallback Local Stateless TypeScript |
| Batch LLM | Gemini API + Cron Job Noturno |
| Identidade | Banner Cívico Vetorial (Emblema com Urna, Estrela Dourada e Checkmark Ficha Limpa) |
| Segurança | Helmet (CSP + HSTS), @nestjs/throttler (Anti-DDoS), GlobalHttpExceptionFilter, timingSafeEqual |
| Dados Oficiais | Portal de Dados Abertos do TSE, DivulgaCandContas, APIs da Câmara e Senado |
| CI/CD | GitHub Actions |

## Quick Start

### Modo Lite (recomendado — sem Docker, 1 comando)

```bash
# Windows: duplo-clique em iniciar.bat
# ou via terminal:
npm run setup:quick   # 1ª vez: cria apps/api/dev.db (SQLite) + seed completo
npm run start:lite    # http://localhost:3000 (API + Web estático Expo)
```

### Modo Completo (Docker + 3 serviços)

```bash
npm install
docker compose up -d          # PostgreSQL + Redis
npm run db:generate && npm run db:push && npm run db:seed
npm run dev:api               # :3000
npm run dev:mobile            # :8081 (Expo web)
# Matching Python: docker compose up -d matching  # :8002
```

## Estrutura

```
├── apps/
│   ├── api/              # NestJS Backend + Prisma + Proposals LLM Batch + API TSE
│   └── mobile/           # Expo React Native App (iOS, Android & Web - Stitch UI)
├── packages/
│   └── shared/           # Tipos, constantes, 13 pilares e justificativas auditáveis
├── services/
│   └── matching/         # Python FastAPI Microservice (stateless)
├── docs/                 # Documentação completa do projeto
└── docker-compose.yml
```

## Funcionalidades Principais

- **Consulta por Prioridades & 13 Pilares**: Seleção de prioridades temáticas pelo eleitor (multiplicador 3.0x) com matching 100% stateless em memória, sem questionários ideológicos e com zero retenção de dados pessoais ou de opinião. Disposição visual harmoniosa dos 13 pilares na interface.
- **Identidade Cívica e Banner Oficial**: Emblema cívico com urna estelar e checkmark Ficha Limpa, badges `ELEIÇÕES 2026` e `FICHA LIMPA`, acompanhado do slogan oficial: *"Cheque o passado. Escolha o futuro."*.
- **Tema Claro por Padrão**: Inicialização imediata em modo claro com toggle intuitivo para modo escuro acessível no cabeçalho.
- **Vices Vinculados em Chapas Majoritárias**: Exibição obrigatória do(a) Vice vinculado(a) à candidatura nas disputas para **Governador(a)** e **Presidente da República**.
- **Mecanismo de Busca e Apresentação Nacional (Eleições 2026)**: Cobertura completa de todos os 27 estados da federação. Filtros imediatos por cargo com Presidente da República exibido nacionalmente em todas as UFs sem truncamento.
- **Rolagem Lateral de Cargos com Controles Interativos**: Barra de navegação por cargos com botões deslizantes táteis (`‹` e `›`), rolagem por roda do mouse (*mouse wheel*) no navegador e swipe em dispositivos móveis, garantindo visibilidade total de todas as opções (incluindo Deputado Estadual).
- **Blindagem Integral contra Ataques Hackers**: Rate limiting multicamadas com `@nestjs/throttler`, proteção contra DoS/buffer overflow com limite de 512KB em payloads, cabeçalhos de segurança com Content Security Policy (CSP) e HSTS via `helmet`, ocultação rigorosa de stack traces e detalhes de banco de dados via `GlobalHttpExceptionFilter`, e imunidade contra timing attacks em webhooks PIX com `crypto.timingSafeEqual`.
- **Padronização Visual Oficial (Retratos Individuais)**: Exibição exclusiva da foto oficial de campanha registrada na urna pelo TSE ou retrato institucional oficial do parlamento (Câmara e Senado) do candidato sozinho(a), sem fotos em grupo ou de comícios.
- **Auditoria pelo Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`)**: Links diretos e atalhos de consulta para checagem da veracidade de informações, candidaturas e bens.
- **Raio-X e Justificativa Auditável de Comprometimento**: No card expandido de cada pilar, detalhamento com memória de cálculo explícita: `(Votações: 40%) + (Discursos: 30%) + (Posturas: 30%)` e diagnóstico claro de divergências (análise de gap até os 100%).
- **Alinhamento ao Interesse Nacional**: Voto contrário ou ressalva a pacotes de desoneração fiscal bilionária para multinacionais sem salvaguardas trabalhistas rígidas não prejudica a pontuação progressista, sendo reconhecido como preservação do erário e defesa da classe trabalhadora.
- **Filtro Comportamental Empírico e Iluminista**: Critério rigoroso de filtro partidário baseado em evidências legislativas reais (votações nominais no Congresso Nacional contra salvaguardas científicas, sanitárias e ambientais, ou inserção de dogmas em políticas públicas — excluindo PL, Republicanos, PP, União Brasil, Avante, Patriotas, PRD, MDB, Podemos, PSD, NOVO, PSDB e Missão).
- **Plano Oficial de Governo (TSE)**: Exibição obrigatória das diretrizes registradas no TSE e link direto para o documento oficial.
- **Gerar Cola Eleitoral (PDF, Impressão e Compartilhamento)**: Seleção personalizada de candidatos por cargo na ordem oficial de votação na urna eletrônica (Deputado Federal, Deputado Estadual/Distrital, Senador, Governador e Presidente da República). Geração instantânea de documento oficial em PDF com fotos, números em destaque e o slogan oficial, em conformidade com a Resolução TSE nº 23.736/2024.
- **Observatório de Mandatos & Promessômetro**: Acompanhamento pós-eleição 100% stateless das votações e promessas dos parlamentares eleitos da sua cola, integrando dados abertos da Câmara dos Deputados e do Senado Federal sem qualquer rastreamento do eleitor.
- **Rede de Anúncios Éticos & Sustentabilidade Cívica**: Veiculação de publicidade ética e contextualizada sem cookies ou rastreadores de terceiros, com onboarding self-service, blackout eleitoral automático e livro-caixa aberto de doações e custos cívicos.
- **API Pública Tiered para Pesquisa e Mídia**: Acesso programático estruturado a dados eleitorais e legislativos abertos para jornalistas, acadêmicos e analistas de dados, com autenticação HMAC/SHA-256 e planos Free e Pro.
- **Relatórios Cívicos Analíticos B2B**: Geração de dossiês temáticos com telemetria estritamente agregada (contadores anônimos de engajamento temático) e entrega autenticada por assinatura digital.
- **Privacidade Radical por Design (Zero Cadastro)**: Consulta 100% anônima, sem cadastro obrigatório, sem rastreamento de preferências e em total respeito à LGPD.

## Documentação

- [Master Index & Estrutura](docs/MARKDOWN.md)
- [PRD (Documento de Requisitos)](docs/PRD.md)
- [Documentação Técnica](docs/DOCUMENTACAO_TECNICA.md)
- [Book de Projeto Executivo](docs/BOOK_DE_PROJETO.md)
- [Guia de Produção](docs/PRODUCTION_GUIDE.md)
- [Segurança & Blindagem](docs/DOCUMENTACAO_SEGURANCA.md)
- [API Pública](docs/API_PUBLICA.md)
- [Monetização Ética](docs/MONETIZACAO.md)
- [Kit de Parcerias & Ads](docs/ADS_OUTREACH_KIT.md)
- [Manual do Usuário](docs/MANUAL_DO_USUARIO.md)

## Licença

Projeto privado — todos os direitos reservados.
