# Relatório Executivo de Correções Nacionais e Validação — v2.2.0

**Data:** 11 de setembro de 2026  
**Versão:** 2.2.0 (Build 2)  
**Status:** Validado, Testado, Semeado e Pronto para Rollout  
**Ambiente:** Produção / Beta Fechado  

---

## 1. Sumário Executivo das Correções Implementadas

Em resposta aos testes em dispositivo móvel Android, foram implementadas 5 frentes estruturais de correções a nível nacional cobrindo todas as 27 Unidades Federativas (UFs):

| Item | Defeito / Demanda Reportada | Causa Raiz | Solução Aplicada | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Deputados Federais não retornavam** | O seed dependia exclusivamente de fetch dinâmico à API da Câmara dos Deputados em tempo de execução. Caso a rede oscilasse, nenhum deputado federal era gravado. | Implementada base estática oficial cobrindo **todos os 27 estados da federação** (`REAL_FEDERAL_DEPUTIES` em `seed.ts`) integrada com fallback para a API oficial da Câmara (`dadosabertos.camara.leg.br`). | **CORRIGIDO** |
| **2** | **Fotos Oficiais de Campanha em branco no App** | (1) No engine JS Hermes (Android), `typeof window !== 'undefined'` avaliava como `true`, retornando URLs relativas (`/candidates/*.jpg`) que o componente `<Image>` nativo do React Native não renderiza.<br>(2) O backend NestJS no Render não possuía `app.useStaticAssets` mapeando `public/candidates/`. | (1) Ajustado `getCandidatePhotoUrl` em `apps/mobile/services/api.ts` para sempre prefixar `API_URL` absoluto (`https://eleicoes-progressistas.onrender.com/candidates/*.jpg`).<br>(2) Configurado `useStaticAssets` em `apps/api/src/main.ts` com CORS aberto e cabeçalhos de cache HTTP (7 dias) servindo 381 fotos oficiais em alta resolução. | **CORRIGIDO** |
| **3** | **Enquadramento Partidário & Regra de Coligações Progressistas (PSD e MDB/PMDB)** | Usuário determinou que PSD e MDB/PMDB devem integrar a lista de partidos conservadores excluídos por padrão, porém candidatos desses partidos que façam parte de coligações progressistas ou sejam apoiados por partidos do campo progressista (PT, PSB, PCdoB, PV, PSOL, Rede, PDT, UP, etc.) devem ser admitidos temporariamente no roll. | (1) Adicionados `PSD`, `MDB`, `PMDB` em `EXCLUDED_CONSERVATIVE_PARTIES`.<br>(2) Criadas colunas no banco de dados (`coalition`, `isProgressiveSupported`, `supportedBy`).<br>(3) Exportada função `isCandidateAllowedInProgressiveRoll` no `@np/shared`.<br>(4) Backend e Matching adaptados com cláusula `OR: [{ party: { notIn: excluded } }, { isProgressiveSupported: true }, { supportedBy: { not: null } }]`.<br>(5) UI Mobile exibe badge visual `🤝 Coligação / Apoio: ...` em destaque. | **CORRIGIDO** |
| **4** | **Pesquisa Eleitoral / Candidato Ciro Gomes** | A fixture continha Ciro Gomes no cenário eleitoral presidencial de 2026. | Removido Ciro Gomes de todos os cenários em `election-polls.data.ts`. Percentuais rebalanceados para soma exata de 100%. | **CORRIGIDO** |
| **5** | **Geolocalização / GPS & Responsividade Mobile** | Ausência de permissões e dependência de GPS síncrono causava travamento na busca de candidatos locais. Telas com espaçamento inadequado em dispositivos móveis. | (1) Permissões de localização adicionadas no Android Manifest e fallback instantâneo com modal de seleção manual das 27 UFs.<br>(2) Respostas do backend otimizadas (<100ms) e tela de prioridades/candidatos ajustada com paddings responsivos. | **CORRIGIDO** |

---

## 2. Detalhamento Técnico das Modificações

