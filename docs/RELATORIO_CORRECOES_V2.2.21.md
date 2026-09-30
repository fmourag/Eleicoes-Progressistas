# Relatório Técnico de Atualizações e Correções — v2.2.21

> **Data de Emissão:** 29 de Setembro de 2026  
> **Versão da Release:** `2.2.21` (Build `v2.2.21`)  
> **Android Version Code:** `22`  
> **Status de Build:** ✅ 100% Validado & Aprovado nos Testes

---

## 1. Sumário Executivo

A versão **v2.2.21** consolida a correção de renderização tipográfica no módulo de geração de PDF da Cola Eleitoral, a sincronização integral de versão em todo o ecossistema (API, Mobile, Scripts e Inicializadores) e a compilação do pacote binário de produção assinado para a **Google Play Store**.

---

## 2. Detalhamento das Correções Realizadas

### 2.1. Correção de Texto Truncado / Corrompido no Banner da Cola Eleitoral (PDF)
- **Problema Identificado:** O gerador de PDF (`PDFKit`), ao utilizar as fontes padrão integradas (*Helvetica* / *Helvetica-Bold* sob codificação WinAnsi), não suporta caracteres emoji Unicode (ex: `🛡️` / U+1F6E1). Esse caractere resultava na renderização de bytes corrompidos (`Ø=þáp AJUDA CÍVICA • FINANCIAMENTO COLETIVO INDEPENDENTE`) no banner inferior de financiamento cívico.
- **Solução Aplicada:**
  - Remoção de emojis incompatíveis no título do bloco cívico em `apps/api/src/modules/cola/cola.service.ts`:
    ```typescript
    // Antes:
    .text('🛡️ AJUDA CÍVICA • FINANCIAMENTO COLETIVO INDEPENDENTE', civicTextX, civicY + 6);
    
    // Depois:
    .text('AJUDA CÍVICA • FINANCIAMENTO COLETIVO INDEPENDENTE', civicTextX, civicY + 6);
    ```
  - Substituição do caractere `✓` (Ficha Limpa) pelo marcador padronizado `•` para garantir compatibilidade universal em qualquer visualizador de PDF no Android, iOS e navegadores desktop.

### 2.2. Atualização e Sincronização dos Scripts `.bat`
Todos os inicializadores em lote para ambiente Windows foram atualizados para a versão canônica `v2.2.21`:
- `iniciar.bat` (Inicializador do Modo Local Leve)
- `reiniciar.bat` (Reinicializador de processos)
- `publicar-web.bat` (Publicador Cloudflare Pages)
- `carregar-dados-tse.bat` (Carga e sincronização de dados oficiais TSE)
- `parar.bat` (Encerramento de processos e portas)

---

## 3. Artefato de Produção Play Store (AAB)

- **Arquivo Gerado:** `eleicoes-progressistas-v2.2.21.aab`
- **Tamanho:** `29.75 MB`
- **Assinatura:** Chave de upload oficial de produção (`release-upload.keystore`)
- **Validações Automatizadas:**
  - ✅ Declarações de conformidade de dados públicos (*GovDisclaimer* incluído)
  - ✅ URLs institucionais de transparência do TSE integradas
  - ✅ Bundle JavaScript minificado e otimizado (2.15 MB)
  - ✅ 159 testes unitários da API aprovados sem falhas

---

## 4. Localização dos Binários Gerados

| Destino | Caminho do Arquivo |
|---|---|
| **Raiz** | `eleicoes-progressistas-v2.2.21.aab` |
| **Mobile** | `apps/mobile/eleicoes-progressistas-v2.2.21.aab` |
| **Artefatos** | `build_artifacts/eleicoes-progressistas-v2.2.21.aab` |
