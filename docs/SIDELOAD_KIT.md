# Kit de Distribuição Sideload — Beta Fechado v2.2.3

**Data:** 15 de setembro de 2026  
**Versão:** 2.2.3 (Build Code 4)  
**Aplicativo:** Eleições Progressistas (`com.eleicoesprogressistas.app`)  

---

## 📦 Dados do Pacote

- **Link Direto do APK:** [Download APK v2.2.3 (61,45 MB)](https://expo.dev/artifacts/eas/AuyFXRY-POmAo6xJK3cxvesMAHJlLPsK_m11pwQjSRc.apk)
- **Landing Page de Instalação:** https://eleicoes-progressistas.onrender.com/beta
- **Verificação de Integridade (SHA-256):** `71a52845fc483f699c975a736ea6eeba954eca9cf3ae49b3886259581a23ea40`
- **Política de Privacidade:** https://eleicoes-progressistas.onrender.com/privacidade

---

## 🛠️ Correções e Melhorias Aplicadas na v2.2.3

### 🏛️ Reconciliação Nacional TSE 2026
- Base de dados sincronizada diretamente com os dados abertos oficiais do TSE 2026
- Chapas e vices vinculados pelas atas e coligações oficiais
- Remoção total de dependências legadas de 2022

### ⚖️ Perfil Neutro e Integridade no Matching de Afinidade
- Candidatos com perfil neutro (`p1-p13 = 0.5`) segregados em seção própria ("Sem histórico público suficiente")
- Match score exibido como `—` com badge amarela, impedindo empates artificiais no topo do ranking

### 📸 Fotos Sob Demanda (Lazy Prefetching)
- Prefetch assíncrono não bloqueante (0ms de impacto na resposta de APIs)
- Fila com rate limit de 1 req/s e deduplicação de requisições in-flight
- Cache local automático para consultas subsequentes

---

## 📱 Instruções de Instalação (Android)

1. No celular Android, acesse: **https://eleicoes-progressistas.onrender.com/beta**
2. Clique no botão **Baixar APK**.
3. Ao término do download, abra o arquivo `eleicoes-progressistas-v2.2.3-beta.apk`.
4. Se solicitado, habilite **"Permitir desta fonte"**.
5. Toque em **Instalar** e abra o app.

⚠️ **Importante:** desinstale versões anteriores antes de instalar a v2.2.3.

---

## 💬 Mensagens Prontas para Envio

### 🟢 WhatsApp / 🔵 Telegram
```text
🇧🇷 [NOME], atualização v2.2.3 disponível!

📦 Correções aplicadas:
✓ Reconciliação oficial TSE 2026 (27 UFs)
✓ Candidatos neutros segregados no matching (sem distorção de topo)
✓ Fotos sob demanda via prefetch assíncrono (0ms no carregamento)
✓ Cache local progressivo de imagens e chapas oficiais
✓ UI mobile refinada com selos de histórico insuficiente

🔗 Nova versão: https://eleicoes-progressistas.onrender.com/beta
🔐 SHA-256: 71a52845fc483f699c975a736ea6eeba954eca9cf3ae49b3886259581a23ea40

⚠️ Desinstale a versão anterior antes de instalar.
Feedback: fmourag@gmail.com
```

### ✉️ E-mail
**Assunto:** `🇧🇷 Atualização v2.2.3: Reconciliação TSE 2026 + Fotos Sob Demanda + Matching Seguro`  

**Corpo:**
```text
Olá [NOME],

Uma nova versão do Beta Fechado está disponível com reconciliação completa da
base de candidatos do TSE 2026, fotos sob demanda e proteção no algoritmo de afinidade.

📱 Link de instalação rápida:
https://eleicoes-progressistas.onrender.com/beta

🔐 Verificação de Integridade (SHA-256):
71a52845fc483f699c975a736ea6eeba954eca9cf3ae49b3886259581a23ea40

🛠️ Correções aplicadas na v2.2.3:
• Reconciliação completa com extrato e dados abertos TSE 2026
• Candidatos neutros não disputam topo do ranking de afinidade
• Sistema de download assíncrono de fotos sob demanda (zero atraso na API)
• Cache local progressivo servindo fotos instantaneamente
• Atualização de chapas majoritárias e vices oficiais

⚠️ Importante: desinstale a versão anterior antes de instalar.

Envie suas impressões para: fmourag@gmail.com

Equipe Eleições Progressistas
https://eleicoes-progressistas.onrender.com/
```

