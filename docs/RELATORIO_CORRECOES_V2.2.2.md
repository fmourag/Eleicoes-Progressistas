# Relatório Executivo de Correções Nacionais e Validação — v2.2.2

**Data:** 11 de setembro de 2026  
**Versão:** 2.2.2 (Build Code 3)  
**Status:** Validado, Testado, Semeado e Homologado  
**Ambiente:** Produção / Beta Fechado  

---

## 1. Sumário Executivo das Correções Implementadas

Em resposta aos testes em dispositivo móvel Android, foram implementadas as seguintes soluções a nível nacional cobrindo todas as 27 Unidades Federativas (UFs):

| Item | Defeito / Demanda Reportada | Causa Raiz | Solução Aplicada | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Fotos Oficiais de Parlamentares Incompletas** | Fotos oficiais do TSE podiam falhar ou demorar para carregar dependendo da conectividade ou indisponibilidade da CDN do DivulgaCandContas. | Implementada cascata de fallback nacional com fotos parlamentares em alta definição da **Câmara dos Deputados** (`bandep/{id}.jpg`), **Senado Federal** (`fotos-oficiais/{id}.jpg`) e lideranças executivas mapeadas. | **CORRIGIDO** |
| **2** | **Esticamento Vertical do Card de Prioridades** | O container `navCard` em `apps/mobile/app/index.tsx` utilizava `justifyContent: 'space-between'`, gerando esticamento excessivo e grande espaço em branco em telas maiores. | Substituído por `justifyContent: 'flex-start'` com `gap: 4` responsivo, uniformizando o grid. | **CORRIGIDO** |
| **3** | **Quebra Vertical do Botão "← Início"** | Em telas estreitas, a linha de controles de `candidatos.tsx` comprimia o botão de retorno, quebrando o texto em `In\níc\nio`. | Aplicado `minWidth: 72`, `flexShrink: 0`, `paddingVertical: 6`, `paddingHorizontal: 10` e `flexWrap: 'wrap'` no container superior. | **CORRIGIDO** |
| **4** | **Truncamento de Nomes de Candidatos e Botão da Cola** | Nomes longos eram cortados precocemente e o botão `+ Adicionar à Cola` tinha seu rótulo truncado. | `name` com `flex: 1`, `numberOfLines: 2` e `lineHeight: 20`; `colaBtn` com `flexShrink: 0` e `bottomCardRow` com quebra automática `flexWrap: 'wrap'`. | **CORRIGIDO** |
| **5** | **Truncamento das Etiquetas da Barra Inferior (Tabs)** | Emojis embutidos no rótulo de texto causavam corte das palavras para `Candi...` e `Minh...`. | Ícones separados no componente `tabBarIcon` nativo e rótulos limpos (`Candidatos`, `Prioridades`, `Minha Cola`, `Raio-X`) com tipografia `fontSize: 11`. | **CORRIGIDO** |

---

## 2. Detalhamento Técnico das Modificações

### 2.1 Resolução de Fotos Parlamentares (`packages/shared`, API e Mobile)
- **Cascata Unificada:** `resolveCandidatePhotoUrl({ photoUrl, tseId, cargo, name, id })` exportada no `@np/shared`.
- **Câmara dos Deputados:** Integração direta com `https://www.camara.leg.br/internet/deputado/bandep/{camaraId}.jpg` para todos os deputados federais (ex.: Chico Alencar `74845`, Dimas Gadelha `220553`, Erika Hilton `220569`, Guilherme Boulos `220637`, etc.).
- **Senado Federal:** Integração com `https://www.senado.leg.br/senadores/img/fotos-oficiais/{senadorId}.jpg` para senadores.
- **Backend NestJS:** `candidates.service.ts` processa todos os candidatos via `resolveCandidatePhotoUrl` antes da entrega aos clientes.

### 2.2 Otimizações de UI e Responsividade Mobile (`apps/mobile`)
- **`app/index.tsx`:** Otimização dos cards de navegação rápida e badge `v2.2.2`.
- **`app/(tabs)/candidatos.tsx`:** Botão de navegação fixo sem quebra de texto, suporte responsivo a seletores de UF e campo de busca.
- **`components/CandidateCard.tsx`:** Cabeçalho com distribuição flexível, foto com fallback suave e botão de adição à cola eleitoral sem truncamento.
- **`app/(tabs)/_layout.tsx`:** TabBar do Expo Router ajustada com ícones e textos proporcionais.

---

## 3. Matriz de Compilação e Testes

- **Shared Package Build:** `npm run build -w @np/shared` (OK).
- **Backend API Build:** `npm run build:api` (OK).
- **Expo Web Build:** `npm run build:web -w @np/mobile` (OK - 1.49 MB bundle).
- **Exportação de Snapshot:** `npx tsx scripts/export-archive.ts` (336 candidatos exportados).
- **Sincronização de Documentação:** `npx tsx scripts/sync-docs.ts` (OK).

---

## 4. Hash e Integridade do Pacote Offline

- **`candidates-2026.json` (336 candidatos):** `736a98f720cd48bdfa76805d9f1c54b99328a7943fa6d6d888127e8c46cfcec5`
- **`scores-summary.json`:** `22609fcb6b1fe3cb1e8b7fbaa98ebf8eab65926c57cdf61c84f46c93f7804c36`
- **`cola-template.json`:** `37ab1bfb238889b3080d2e84ca63c05257b6afcd3c35adba3c71217f8a848d1e`

