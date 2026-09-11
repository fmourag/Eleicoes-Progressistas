# Kit de Distribuição Sideload — Beta Fechado v2.2.1

**Data:** 11 de setembro de 2026  
**Versão:** 2.2.1 (Build d0f96698)  
**Aplicativo:** Eleições Progressistas (`com.eleicoesprogressistas.app`)  

---

## 📦 Dados do Pacote

- **Link Direto do APK:** [Download APK v2.2.1 (61,44 MB)](https://expo.dev/artifacts/eas/Cy83mrtlCFpIRNLDR1KxEpPkD7XEcTspGZyLVsk1JH8.apk)
- **AAB Produção (Play Store):** [Download AAB v2.2.1](https://expo.dev/artifacts/eas/dBgRsriBOFVyfzd2xBWT0S2ZAQLLzu3btmu1KQ_c6wg.aab)
- **Landing Page de Instalação:** https://eleicoes-progressistas.onrender.com/beta
- **Verificação de Integridade (SHA-256):** `c99d481b43032aeca3e0c88a22da5504b668ccbe1f7716ac8f98d31b3a79d200`
- **Política de Privacidade:** https://eleicoes-progressistas.onrender.com/privacidade
- **Código Auditável:** https://github.com/fmourag/Eleicoes-Progressistas

---

## 🛠️ Correções Aplicadas na v2.2.1

1. **Carga de Candidatos:** Cache em memória (TTL 5min) + índices compostos no banco de dados (`cargo`, `state`, `party`) — resposta instantânea <10ms.
2. **Resiliência de Rede:** Timeout estendido para 60s com `AbortController` nativo, tolerando eventuais inicializações de servidor.
3. **Retry Automático:** 3 tentativas com backoff exponencial (1.5s → 3s → 6s) para recuperação resiliente.
4. **UX de Erro & Offline:** Estado visual claro com botão "↺ Tentar Novamente" e link direto para o Portal de Dados Abertos do TSE.
5. **Cobertura Nacional Completa:** Governadores e Senadores em todas as 27 UFs + Deputados Federais reais com fotos de campanha oficiais e cache estático de 7 dias.
6. **Geolocalização & Filtro de Alianças:** `expo-location` nativo com seletor manual por UF/Município e distinção explícita de candidaturas coligadas ou apoiadas por partidos progressistas.

---

## 📱 Instruções de Instalação (Android)

1. No celular Android, acesse: **https://eleicoes-progressistas.onrender.com/beta**
2. Clique no botão **Baixar APK**.
3. Ao término do download, abra o arquivo `eleicoes-progressistas-v2.2.1-beta.apk`.
4. Se solicitado, habilite **"Permitir desta fonte"** (ou "Instalar apps desconhecidos").
5. Toque em **Instalar** e abra o app.

⚠️ **Importante:** desinstale versões anteriores do app antes de instalar a v2.2.1 para evitar conflitos de cache local.

---

## 💬 Mensagens Prontas para Envio

### 🟢 WhatsApp / 🔵 Telegram
```text
🇧🇷 [NOME], você foi selecionado(a) para o Beta Fechado do Eleições Progressistas 2026 (v2.2.1)! 📱 Instale em 2 min: https://eleicoes-progressistas.onrender.com/beta 🔐 SHA-256: c99d481b43032aeca3e0c88a22da5504b668ccbe1f7716ac8f98d31b3a79d200 — 5 min de teste que fortalecem o voto consciente e a democracia. Feedback: contato@eleicoesprogressistas.org.br
```

---

### ✉️ E-mail para Beta Testers
**Assunto:** `🇧🇷 Convite: Beta Fechado v2.2.1 — Eleições Progressistas 2026`  
**Corpo:**
```text
Olá [NOME],

Você foi selecionado(a) para testar a versão v2.2.1 do Eleições Progressistas 2026, plataforma cívica independente com dados auditáveis do TSE.

📱 Link direto de instalação:
https://eleicoes-progressistas.onrender.com/beta

🔐 Verificação de Integridade (SHA-256):
c99d481b43032aeca3e0c88a22da5504b668ccbe1f7716ac8f98d31b3a79d200

Destaques da versão v2.2.1:
• 262 candidaturas progressistas nas 27 UFs (Presidente, Governador, Senador, Dep. Federal e Estadual)
• Fotos oficiais de campanha em alta resolução
• Matching cívico 100% anônimo por 13 pilares temáticos
• Raio-X completo com planos de governo e histórico legislativo
• Gerador da Minha Cola Eleitoral em PDF auditável

Caso já possua uma versão anterior instalada, recomendamos desinstalá-la antes de instalar o novo APK.

Envie suas impressões e relatos para: contato@eleicoesprogressistas.org.br

Equipe Eleições Progressistas
https://eleicoes-progressistas.onrender.com/
```
