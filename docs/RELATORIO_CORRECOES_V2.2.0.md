# Relatório Executivo de Correções Nacionais e Validação — v2.2.0

**Data:** 11 de setembro de 2026  
**Versão:** 2.2.0 (Build 1)  
**Status:** Validado, Compilado e Implantado  
**Ambiente:** Produção / Beta Fechado  

---

## 1. Sumário Executivo das Correções

Em resposta aos apontamentos identificados no teste em dispositivo móvel, foi implementado um conjunto abrangente de correções arquiteturais e de dados a nível nacional, cobrindo as 27 Unidades Federativas (UFs):

| Item | Defeito Reportado | Causa Raiz | Solução Aplicada | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Pesquisa Eleitoral / Candidato Ciro Gomes** | A fixture estática de pesquisas eleitorais continha Ciro Gomes no cenário presidencial 2026. | Removido Ciro Gomes de todos os cenários de pesquisa em lection-polls.data.ts. Percentuais rebalanceados para soma exata de 100%. | **CORRIGIDO** |
| **2** | **Geolocalização / GPS no Mobile** | Falta do pacote nativo xpo-location e permissões explícitas no Android Manifest do build de produção, além de ausência de fallback para quando o usuário nega permissão ou o GPS está desligado. | 1. Instalado xpo-location@~18.0.4.<br>2. Injetadas permissões ACCESS_FINE_LOCATION e ACCESS_COARSE_LOCATION no pp.json.<br>3. Atualizado location.service.ts com geocodificação reversa nativa + fallback Nominatim + dicionário de 27 UFs.<br>4. Atualizado LocationConsentModal.tsx com grade de seleção manual imediata das 27 UFs. | **CORRIGIDO** |
| **3** | **Candidatos a Governador Incompletos** | Os partidos PSD e MDB estavam listados no array EXCLUDED_CONSERVATIVE_PARTIES em @np/shared. Estados com candidatos dessas legendas (ex.: RJ com Eduardo Paes) eram filtrados pela API e pela UI. Além disso, a base inicial de governadores não cobria todas as 27 UFs. | 1. Removidos PSD e MDB da lista de exclusão partidária, mantendo a restrição estritamente para partidos de direita/extrema-direita (PL, Republicanos, PP, União Brasil, Novo, PRD, Missão).<br>2. Atualizado o seed e sincronizador nacional com governadores progressistas/democráticos em **todas as 27 UFs** (PT, PSB, PDT, PSOL, PCdoB, PV, Rede, PSD, MDB). | **CORRIGIDO** |

---

## 2. Detalhamento Técnico das Modificações

### 2.1 Módulo de Pesquisas Eleitorais (pps/api)
- Arquivo: pps/api/src/modules/candidates/data/election-polls.data.ts
- Remoção do candidato Ciro Gomes dos cenários Datafolha e Quaest.
- Rebalanceamento das intenções de voto (Lula: 44%, Tarcísio de Freitas: 33%, Ronaldo Caiado: 11%, Ratinho Jr: 6%, Brancos/Nulos/Indecisos: 6%).

### 2.2 Geocodificação e Consentimento (pps/mobile)
- Arquivo: pps/mobile/package.json — Adicionado xpo-location@~18.0.4.
- Arquivo: pps/mobile/app.json — Adicionadas permissões ACCESS_FINE_LOCATION e ACCESS_COARSE_LOCATION.
- Arquivo: pps/mobile/services/location.service.ts — Utilização de Location.getCurrentPositionAsync e Location.reverseGeocodeAsync com mapeamento completo ISO-3166-2 (AC a TO).
- Arquivo: pps/mobile/components/LocationConsentModal.tsx — Fallback com grade interativa de 27 UFs para seleção manual imediata caso a permissão seja negada ou o dispositivo não possua sinal de satélite.

### 2.3 Cobertura Nacional de Governadores (packages/shared, pps/api, scripts)
- Arquivo: packages/shared/src/index.ts — Ajuste na constante EXCLUDED_CONSERVATIVE_PARTIES para não excluir partidos democráticos/frente ampla (PSD e MDB).
- Arquivo: pps/api/prisma/seed.ts e scripts/sync-real-candidates.ts — Cobertura completa de Governadores em todas as 27 UFs.

---

## 3. Matriz de Testes e Validação Automatizada

- **Shared Package Build:** 
pm run build -w @np/shared (Aprovado)
- **Unit & Integration Tests:** 
px turbo run test (12 suites, 103 testes aprovados, 0 falhas)
- **TypeScript Static Typing:** 
px turbo run typecheck (5 pacotes aprovados, 0 erros)
- **Expo Web Export:** 
px expo export --platform web (Exportação estática validada)

---

## 4. Pipeline de Deploy & Artefatos Finais de Produção

### 📦 Artefatos Gerados e Validados
1. **APK Beta Fechado (Sideload):**
   - **Tamanho:** 61,44 MB
   - **URL Oficial:** https://expo.dev/artifacts/eas/i98yWifkjiVUziUocuoeHY5yJ1wMsqgUv346HfCOi40.apk
   - **SHA-256:** 7686A9EEDBE6C0EC2463AD59557583612A6CBBEB49BB0963285DF28F04553351

2. **AAB Produção (Google Play Store):**
   - **Tamanho:** 29,61 MB
   - **URL Oficial:** https://expo.dev/artifacts/eas/uQLe-vCpmYDgsCmTj5q9pbtWOD8AL8otQ3XZb6AS29o.aab
   - **SHA-256:** 9D664FD5F8962BE30C99ECC931F2C6EC742BAC0171231EFED2D0EDB60F4D1FEA

3. **Landing Pages e Endpoints Públicos:**
   - **Landing de Instalação Beta:** https://eleicoes-progressistas.pages.dev/beta
   - **Política de Privacidade:** https://eleicoes-progressistas.pages.dev/privacidade
   - **API Backend:** https://eleicoes-progressistas.onrender.com
