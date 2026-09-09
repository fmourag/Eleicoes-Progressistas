---
title: "Deploy Frontend Web — Cloudflare Pages"
version: "2.2.0"
last_updated: "2026-09-07"
---

# Deploy Frontend Web — Cloudflare Pages

Guia de configuração para deploy do cliente web (Expo / React Native Web) no plano Free do Cloudflare Pages com custo zero de infraestrutura.

---

## 1. Configuração do Projeto no Cloudflare Pages

1. Acesse o **Cloudflare Dashboard** → **Compute (Workers & Pages)** → **Create application** → **Pages** → **Connect to Git**.
2. Selecione o repositório do projeto: `Eleicoes-Progressistas`.
3. Configure os parâmetros de build:
   - **Framework Preset**: `None`
   - **Build command**: `npm run build:web -w @np/mobile`
   - **Build output directory**: `apps/mobile/dist`
   - **Root directory**: `/` (raiz do monorepo)
   - **Node.js Version**: `20` (definir em Environment Variables: `NODE_VERSION=20`)

---

## 2. Variáveis de Ambiente (Environment Variables)

Configure no painel do Cloudflare Pages (**Settings** → **Environment variables**):

| Variável | Valor Exemplo / Descrição | Obrigatória |
|---|---|---|
| `NODE_VERSION` | `20` | Sim |
| `EXPO_PUBLIC_API_URL` | `https://api-eleicoes-progressistas.onrender.com` | Sim |
| `EXPO_PUBLIC_PIX_KEY` | `contato@eleicoesprogressistas.org.br` | Não (habilita PIX) |

---

## 3. Limites e Características do Free-Tier

| Recurso | Limite no Plano Gratuito | Impacto no Projeto |
|---|---|---|
| **Bandwidth / Tráfego** | Ilimitada | Sem surpresas ou cobrança com picos de tráfego eleitoral |
| **Builds Mensais** | 500 builds / mês | Suficiente para deploys contínuos em staging e prod |
| **Custom Domains** | Até 100 domínios | Permite usar domínio próprio com SSL automático gratuito |
| **Preview Deployments** | Ilimitados | 1 preview URL por PR |
| **DDoS Protection** | Incluída (Camada 3/4/7) | Proteção essencial para períodos eleitorais |

---

## 4. Deploy Manual via CLI (Wrangler)

```bash
# Instalação do Wrangler
npm install -g wrangler

# Build local do web bundle
npm run build:web -w @np/mobile

# Deploy para Cloudflare Pages
npx wrangler pages deploy apps/mobile/dist --project-name=eleicoes-progressistas
```
