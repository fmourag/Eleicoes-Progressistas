---
title: "Privacy First (Diretrizes e Transparência)"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Diretrizes de Privacidade e Transparência (Privacy-First & LGPD)

> **Resumo:** Princípios fundamentais de anonimato do usuário, tempo de vida de dados (TTL) e regras para exibição transparente do status de candidaturas.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Prioridades (Stateless), Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Observatório de Mandatos, Anúncios Éticos (Ads), Sustentabilidade PIX (Finance), API Pública Tiered (Public-API), Relatórios B2B (Reports)

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Conteúdo específico

### 🛡️ Princípios de Privacidade
1. **Zero Coleta de Posicionamento Político**: O aplicativo não possui questionários ideológicos, testes de perfil ou formulários de opinião. Não há coleta, inferência ou armazenamento de perfil ideológico do eleitor.
2. **Prioridades Efêmeras em Memória de Sessão**: As preferências de prioridade (até 3 pilares opcionais) existem exclusivamente na memória de execução do cliente (`useState`). Elas são enviadas pontualmente via payload de consulta (`POST /api/matching/rank`) e descartadas imediatamente após o retorno do ranking.
3. **Matching 100% Stateless**: O servidor não grava resultados de matching (`MatchResult`) e não requer identificação ou token para ordenação dos candidatos.
4. **Consentimento Estrito de Localização**: Conforme Art. 7º, I da LGPD (Lei 13.709/2018), a localização do eleitor (UF / Município) só é lida com autorização expressa e revogável.

### 🏛️ Transparência de Candidaturas em Análise (TSE 2026)
- **Registros Preliminares**: O aplicativo exibe pedidos de candidatura registrados no TSE/TREs durante o período de registro de chapas.
- **Ressalva Visual em Destaque**: Candidaturas com status `EM_ANALISE` são identificadas por um aviso amarelado (`⚠️ Candidatura em análise pela Justiça Eleitoral`), informando de maneira clara que os dados são preliminares e estão sujeitos a alteração até o julgamento definitivo do registro.
- **Controle pelo Eleitor**: O usuário possui um controle (*toggle*) na tela de resultados para optar por visualizar **apenas candidaturas deferidas** ou incluir pedidos preliminares em análise.
- **Filtro de Inelegibilidade**: Candidaturas com status `INDEFERIDO` ou `CASSADO` são excluídas das sugestões ativas de matching.

### 📝 Sigilo Absoluto na Cola Eleitoral (Resolução TSE nº 23.736/2024)
1. **Armazenamento 100% no Dispositivo**: As escolhas salvas na "Minha Cola" residem exclusivamente na memória local do navegador ou smartphone (`localStorage` / `AsyncStorage`). O backend jamais grava ou monitora a lista de candidatos escolhidos por qualquer usuário.
2. **Geração de PDF Efêmera (Stateless)**: O endpoint `/api/cola/pdf` processa os IDs em memória para renderizar o documento PDF e fecha o stream HTTP imediatamente. Nenhum dado do eleitor ou histórico de geração é gravado em disco ou base de dados.
3. **Respeito às Normas da Cabine de Votação**: O TSE proíbe o ingresso na cabine de votação com aparelhos eletrônicos ou smartphones. A ferramenta foi concebida propositalmente para permitir que o eleitor gere seu PDF, imprima em papel físico ou envie por e-mail/WhatsApp para impressão prévia, preservando o sigilo do voto e a legalidade no dia do pleito.
