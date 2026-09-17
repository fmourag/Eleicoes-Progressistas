# Kit de Distribuição Sideload — Beta Fechado v2.2.4

**Data:** 17 de setembro de 2026  
**Versão:** 2.2.4 (Build Code 5)  
**Aplicativo:** Eleições Progressistas (`com.eleicoesprogressistas.app`)  

---

## 📦 Dados do Pacote

- **Link Direto do APK:** [Download APK v2.2.4](https://github.com/fmourag/Eleicoes-Progressistas/releases/download/v2.2.4/eleicoes-progressistas-v2.2.4-beta.apk)
- **Landing Page de Instalação:** https://eleicoes-progressistas.onrender.com/beta
- **Releases no GitHub:** https://github.com/fmourag/Eleicoes-Progressistas/releases/tag/v2.2.4
- **Verificação de Integridade (SHA-256):** `05da0c763f4404929a61777c0be90fae795c17565565ac9fcd94228f713272bc`
- **Política de Privacidade:** https://eleicoes-progressistas.onrender.com/privacidade

---

## 🛠️ Correções e Melhorias Aplicadas na v2.2.4

### 💚 Apoio Cívico via PIX Celular
- Chave de apoio cívico centralizada para o celular `(21) 97194-3298`
- Padrão oficial BACEN / EMVCo E.164 (`+5521971943298`) para geração de QR Code e chave Pix Copia e Cola
- E-mail `fmourag@gmail.com` mantido exclusivamente para suporte e transparência

### 📣 Destaque Cívico na Inicialização
- Selo de destaque com o lema *"Buscando Propostas e não Fofocas"* adicionado às telas de carregamento do app

### 🔤 Ordenação Alfabética dos Candidatos
- Candidatos agrupados por cargo agora são ordenados estritamente em ordem alfabética pelo nome de campanha/urna (`socialName || name`)

### 🗂️ Identificação Visual e Sticky Header nos Cards de Cargo
- Cards de cargos enriquecidos com faixa temática de destaque e elevação visual
- Cabeçalhos de cargos fixos (*sticky*) para rápida localização do cargo durante a rolagem contínua da lista

### 🛡️ Auditoria e Blindagem de Segurança
- Comparações seguras contra timing attacks (`timingSafeEqual`)
- Sanitização contra CSV Injection em exportações
- Rate limiting reforçado e validação estrita de esquemas de URL (HTTP/HTTPS)
- Validação e limites de paginação contra estouro de memória

---

## 📱 Instruções de Instalação (Android)

1. No celular Android, acesse: **https://eleicoes-progressistas.onrender.com/beta**
2. Clique no botão **Baixar APK**.
3. Ao término do download, abra o arquivo `eleicoes-progressistas-v2.2.4-beta.apk`.
4. Se solicitado, habilite **"Permitir desta fonte"**.
5. Toque em **Instalar** e abra o app.

⚠️ **Importante:** desinstale versões anteriores antes de instalar a v2.2.4.

---

## 💬 Mensagens Prontas para Envio

### 🟢 WhatsApp / 🔵 Telegram
```text
🇧🇷 [NOME], atualização v2.2.4 disponível!

📦 Novidades e melhorias aplicadas:
✓ Apoio cívico via chave PIX celular (21) 97194-3298 (E.164 BACEN)
✓ "Buscando Propostas e não Fofocas" nas telas de carregamento
✓ Candidatos organizados por ordem alfabética de nome de urna
✓ Cards de cargos destacados com cabeçalho sticky na rolagem
✓ Blindagem completa de segurança e mitigação de vulnerabilidades

🔗 Baixar nova versão: https://eleicoes-progressistas.onrender.com/beta
📂 GitHub Release: https://github.com/fmourag/Eleicoes-Progressistas/releases/tag/v2.2.4
🔐 SHA-256: 05da0c763f4404929a61777c0be90fae795c17565565ac9fcd94228f713272bc

⚠️ Desinstale a versão anterior antes de instalar.
Feedback: fmourag@gmail.com
```

### ✉️ E-mail
**Assunto:** `🇧🇷 Atualização v2.2.4: PIX Celular + Propostas e não Fofocas + Organização Alfabética + Segurança`  

**Corpo:**
```text
Olá [NOME],

Uma nova versão do Beta Fechado (v2.2.4) está disponível com melhorias visuais e funcionais importantes!

📱 Link de instalação rápida:
https://eleicoes-progressistas.onrender.com/beta

📂 Releases GitHub:
https://github.com/fmourag/Eleicoes-Progressistas/releases/tag/v2.2.4

🔐 Verificação de Integridade (SHA-256):
05da0c763f4404929a61777c0be90fae795c17565565ac9fcd94228f713272bc

🛠️ Novidades da v2.2.4:
• Apoio cívico via chave PIX celular (21) 97194-3298 (formato BACEN E.164)
• "Buscando Propostas e não Fofocas" em destaque na tela de carregamento
• Ordenação alfabética por nome de urna dentro de cada cargo
• Destaque visual e cabeçalho fixo (sticky) nos cards de cargo
• Auditoria e blindagem completa de segurança

⚠️ Importante: desinstale a versão anterior antes de instalar.

Envie suas impressões para: fmourag@gmail.com

Equipe Eleições Progressistas
https://eleicoes-progressistas.onrender.com/
```

