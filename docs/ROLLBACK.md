---
title: "Plano de Rollback e Contingência Operacional"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Plano de Rollback e Resposta a Incidentes (Free-Tier)

Procedimentos rápidos de reversão para os 4 cenários críticos de falha em produção sem impacto à disponibilidade do serviço para o eleitor.

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

---

## 1. Matriz de Cenários de Rollback

| Componente | Mecanismo de Reversão | RTO (Tempo Estimado) | Procedimento |
|---|---|---|---|
| **API Backend (Render)** | Revert Deploy nativo | < 2 minutos | Painel Render → Deploys → Selecionar commit anterior estável → **Rollback** |
| **Frontend Web (Cloudflare Pages)** | Instant Rollback | < 30 segundos | Painel Cloudflare Pages → Deployments → Selecionar deploy anterior → **Rollback to this deployment** |
| **Banco de Dados (Supabase / Postgres)** | PITR (Point-In-Time) / Snapshot | < 10 minutos | Painel Supabase → Database → Backups → Restaurar ponto no tempo ou executar script de rollback do schema |
| **Modo de Emergência (Governança)** | Mudança para `APP_MODE=archive` | Instantâneo | Enviar `POST /api/ops/mode` com payload `{ "mode": "archive" }` ou alterar variável de ambiente no Render |

---

## 2. Gatilhos Automáticos de Rollback (Incident Thresholds)

O rollback automático ou manual emergencial deve ser acionado caso qualquer uma das seguintes métricas seja violada:

1. **Taxa de Erro HTTP 5xx > 5%** persistente por mais de 15 minutos (monitorado via Sentry / Cloudflare Analytics).
2. **Tempo de Resposta P95 > 5.000ms** nas rotas centrais (`/api/candidates`, `/api/matching/rank`).
3. **Falha na Geração de PDF da Cola Eleitoral** com erro persistente na renderização.
4. **Vazamento Inadvertido de Dados de Sessão** ou comportamento fora dos padrões da LGPD.

---

## 3. Passo a Passo por Cenário

### 3.1 Rollback do Backend (API Render.com)
1. Acesse o dashboard do serviço `eleicoes-progressistas-api` no Render.com.
2. Acesse a aba **Events** ou **Deploys**.
3. Localize o último deploy com status *Live* que operava de forma estável.
4. Clique nos três pontos laterais (`...`) e selecione **Rollback to this deploy**.
5. Valide a recuperação acessando `https://<api-domain>/api/health`.

### 3.2 Rollback do Frontend (Cloudflare Pages)
1. Acesse o **Cloudflare Dashboard** → **Workers & Pages** → `eleicoes-progressistas`.
2. Acesse a aba **Deployments**.
3. Clique no deployment imediatamente anterior que passou nos testes.
4. Clique em **Manage Deployment** → **Rollback to this deployment**. O tráfego global na CDN é redirecionado em milissegundos.

### 3.3 Rollback Emergencial de Governança (`APP_MODE=archive`)
Se o banco de dados cair ou a API sofrer sobrecarga incontrolável durante o dia da eleição:
```bash
# Alternar a API para servir o acervo estático de emergência
curl -X POST https://<api-domain>/api/ops/mode \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_SECRET" \
  -d '{"mode": "archive"}'
```
O sistema retornará `410 Gone` para computação pesada e o cliente apresentará o banner de arquivo histórico com consulta aos arquivos estáticos pré-computados, mantendo 100% de transparência.

### 3.4 Reversão via Git / CLI
```bash
# Reverter para a última tag estável de release
git checkout main
git revert HEAD --no-edit
git push origin main
```
