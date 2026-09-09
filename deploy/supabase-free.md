---
title: "Deploy Banco de Dados — Supabase Free-Tier"
version: "2.2.0"
last_updated: "2026-09-07"
---

# Deploy Banco de Dados — Supabase Free-Tier (Custo R$ 0,00/mês)

Guia de configuração e provisionamento do PostgreSQL gerenciado no plano gratuito do **Supabase** para a plataforma **Eleições Progressistas**.

---

## 1. Limites do Free-Tier do Supabase

| Recurso | Limite no Plano Gratuito | Aplicação no Projeto |
|---|---|---|
| **Armazenamento de Banco** | 500 MB | Suficiente para ~20.000 candidatos e propostas |
| **Usuários Ativos Mensais (MAU)** | 50.000 MAU | Atende a demanda eleitoral com folga (matching é stateless) |
| **Conexões Simultâneas** | 60 direct / 200 pooler (Supavisor) | Usar connection pooler (porta 6543) via `DATABASE_URL` |
| **Egress / Transferência** | 5 GB / mês | Leve, pois dados pesados (fotos) são servidos estáticos |
| **Row Level Security (RLS)** | Ilimitado | Proteção nativa de tabelas públicas e privadas |
| **Custo Mensal** | **R$ 0,00** | Gratuito e sem necessidade de cartão para teste |

---

## 2. Passo a Passo de Configuração

### 2.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login via GitHub.
2. Clique em **New Project** e selecione a região **South America (São Paulo) - `sa-east-1`**.
3. Guarde a senha mestre gerada (`POSTGRES_PASSWORD`).

### 2.2 Obter Connection String (Connection Pooling)
No painel do projeto, vá em **Project Settings** → **Database** → **Connection String** → **URI** (modo Transaction / Pooler):
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### 2.3 Aplicar Migrações do Prisma
Na raiz do projeto ou no diretório `apps/api`:
```bash
# Sincronizar o schema com o Supabase
npx prisma db push --schema=apps/api/prisma/schema.prisma

# Popular os dados das 27 UFs
npm run db:seed
```

### 2.4 Executar Políticas de RLS (`supabase/auth-setup.sql`)
1. No painel do Supabase, acesse o menu **SQL Editor**.
2. Cole e execute o conteúdo do arquivo [`supabase/auth-setup.sql`](../supabase/auth-setup.sql).
3. As políticas garantem leitura pública irrestrita para candidatos e propostas, escrita restrita a administradores e proteção de privacidade para anúncios e doações.

---

## 3. Segurança e Boas Práticas
* **Stateless Matching:** O banco não armazena resultados de matching nem dados de navegação dos eleitores.
* **Supabase Anon Key:** Apenas para chamadas públicas seguras no cliente se necessário.
* **Service Role Key:** Usada estritamente no backend NestJS (`SUPABASE_SERVICE_KEY`), nunca exposta no cliente.
