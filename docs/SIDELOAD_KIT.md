# Kit de Distribuição Sideload — Beta Fechado v2.2.2

**Data:** 11 de setembro de 2026  
**Versão:** 2.2.2 (Build Code 3)  
**Aplicativo:** Eleições Progressistas (`com.eleicoesprogressistas.app`)  

---

## 📦 Dados do Pacote

- **Link Direto do APK:** [Download APK v2.2.2 (61,44 MB)](https://expo.dev/artifacts/eas/zSlf3TyP6zzq1JIrp6kVTG1sLQotTr8HNDYZgi60Lug.apk)
- **Landing Page de Instalação:** https://eleicoes-progressistas.onrender.com/beta
- **Verificação de Integridade (SHA-256):** `9b8f1a71f1d786eefc711c646785c9ed87338c3957a3bf6926db889bd757d6c7`
- **Política de Privacidade:** https://eleicoes-progressistas.onrender.com/privacidade

---

## 🛠️ Correções Aplicadas na v2.2.2

### 📸 Fotos de Parlamentares (Nível Nacional)
- Cascata de resolução: Câmara dos Deputados (`bandep/{id}.jpg`), Senado Federal (`fotos-oficiais/{id}.jpg`) e tabela de lideranças executivas
- Fallback automático quando CDN do TSE retorna 404 ou está indisponível
- Cobertura visual completa para deputados federais e senadores

### 📱 Responsividade e UI Mobile
1. **Tela Inicial:** Correção do esticamento vertical do card de Prioridades (`justifyContent: flex-start` + `gap: 4`)
2. **Botão "← Início":** Largura mínima 72px, impedindo quebra vertical do texto
3. **Card de Candidato:** Nomes com `numberOfLines={2}` + botão "Adicionar à Cola" sem truncamento
4. **Barra de Navegação:** Ícones separados do texto, labels limpos com `fontSize: 11`
5. **Filtros:** `flexWrap: wrap` para adaptação em telas estreitas

### ⚡ Performance (herdado da v2.2.1)
- Cache em memória (TTL 5min) no `CandidatesService`
- Índices compostos `(cargo, state)`, `(party)`, `(state)` no Prisma
- Timeout 60s com `AbortController` + retry com backoff exponencial

---

## 📱 Instruções de Instalação (Android)

1. No celular Android, acesse: **https://eleicoes-progressistas.onrender.com/beta**
2. Clique no botão **Baixar APK**.
3. Ao término do download, abra o arquivo `eleicoes-progressistas-v2.2.2-beta.apk`.
4. Se solicitado, habilite **"Permitir desta fonte"**.
5. Toque em **Instalar** e abra o app.

⚠️ **Importante:** desinstale versões anteriores antes de instalar a v2.2.2.

---

## 💬 Mensagens Prontas para Envio

### 🟢 WhatsApp / 🔵 Telegram
```text
🇧🇷 [NOME], atualização v2.2.2 disponível!

📦 Correções aplicadas:
✓ Fotos oficiais de parlamentares (Câmara + Senado)
✓ UI responsiva (sem textos quebrados)
✓ Nomes completos visíveis nos cards
✓ Botões de navegação sem truncamento
✓ Cache + retry (herdado da v2.2.1)

🔗 Nova versão: https://eleicoes-progressistas.onrender.com/beta
🔐 SHA-256: 9b8f1a71f1d786eefc711c646785c9ed87338c3957a3bf6926db889bd757d6c7

⚠️ Desinstale a versão anterior antes de instalar.
Feedback: contato@eleicoesprogressistas.org.br
```

### ✉️ E-mail
**Assunto:** `🇧🇷 Atualização v2.2.2: Fotos Parlamentares + UI Responsiva`  

**Corpo:**
```text
Olá [NOME],

Uma nova versão do Beta Fechado está disponível com melhorias significativas
de cobertura visual e ergonomia mobile.

📱 Link de instalação rápida:
https://eleicoes-progressistas.onrender.com/beta

🔐 Verificação de Integridade (SHA-256):
9b8f1a71f1d786eefc711c646785c9ed87338c3957a3bf6926db889bd757d6c7

🛠️ Correções aplicadas na v2.2.2:
• Fotos oficiais de parlamentares via Câmara dos Deputados e Senado Federal
• Cascata de fallback quando CDN do TSE está indisponível
• Correção do esticamento vertical na tela inicial
• Botão "← Início" com largura mínima (sem quebra de texto)
• Nomes de candidatos com até 2 linhas (sem truncamento)
• Barra de navegação com labels completos (sem "Candi..." ou "Minh...")

⚠️ Importante: desinstale a versão anterior antes de instalar.

Envie suas impressões para: contato@eleicoesprogressistas.org.br

Equipe Eleições Progressistas
https://eleicoes-progressistas.onrender.com/
```
