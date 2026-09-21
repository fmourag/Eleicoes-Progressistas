# Kit de Distribuição Cívica — Versão v2.2.12

**Data:** 21 de setembro de 2026  
**Versão:** 2.2.12 (versionCode 13)  
**Aplicativo:** Eleições Progressistas (`com.eleicoesprogressistas.app`)  

---

## 📦 Dados dos Canais Oficiais

- **1. Versão Web Canônica (Sem instalação):** https://eleicoes-progressistas.onrender.com/web/
- **2. Link Direto do APK Android (Render):** [Download APK v2.2.12](https://eleicoes-progressistas.onrender.com/download/apk)
- **Verificação de Integridade do APK (SHA-256):** `5fd2205e5ce2806a8033ebde3685833af3b7eda218f72b4eaf8ccc3c1b6d585d` ([Checar via API](https://eleicoes-progressistas.onrender.com/download/apk/sha256))
- **Landing Page de Acesso e Download:** https://eleicoes-progressistas.onrender.com/beta
- **Releases no GitHub (Espelho):** https://github.com/fmourag/Eleicoes-Progressistas/releases/tag/v2.2.12
- **Política de Privacidade:** https://eleicoes-progressistas.onrender.com/privacidade
- **Canal de Feedback e Homologação:** https://eleicoes-progressistas.onrender.com/feedback

---

## 🌐 1. Acesso Web (Recomendado para primeiro contato)

Para máxima conversão e menor fricção, qualquer usuário em celular (Android, iOS) ou computador pode utilizar o Eleições Progressistas imediatamente no navegador:

👉 **URL de Acesso:** https://eleicoes-progressistas.onrender.com/web/
- Não exige cadastro nem instalação de aplicativo
- Acesso completo a todos os 7.256 candidatos oficiais do TSE
- Cálculo de matching cívico 100% no navegador (zero dados enviados ao servidor)
- Geração da cola eleitoral em PDF pronta para impressão ou compartilhamento

---

## 📱 2. Instalação Sideload (APK Nativo para Android)

Para testadores, auditores e usuários que preferem o aplicativo instalado nativamente:

1. No celular Android, acesse: **https://eleicoes-progressistas.onrender.com/beta** (ou clique no link direto do APK: `https://eleicoes-progressistas.onrender.com/download/apk`).
2. Ao término do download, abra o arquivo `eleicoes-progressistas-v2.2.12-beta.apk`.
3. Se o Android solicitar, habilite **"Permitir desta fonte"**.
4. Toque em **Instalar** e abra o app.

⚠️ **Integridade do APK:** Confira o hash SHA-256: `5fd2205e5ce2806a8033ebde3685833af3b7eda218f72b4eaf8ccc3c1b6d585d`.  
⚠️ **Importante:** desinstale versões de teste anteriores antes de instalar.

---

## 🛠️ Recursos e Melhorias da v2.2.12

### 🗓️ Histórico de versões recentes
| Versão | versionCode | Data | Destaques |
|--------|-------------|------|-----------|
| **2.2.12** | 13 | 21/09/2026 | Correção exibição de versão dinâmica (expoConfig), badge atualizado automaticamente |
| 2.2.11 | 12 | 20/09/2026 | Cola persistente (expo-file-system), PDF via expo-sharing, crash PDF corrigido, FAB reposicionado |
| 2.2.10 | 11 | 19/09/2026 | Email com PDF anexo, corpo "Cola eleitoral anexa", scroll na cola |
| 2.2.9 | 10 | 18/09/2026 | Apuração em tempo real |
| 2.2.5 | 6 | 17/09/2026 | Lançamento público |

### 🔖 v2.2.12 — Correção de Versão Dinâmica
- `APP_VERSION` agora lido dinamicamente de `Constants.expoConfig?.version` (não mais hardcoded).
- Badge na tela inicial e rodapé sempre exibem a versão correta do build instalado.
- Elimina definitivamente divergência entre versão exibida e versão da Play Store.

### 📋 v2.2.11 — Cola Eleitoral Persistente
- Cola salva permanentemente no dispositivo via `expo-file-system` (nativo) / `localStorage` (web).
- Persiste entre sessões, reinicializações e atualizações de app.
- Apagada somente por comando explícito do usuário ("Apagar Cola") ou sobrescrita por nova geração.
- Compartilhamento por e-mail e WhatsApp envia o PDF da cola como **anexo** com título "Cola eleitoral anexa".
- Crash ao abrir/baixar PDF completamente corrigido (uso de `expo-sharing` + `FileSystem.downloadAsync`).
- FAB de feedback reposicionado (bottom: 145, right: 16) — não interfere mais nos botões de ação.

### 🗳️ v2.2.5 — Módulo de Apuração Eleitoral em Tempo Real
- Rastreamento dos resultados oficiais do TSE em tempo real para os candidatos da cola eleitoral.
- Conexão estrita à API pública oficial do TSE (`resultados.tse.jus.br`).
- Visualização de totalização percentual das urnas e status oficial de eleição de cada candidato.

---

## 💬 Mensagens Prontas para Envio (Acesso Duplo)

### 🟢 WhatsApp / 🔵 Telegram
```text
🇧🇷 [NOME], atualização v2.2.12 do Eleições Progressistas disponível!

🌐 USE AGORA NO NAVEGADOR (sem instalar nada):
https://eleicoes-progressistas.onrender.com/web/

📱 OU BAIXE O APP ANDROID (~61 MB):
https://eleicoes-progressistas.onrender.com/download/apk
🔐 SHA-256: 5fd2205e5ce2806a8033ebde3685833af3b7eda218f72b4eaf8ccc3c1b6d585d

✅ O QUE VOCÊ ENCONTRA:
• 7.256 candidatos oficiais do TSE (todos os cargos e estados)
• Matching honesto com suas prioridades
• Cola eleitoral em PDF salva no dispositivo — leva à urna!
• Compartilhe a cola por WhatsApp/email com o PDF anexo
• Apuração em tempo real no dia da eleição
• Zero coleta de dados — tudo fica no seu dispositivo

💚 Apoio cívico voluntário: R$ 3 via PIX (opcional)
📝 Feedback: https://eleicoes-progressistas.onrender.com/feedback
📧 Suporte: fmourag@gmail.com

Compartilhe com quem vai votar em outubro! 🗳️
```

### ✉️ E-mail
**Assunto:** `🇧🇷 Eleições Progressistas v2.2.12: cola eleitoral persistente e compartilhamento por PDF`  

**Corpo:**
```text
Olá [NOME],

A versão v2.2.12 do Eleições Progressistas está no ar com melhorias importantes na cola eleitoral:

🌐 USE AGORA NO NAVEGADOR (sem instalar nada):
https://eleicoes-progressistas.onrender.com/web/

📱 OU BAIXE O APP ANDROID (~61 MB):
https://eleicoes-progressistas.onrender.com/download/apk
🔐 SHA-256: 5fd2205e5ce2806a8033ebde3685833af3b7eda218f72b4eaf8ccc3c1b6d585d

✅ O QUE VOCÊ ENCONTRA:
• 7.256 candidatos oficiais do TSE (todos os cargos e estados)
• Matching honesto com suas prioridades
• Cola eleitoral em PDF salva permanentemente no dispositivo
• Compartilhe a cola como PDF anexo por WhatsApp ou e-mail
• Apuração em tempo real no dia da eleição
• Zero coleta de dados — tudo fica no seu dispositivo

💚 Apoio cívico voluntário: R$ 3 via PIX celular (21) 97194-3298 (opcional)
📝 Canal de feedback e sugestões: https://eleicoes-progressistas.onrender.com/feedback
📧 Dúvidas ou suporte direto: fmourag@gmail.com

Equipe Eleições Progressistas
https://eleicoes-progressistas.onrender.com/
```
