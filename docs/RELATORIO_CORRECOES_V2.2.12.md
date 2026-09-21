---
title: "Relatório de Correções — v2.2.10 a v2.2.12"
version: "2.2.12"
last_updated: "2026-09-21"
---

# Relatório de Correções — Eleições Progressistas v2.2.10 a v2.2.12

> **Período:** 19 a 21 de setembro de 2026  
> **Escopo:** Cola Eleitoral, Persistência, Compartilhamento PDF, Exibição de Versão

---

## v2.2.12 — 21/09/2026 (versionCode 13)

### 🔖 Correção: Versão Dinâmica a Partir de expoConfig

**Problema:** O badge de versão na tela inicial e o rodapé do app exibiam `v2.2.9` mesmo após atualização da Play Store para `v2.2.11`. O campo `APP_VERSION` em `src/constants/app.ts` era hardcoded.

**Arquivos modificados:**
- `apps/mobile/src/constants/app.ts` — `APP_VERSION` agora lê `Constants.expoConfig?.version` com fallback `'2.2.12'`; `APP_VERSION_CODE` lê `expoConfig.android.versionCode`
- `apps/mobile/app/index.tsx` — rodapé usa `APP_VERSION.replace(/^v/, '')` (não mais "2.2.3" hardcoded)

**Impacto:** Badge sempre sincronizado com a versão real do build instalado. Qualquer build futuro atualiza automaticamente sem edição manual de constante.

---

## v2.2.11 — 20/09/2026 (versionCode 12)

### 📋 Correção: Cola Eleitoral — Persistência Permanente no Dispositivo

**Problema:** A cola eleitoral era armazenada apenas em memória e se perdia ao fechar o app.

**Solução:** Implementação de armazenamento persistente via `expo-file-system` (nativo) e `localStorage` (web), com camada de cache em memória.

**Arquivos modificados:**
- `apps/mobile/src/storage/app-storage.ts` — reescrito com `expo-file-system` (native) / `localStorage` (web) + cache em memória
- `apps/mobile/stores/cola.store.ts` — reescrito com `hydrateCola()` async, `saveColaToStorage()` (grava em arquivo + localStorage), `clearCola()` com remoção física do arquivo

**Comportamento:** Cola gerada permanece no dispositivo entre sessões, reinicializações e atualizações. É apagada somente via botão "Apagar Cola" (confirmação por `Alert.alert`) ou sobrescrita por nova geração.

---

### 📎 Correção: Compartilhamento Cola por E-mail e WhatsApp — PDF Anexo

**Problema:** Compartilhamento enviava o texto completo da cola (ilegível em emails), sem PDF.

**Solução:** Usar `expo-sharing` para anexar o arquivo PDF diretamente ao share intent, com corpo do e-mail "Cola eleitoral anexa".

**Arquivos modificados:**
- `apps/mobile/app/(tabs)/cola.tsx` — `Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Cola eleitoral anexa' })`
- `apps/mobile/components/ColaModal.tsx` — idem para o modal de compartilhamento

**Comportamento:** E-mail e WhatsApp recebem o PDF da cola como **anexo**, com título "Cola eleitoral anexa" e corpo limpo.

---

### 💥 Correção: Crash ao Clicar "Visualizar PDF" / "Baixar PDF" (Play Store)

**Problema:** Na versão distribuída pela Play Store, clicar em "Visualizar PDF" ou "Baixar PDF" fechava o app abruptamente.

**Causa raiz:** Tentativa de abrir o PDF via `Linking.openURL()` em URI de arquivo local — não suportado no Android a partir do API level 24 sem `FileProvider`.

**Solução:** Substituição por `expo-sharing` (`Sharing.shareAsync()`) com `FileSystem.downloadAsync()` para cache local do PDF antes do compartilhamento.

**Arquivos modificados:**
- `apps/mobile/app/(tabs)/cola.tsx` — usa `FileSystem.downloadAsync` + `Sharing.shareAsync` para abrir e baixar
- `apps/mobile/components/ColaModal.tsx` — mesmo padrão
- `apps/mobile/package.json` — `expo-sharing: ~13.0.1` e `expo-file-system: ~18.0.12` declarados

---

### 📜 Correção: Scroll da Cola Eleitoral (Play Store)

**Problema:** A tela da cola gerada não rolava na versão nativa (Play Store), deixando candidatos fora da área visível.

**Solução:** `ScrollView` com `flex: 1`, `nestedScrollEnabled: true`, `paddingBottom: 90` no conteúdo.

**Arquivos modificados:**
- `apps/mobile/components/ColaModal.tsx` — `ScrollView` com propriedades corretas
- `apps/mobile/app/(tabs)/cola.tsx` — ajustes de layout scroll

---

### 🟢 Correção: FAB de Feedback Interferindo com Botão "Gerar Cola"

**Problema:** O balão flutuante de feedback (verde) ficava sobreposto ao botão "Gerar Cola", impedindo a interação.

**Solução:** Reposicionamento do FAB para `bottom: 145, right: 16` (acima da tab bar, fora da área do botão).

**Arquivo modificado:**
- `apps/mobile/app/(tabs)/_layout.tsx` — FAB `bottom: 145`, `right: 16`, tamanho `48x48` com borda branca

---

## v2.2.10 — 19/09/2026 (versionCode 11)

### ✉️ Melhoria: Corpo do E-mail da Cola Eleitoral

**Problema:** O corpo do e-mail gerado pelo aplicativo continha o texto integral da cola (ilegível, sem formatação).

**Solução:** Função `generateEmailShareText()` que produz corpo limpo com link para o PDF online e instruções de uso.

**Arquivos modificados:**
- `apps/mobile/components/ColaModal.tsx` — corpo de e-mail reformulado

---

## Dependências Adicionadas (v2.2.11)

| Pacote | Versão | Motivo |
|--------|--------|--------|
| `expo-file-system` | `~18.0.12` | Armazenamento persistente de arquivos (cola, PDF) |
| `expo-sharing` | `~13.0.1` | Compartilhamento nativo de arquivos (PDF como anexo) |

> Ambos são incluídos no Expo SDK 52 e instalados via `npx expo install`.

---

## Versões e versionCodes

| Versão | versionCode | Tag GitHub | Play Store |
|--------|-------------|-----------|------------|
| 2.2.12 | 13 | `v2.2.12` | Disponível para upload |
| 2.2.11 | 12 | `v2.2.11` | Teste Interno ✅ |
| 2.2.10 | 11 | `v2.2.10` | Substituída |
| 2.2.9  | 10 | `v2.2.9`  | Substituída |
