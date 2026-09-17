# Guia de Deploy Unificado no Render — Eleições Progressistas v2.2.5

**Data:** 17 de setembro de 2026  
**Versão:** 2.2.5 (Build Code 6)  
**Serviço:** Web Service Unificado (API NestJS + Expo Web SPA + Download de APK Estático)

---

## 1. Visão Geral da Arquitetura

O Eleições Progressistas opera sob uma arquitetura consolidada em um único serviço web no **Render** (`eleicoes-progressistas.onrender.com`), eliminando a necessidade de múltiplos provedores de CDN ou pipelines fragmentados:

- **API REST NestJS:** Endpoints em `/api/*` (`/api/candidates`, `/api/health`, `/api/feedback`, etc.).
- **Frontend SPA (Expo Web):** Servido diretamente em `/web/` e redirecionado na raiz `/`.
- **Download do APK de Sideload:** Servido estaticamente em `/download/apk` e `/download/apk/sha256`.
- **Módulo de Feedback & Beta:** Páginas e APIs em `/feedback`, `/feedback/dashboard`, `/beta` e `/privacidade`.

---

## 2. Configuração do Serviço (`render.yaml`)

O repositório inclui a especificação declarativa de infraestrutura como código (IaC) no arquivo `render.yaml`:

```yaml
services:
  - type: web
    name: eleicoes-progressistas
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build -w @np/api && npm run build:web -w @np/mobile && npm run render:copy-assets
    startCommand: node apps/api/dist/main.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: ADMIN_SECRET
        sync: false
      - key: CRON_SECRET
        sync: false
```

---

## 3. Variáveis de Ambiente Obrigatórias

Configure no painel do Render (**Environment Variables**):

| Variável | Valor Padrão / Exemplo | Descrição |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Modo de execução do Node.js |
| `PORT` | `3000` (ou injetada pelo Render) | Porta HTTP do servidor NestJS |
| `DATABASE_URL` | `file:./prod.db` ou PostgreSQL | Conexão com o banco de dados Prisma |
| `ADMIN_SECRET` | *(string segura)* | Chave de administração para endpoints de operações e exportação de feedback |
| `CRON_SECRET` | *(string segura)* | Chave de autorização para triggers de sync com o TSE |
| `FEEDBACK_FILE_PATH`| *(opcional)* | Caminho customizado para arquivo de persistência de feedbacks |

---

## 4. Passo a Passo para Deploy Inicial / Atualização

### Opção A: Deploy Automático via Git Push (Recomendado)
1. Certifique-se de que o repositório GitHub está conectado ao serviço no Render.
2. Execute o script de deploy automatizado:
   ```powershell
   .\scripts\render-deploy.ps1
   ```
   ou via Git diretamente:
   ```bash
   git push origin main
   ```
3. O Render detectará o push no branch `main` e disparará o pipeline:
   - `npm install`
   - `npm run build -w @np/api`
   - `npm run build:web -w @np/mobile`
   - `npm run render:copy-assets`
   - `node apps/api/dist/main.js`

---

## 5. Procedimento de Atualização do APK

Quando um novo APK for compilado via EAS Build:
1. Execute o script de atualização do APK:
   ```powershell
   .\scripts\update-apk.ps1 -ApkPath "C:\caminho\para\novo-app.apk"
   ```
   ou baixe diretamente da release do GitHub:
   ```powershell
   .\scripts\update-apk.ps1 -FromRelease "v2.2.5"
   ```
2. O script:
   - Copia o APK para `apps/api/static/apk/eleicoes-progressistas-v2.2.5.apk`.
   - Calcula o hash SHA-256 e grava em `apps/api/static/apk/sha256.txt`.
   - Valida o tamanho e integridade.
   - Realiza commit e push para o repositório.

---

## 6. Logs, Monitoramento e Healthcheck

### Endpoints de Diagnóstico:
- **API Health:** `https://eleicoes-progressistas.onrender.com/api/health`
- **Download do APK:** `https://eleicoes-progressistas.onrender.com/download/apk`
- **Hash de Integridade:** `https://eleicoes-progressistas.onrender.com/download/apk/sha256`
- **Aplicação Web:** `https://eleicoes-progressistas.onrender.com/web/`
- **Dashboard de Feedback:** `https://eleicoes-progressistas.onrender.com/feedback/dashboard`

### Acompanhamento de Logs:
No painel do Render, selecione o serviço `eleicoes-progressistas` > aba **Logs**.  
Para monitoramento contínuo via CLI/Script:
```powershell
.\scripts\health-monitor.ps1 -IntervalSeconds 60
```
