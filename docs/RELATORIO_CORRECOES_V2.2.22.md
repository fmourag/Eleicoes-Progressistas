# Relatório Técnico de Atualizações e Correções — v2.2.22

> **Data de Emissão:** 3 de Outubro de 2026  
> **Versão da Release:** `2.2.22` (Build `v2.2.22`)  
> **Android Version Code:** `23`  
> **Status de Build:** ✅ 100% Validado & Aprovado nos Testes

---

## 1. Sumário Executivo

A versão **v2.2.22** consolida o **pipeline de retratos oficiais TSE-primeiro**: fim das fotos trocadas entre candidatos, eliminação de candidaturas duplicadas, backfill de 111 retratos verificados (Câmara/Senado/Wikipédia exata), merge cirúrgico de 66 fotos oficiais de urna via CSV do TSE e sincronização dos 4 diretórios de assets. Auditoria ponta a ponta na API em produção: **258 → 294 retratos OK em 302 candidatos, 0 fotos de outra pessoa, 0 duplicatas**. Os 8 restantes exibem avatar de iniciais honesto (sem retrato público verificável em nenhuma fonte).

> **Nota de binários:** nenhum AAB/APK novo foi gerado nesta release. O binário publicado na Play Store permanece `v2.2.21` (build 22); as URLs de release do APK em `main.ts`/`static-assets.controller.ts` foram preservadas de propósito. Novo AAB (build 23) pendente de `eas build`.

---

## 2. Detalhamento das Correções Realizadas

### 2.1. Cadeia de resolução TSE-primeiro (fim das fotos erradas)
- **Problema:** o TSE vinha por último na cadeia; `photo-proxy` fuzzy (Wikipedia/Câmara por nome) trazia homônimos; aliases do `KNOWN_PARLIAMENTARY_PHOTOS` apontavam pessoas diferentes para o mesmo arquivo; regra `includes('lula')` forçava foto errada.
- **Solução:** `resolveCandidatePhotoFallbackChain` (`packages/shared/src/index.ts`) e `resolveCandidatePhotoDynamic` (`candidates.service.ts`) reordenados — urna DivulgaCand/Hermes → cópia local `tse_` → mapeamento **exato** → Câmara/Senado exatos → `photoUrl` não-TSE → `photo-proxy` **exato** por último. Removidos 11 aliases errados (ex.: `dep_sp_raul`, `dep_rj_heitor`, `sen_pr_carol`, `dep_rj_rejane`, Ivan/Colombo).

### 2.2. Saneamento do seed e do banco de produção
- **Seed** (`official-candidates.data.ts`): 15 `photoUrl` trocadas viraram `''` (Rejane/Jandira, Marina/Rosa, Yuri/Verônica/Josemar/Dani, Raul, Heitor, Leci/Elika, Ivan ×3, Gabriel ×2, Dartora); removidos os registros duplicados `dep_fed_jandira_feghali`, `dep_fed_alice_portugal`, `dep_141533` (nome + foto errados) e `dep_fed_glauber` (dup do `dep_152605`).
- **Banco (Supabase prod):** `scripts/fix-wrong-photos.ts` zerou 14 fotos trocadas e excluiu 5 duplicatas (relações com `onDelete: Cascade`); foto quebrada do Orlando zerada (nome correto preservado).

### 2.3. Deduplicação em API e app
- `matching.service` e `candidates.service`: dedup por `tseId` numérico ou `nome+cargo+UF` normalizados; `mergeWithOfficialPresidents` no mobile só mescla presidente por `tseId/id` ou `nome+partido` exatos (antes mesclava por partido sozinho).

### 2.4. Backfill verificado + curadoria visual (`scripts/backfill-missing-photos.ts`)
- Download com validação de magic bytes/tamanho; Wikipédia **somente com título exato** (homônimo impossível por construção); modos `--dry-run`, `--download-only` + curadoria, `--apply-db` via `backfill-manifest.json`.
- Causa histórica localizada via git: `48fd13a` zerou os 1474 retratos em disco; 35 arquivos existiam só no diretório da web (404 só no Render). Sincronizados os 4 dirs (`api/public|static`, `mobile/public`, `static`); corrigido override stale de `static/` sobre o `dist` no build.

### 2.5. Merge cirúrgico TSE via CSV (`scripts/merge-tse-photos.ts`)
- Cruza `consulta_cand_2026.zip` (`SQ_CANDIDATO`, `NM_CANDIDATO`, `NM_URNA`, `SG_UF`, `DS_CARGO`) por match estrito e baixa a urna **sem inserir linhas** (o upsert por `(tseId, ano)` jamais unificaria sintéticos com numéricos).
- WAF do TSE documentado: REST DivulgaCand = `403` Akamai; CSV + CDN Hermes funcionam. Flags `--only`, `--limit/--offset`, retry anti-429.

### 2.6. Sincronização de versão 2.2.22 (código 23)
`scripts/sync-all-versions.js` atualizado e executado (packages, `app.json` + `versionCode`, `build.gradle`, `APP_VERSION`, bats). Preservados de propósito: URLs da release v2.2.21 do APK (`main.ts`, `static-assets.controller.ts`, `render-copy-assets.js`), badge `/beta`, AAB/SHA256 e textos de campanha/testers.

---

## 3. Validações Automatizadas

- ✅ `tsc --noEmit` API + build `@np/shared` sem erros
- ✅ Jest API sem falhas (suítes ads/watchdog/reports/feedback)
- ✅ Auditoria HTTP dos 302 `photoUrl` resolvidos: **294 OK / 8 honestos** (Tito, Doriel, Limma, Germana, Socorro, Samanda, Heitor, Raul — sem retrato verificável em nenhuma fonte)
- ✅ Zero duplicatas `nome+cargo` e zero fotos compartilhadas entre pessoas diferentes
- ✅ `GET /api/health` → `ok`, `database: connected`; assets Pages byte-idênticos ao disco

---

## 4. Deploys e Commits

| Canal | Estado |
|---|---|
| Web (Cloudflare Pages) | `https://eleicoes-progressistas.pages.dev` republicada com os retratos verificados |
| API (Render) | Auto-deploy via push na `main` |
| Commits | `81b6182`, `2729b9a`, `3a66239`, `0e116d1`, `dc8cf1f`, `44c1986`, `0cd4729`, `e7fc200`, `ea8b4bb` |

---

## 5. Pendências Declaradas

1. Build AAB v2.2.22 (versionCode 23) via `eas build --profile production` + upload Play Console + GitHub Release `v2.2.22`.
2. Sync TSE completo (7.103 inserções potenciais) somente após implementar merge por nome (evita reduplicar os 307 curados).
3. Retratos dos 8 sem fonte, se surgirem IDs institucionais ou páginas oficiais.
