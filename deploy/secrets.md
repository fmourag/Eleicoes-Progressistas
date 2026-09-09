---
title: "Guia de Segredos e Credenciais de Produção"
version: "2.2.0"
last_updated: "2026-09-07"
---

# Guia de Segredos e Credenciais de Produção

Listagem completa das variáveis secretas, formato exigido, impacto e política de rotação para deploy em produção do app **Eleições Progressistas**.

---

## 1. Matriz de Variáveis Secretas Obrigatórias

| Variável | Escopo | Descrição / Formato | Política de Rotação |
|---|---|---|---|
| `DATABASE_URL` | Backend | URL de conexão pooler do Postgres (Supabase / Oracle) | Troca de senha anual ou após incidente |
| `SUPABASE_URL` | Backend / Mobile | URL do projeto Supabase (`https://xxx.supabase.co`) | Estática por projeto |
| `SUPABASE_ANON_KEY` | Mobile / Backend | Chave pública anônima do Supabase | Rotação via painel Supabase se exposta |
| `SUPABASE_SERVICE_KEY` | Backend | Chave mestre com privilégios de service_role | Nunca expor; rotação imediata se comprometida |
| `JWT_SECRET` | Backend | Segredo de 64+ caracteres hex/base64 para assinar JWTs locais | Rotação a cada 90 dias |
| `MATCHING_API_KEY` | Backend / Python | Chave secreta compartilhada entre NestJS e microservice Python | Rotação a cada 90 dias |
| `DEVICE_HASH_SALT` | Backend | Salt criptográfico aleatório (32 bytes) para anonimização | Rotação obrigatória a cada 90 dias (orfana dados antigos) |
| `ADMIN_SECRET` | Backend | Segredo para autorizar `/api/system/reset-memory` e rotinas de manutenção | Rotação semestral; valor com alta entropia |
| `EXPO_PUBLIC_PIX_KEY` | Mobile / Frontend | Chave PIX pública para doações cívicas voluntárias | Troca sob demanda contábil/fiscal |
| `PIX_WEBHOOK_SECRET` | Backend | Segredo HMAC para validar assinaturas do webhook PIX | Rotação semestral |
| `SENTRY_DSN` | Backend / Mobile | DSN de rastreamento de erros e exceções não tratadas | Estática por projeto Sentry |
| `GEMINI_API_KEY` | Backend (Opcional) | Chave de API Google Gemini para tradução LLM batch de propostas | Rotação via Google Cloud Console |

---

## 2. Procedimento de Rotação de Segredos

### 2.1 Rotação do `DEVICE_HASH_SALT` (Ciclo de 90 Dias)
```bash
# Gerar novo salt criptográfico
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 1. Atualizar a variável no painel do Render / Oracle .env
# 2. Reiniciar o serviço de backend
# 3. Dispositivos ativos continuam funcionando; referências antigas de opt-out são invalidadas de forma limpa
```

### 2.2 Rotação do `ADMIN_SECRET` e `PIX_WEBHOOK_SECRET`
```bash
# Gerar novo segredo
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 1. Atualizar no backend (Render / Docker)
# 2. Atualizar no PSP de recebimento de PIX
```

### 2.3 Rotação de `JWT_SECRET`
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 3. Armazenamento Seguro
- **Ambiente Local:** Utilize arquivos `.env` ignorados pelo Git (`.gitignore`).
- **Cloudflare Pages:** Configurar em **Settings** → **Environment Variables** (marcar como Encrypted).
- **Render.com:** Configurar em **Environment** → **Secret Files** ou **Environment Variables**.
- **GitHub Actions:** Configurar em **Settings** → **Secrets and variables** → **Actions**.
