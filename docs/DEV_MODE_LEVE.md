---
title: "Dev Mode Leve (Setup)"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Dev Mode Leve (Setup em 30 segundos)

> **Resumo:** Instruções para rodar a aplicação localmente de maneira leve (sem Docker, PostgreSQL, Redis ou Supabase) utilizando SQLite e mocks.

> **Modo Lite (iniciar.bat) = 1 processo, para testar; dev:quick = watch, para desenvolver.**

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

O Dev Mode Leve permite que você rode a aplicação localmente sem a necessidade de instalar ou rodar:
- Docker
- PostgreSQL
- Redis
- Supabase
- Serviço de Matching em Python

Toda a stack rodará utilizando **Node.js + SQLite + Expo Go** e em memória onde aplicável.

### 🚀 Como iniciar

**Modo Lite (recomendado para testes E2E):**
```bat
iniciar.bat
```
> Compila web 1x (`apps/mobile/dist`) + API 1x (`apps/api/dist`) e sobe **1 processo Node** em `http://localhost:3000` servindo API + front estático. Builds seguintes iniciam em segundos. Sem Docker, sem WSL/drive virtual, sem Metro bundler, sem watch.

**Reiniciar / Atualizar após alterações:**
```bat
reiniciar.bat
```
> Encerra o processo na porta 3000, reexporta o front web estático e sobe novamente o servidor local unificado.

**Modo Dev Watch (para desenvolver):**
1. Na raiz do projeto, instale as dependências e popule o banco SQLite inicial:
   ```bash
   npm run setup:quick
   ```

2. Inicie a API e o Mobile App:
   ```bash
   npm run dev:quick
   ```

3. Pronto!
   - API disponível em `http://localhost:3000`
   - Abra o Expo Go para testar o Mobile

### 🔑 Login em Dev Mode Leve

O Supabase não estará ativo. Para realizar o login, foi criado um endpoint dedicado que gera tokens JWT válidos localmente:

**Endpoint:** `POST /api/auth/dev-login`
**Rate Limit:** 10 requisições / minuto (proteção contra brute-force de tokens)
**Payload:**
```json
{
  "email": "test@test.com"
}
```

Este endpoint ignora a verificação do Supabase e retorna um JWT assinado com o `JWT_SECRET` local, que é aceito pela API quando iniciada neste modo.

### 🔄 Diferenças arquiteturais do Dev Mode Leve

- **Banco de Dados:** Utiliza o arquivo `apps/api/dev.db` (SQLite) ignorado pelo Git via `apps/api/prisma/schema-sqlite.prisma` (populado com 360 candidaturas reais das 27 UFs).
- **Cache:** Utiliza um mapa em memória (`MemoryCacheAdapter`) ao invés do `RedisCacheAdapter`.
- **Matching:** Roda o algoritmo de cálculo sincronamente em TypeScript (`MatchingLocalService`) ao invés de enviar um batch para o microsserviço Python via HTTP.
- **Autenticação:** Valida as assinaturas JWT com o secret configurado (ou um default não-seguro de dev) localmente em vez do JWKS do Supabase.
- **Fotos e Retratos Oficiais:** 100% dos candidatos contam com imagens oficiais salvas localmente em `apps/mobile/public/candidates/` e compiladas em `apps/mobile/dist/candidates/`, garantindo visualização sem dependência de internet ou CDNs externos.
- **Cola Eleitoral (PDFKit):** A compilação dos PDFs (`cola-eleitoral-2026.pdf`) roda de forma nativa e síncrona no processo Node.js local, consumindo as imagens e dados locais para visualização instantânea, download e impressão.
- **Paridade de Segurança (Anti-Hacker):** A blindagem com `@nestjs/throttler`, `GlobalHttpExceptionFilter`, `helmet` e limitação de payload (512 KB) permanece integralmente ativa no modo leve, garantindo paridade absoluta com produção.

A produção (quando iniciada sem as flags) continua inalterada, mantendo toda a stack robusta (PostgreSQL, Redis, Supabase, Python).
