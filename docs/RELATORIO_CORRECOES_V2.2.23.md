# Relatório Técnico de Atualizações e Correções — v2.2.23

> **Data de Emissão:** 4 de Outubro de 2026  
> **Versão da Release:** `2.2.23` (Build `v2.2.23`)  
> **Status de Build:** ✅ 100% Validado & Aprovado nos Testes

---

## 1. Sumário Executivo

A versão **v2.2.23** introduz o **Filtro Final Obrigatório do TSE** para garantir fidelidade de 100% às candidaturas registradas para as Eleições Gerais de 2026 nos repositórios oficiais (`dadosabertos.tse.jus.br`). 

Esta versão resolve em definitivo o problema de candidaturas de pleitos anteriores (como Ciro Gomes, cuja chapa era de 2022) ou candidaturas simuladas aparecendo na aplicação e web. Adicionalmente, corrige as políticas de cabeçalhos de cache HTTP do Cloudflare Pages que mantinham o arquivo raiz `index.html` congelado nos navegadores.

---

## 2. Detalhamento das Alterações e Correções

### 2.1. Filtro Final com Base no Roster Oficial do TSE
- **Problema:** O aplicativo continha dados estáticos de teste e sementes prévias que inseriam chapas que não concorrem à Presidência da República em 2026 (por exemplo, Ciro Gomes com a vice Ana Paula Matos).
- **Implementação:**
  1. Criação do script de extração [`scripts/build-tse-roster.js`](../scripts/build-tse-roster.js), que lê o arquivo oficial bruto `consulta_cand_2026_BRASIL.csv` e consolida 20.059 candidaturas ativas no [`apps/api/src/modules/candidates/data/tse-roster.json`](../apps/api/src/modules/candidates/data/tse-roster.json).
  2. Implementação do validador em tempo de execução [`apps/api/src/modules/candidates/tse-roster.ts`](../apps/api/src/modules/candidates/tse-roster.ts).
  3. Integração no `CandidatesService.findByLocation`: nenhuma candidatura é retornada ao cliente se não houver correspondência estrita no registro do TSE por cargo e circunscrição eleitoral.

### 2.2. Consolidação Oficial de Chapas Presidenciais Progressistas 2026
Alinhamento de todos os pacotes (`@np/shared`, `@np/api` e `@np/mobile`) com as chapas homologadas no TSE para 2026:
- **Luiz Inácio Lula da Silva** (PT - 13) | Vice: Geraldo Alckmin
- **Samara Martins** (UP - 80) | Vice: Raquel Brício (SQ: 280002538811)
- **Edmilson Costa** (PCB - 21) | Vice: Cleusa Santos (SQ: 280002551975)
- **Hertz Dias** (PSTU - 16) | Vice: Vanessa Portugal (SQ: 280002541457)
- **Rui Costa Pimenta** (PCO - 29) | Vice: Antônio Carlos (SQ: 280002552487)

Todas as referências a candidaturas não registradas no pleito presidencial de 2026 foram removidas tanto dos mock fallbacks de matching quanto das listas semente do backend e shared.

### 2.3. Resolução do Cache Estático no Cloudflare Pages
- **Problema:** A rota raiz `/` e o `/index.html` estavam herdando o cabeçalho global `Cache-Control: public, max-age=31536000, immutable`, impedindo a atualização do HTML e fazendo com que navegadores continuassem usando bundles JavaScript antigos.
- **Solução:** Configuração detalhada no [`apps/mobile/public/_headers`](../apps/mobile/public/_headers):
  - `/`, `/index.html`, `/sw.js` e `/service-worker.js` agora utilizam `Cache-Control: no-cache, no-store, must-revalidate`.
  - Recursos com hash imutável (`/_expo/*` e `/assets/*`) mantêm cache longo e seguro.

### 2.4. Integridade de Tipagem e Pipeline CI/CD
- Correção de erros sintáticos e campos faltantes (`municipality: 'Brasil'` para candidaturas federais) em `official-candidates.data.ts` e `candidates.service.ts`.
- Validação completa do `npm run typecheck` com 5/5 pacotes em conformidade estrita.
- Exportação limpa do Expo Web (`index-844776689e4037505672430762666b4b.js`) e sincronização dos diretórios `/static` e `/static/web`.

---

## 3. Validações e Conformidade

- ✅ `npm run typecheck`: **5 successful, 0 errors**.
- ✅ Verificação de integridade no bundle web gerado: **0 ocorrências de Ciro Gomes**.
- ✅ Pipeline GitHub Actions automatizado: trigger em `origin/main` (commit `fc9ca7e`).
- ✅ Deploy sincronizado para Cloudflare Pages e API no Render.