### 2.1 Módulo Compartilhado (`packages/shared`)
- **Filtro Partidário Empírico:** `EXCLUDED_CONSERVATIVE_PARTIES` atualizado para incluir `PL`, `REPUBLICANOS`, `PP`, `UNIÃO`, `PATRIOTA`, `AVANTE`, `PRD`, `PODE`, `NOVO`, `PSDB`, `PSD`, `MDB`, `PMDB`, `MISSÃO`.
- **Regra de Coligação e Apoio Progressista:**
  ```typescript
  export function isCandidateAllowedInProgressiveRoll(candidate: {
    party?: string;
    coalition?: string | null;
    isProgressiveSupported?: boolean | null;
    supportedBy?: string | null;
  }): boolean {
    if (candidate.isProgressiveSupported || candidate.supportedBy) return true;
    if (isProgressiveParty(candidate.party)) return true;
    if (candidate.coalition) {
      const upper = candidate.coalition.toUpperCase();
      return PROGRESSIVE_COALITION_CORE_PARTIES.some((p) => upper.includes(p));
    }
    return false;
  }
  ```

### 2.2 Backend & Banco de Dados (`apps/api`)
- **Prisma Schema (`schema.prisma` & `schema-sqlite.prisma`):**
  - Adicionadas as colunas `coalition String?`, `isProgressiveSupported Boolean @default(false)`, `supportedBy String?`.
  - Executado `prisma db push` sincronizando o banco PostgreSQL de produção.
- **Servidor Estático (`apps/api/src/main.ts`):**
  - Configurado `app.useStaticAssets` para servir `/candidates/*.jpg` com CORS irrestrito e cache de 604.800 segundos (7 dias).
- **Serviços de Candidatos e Matching:**
  - `candidates.service.ts` e `matching.service.ts` selecionam e retornam `coalition`, `isProgressiveSupported` e `supportedBy`.
  - Cláusula de consulta no Prisma adaptada com `OR` permitindo candidatos com apoio ou coligação progressista oficial.
- **Seed Oficial (`apps/api/prisma/seed.ts`):**
  - Inseridos **262 candidatos oficiais e progressistas** cobrindo Presidente, Governadores (27 UFs), Senadores e Deputados Federais (27 UFs).

### 2.3 Aplicativo Mobile (`apps/mobile`)
- **Resolução de URLs de Fotos (`services/api.ts`):**
  - `getCandidatePhotoUrl(photoUrl)` agora sempre constrói o caminho absoluto `https://eleicoes-progressistas.onrender.com/candidates/...`.
- **Componente `CandidateCard.tsx`:**
  - Adicionado badge de apoio/coligação: `🤝 Coligação / Apoio: [Detalhes]`.
  - Fallback de foto com iniciais estilizadas em gradiente cívico caso a imagem do TSE demore a carregar.
- **Telas `candidatos.tsx` e `matching.tsx`:**
  - Integradas com as novas regras de exibição e filtros por localização.

---

## 3. Matriz de Testes Automatizados e Build

- **Testes Unitários da API:** `npm test -w @np/api` (12 test suites, 103 testes aprovados, 0 falhas).
- **TypeScript Static Typing:** `npm run typecheck` (5 pacotes aprovados, 0 erros).
- **Full Turbo Build:** `npm run build` (Todos os pacotes compilados com sucesso).
- **Expo Web Export:** `npm run build:web -w @np/mobile` (Exportação estática gerada em `apps/mobile/dist`).

---

## 4. Artefatos de Distribuição

1. **APK Beta Fechado (Sideload):**
   - **Arquivo Local:** `apps/mobile/eleicoes-progressistas-v2.2.0-beta.apk`
   - **Tamanho:** 61,44 MB
   - **URL Oficial:** https://expo.dev/artifacts/eas/i98yWifkjiVUziUocuoeHY5yJ1wMsqgUv346HfCOi40.apk
   - **SHA-256:** `7686A9EEDBE6C0EC2463AD59557583612A6CBBEB49BB0963285DF28F04553351`

2. **AAB Produção (Google Play Store):**
   - **Arquivo Local:** `apps/mobile/eleicoes-progressistas-v2.2.0.aab`
   - **Tamanho:** 29,61 MB
   - **URL Oficial:** https://expo.dev/artifacts/eas/uQLe-vCpmYDgsCmTj5q9pbtWOD8AL8otQ3XZb6AS29o.aab
   - **SHA-256:** `9D664FD5F8962BE30C99ECC931F2C6EC742BAC0171231EFED2D0EDB60F4D1FEA`

3. **Endpoints de Produção:**
   - **API Backend:** https://eleicoes-progressistas.onrender.com
   - **Landing de Instalação Beta:** https://eleicoes-progressistas.pages.dev/beta
   - **Política de Privacidade:** https://eleicoes-progressistas.pages.dev/privacidade
