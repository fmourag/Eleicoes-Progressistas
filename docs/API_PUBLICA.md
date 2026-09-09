---
title: "API Pública Tiered de Dados Eleitorais"
version: "2.2.0"
last_updated: "2026-09-08"
---

# API Pública Tiered de Dados Eleitorais (v2.2.0)

> **Resumo:** Acesso programático oficial e auditável aos dados cívicos consolidados das Eleições Gerais 2026, projetado para pesquisadores acadêmicos, cientistas de dados, desenvolvedores e redações jornalísticas independentes.

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

---

## 1. Princípios de Governança & Arquitetura

1. **Dados 100% Públicos & Sem Dados Pessoais de Eleitores:** A API expõe exclusivamente informações de candidaturas extraídas do TSE (DivulgaCandContas) e do Congresso Nacional. Não há exposição de `cpfHash`, nem histórico de usuários ou respostas de eleitores (aplicação opera sob modelo de *Coleta Zero*).
2. **Uso de Contato do Desenvolvedor:** O campo `contactEmail` fornecido na solicitação de chaves é utilizado **exclusivamente** para gestão técnica da chave, alertas de incidentes e prevenção de abuso. Não há envio de newsletters ou marketing sem consentimento expresso.
3. **Sustentabilidade Sem Intermediários:** O modelo conta com um tier gratuito amplo e um tier pago de R$ 200/mês ativado manualmente via PIX institucional, sem gateway de pagamento com taxas abusivas ou cookies de rastreamento.
4. **Respeito ao Modo de Operação (`APP_MODE`):** Em caso de ativação do modo `archive` histórico pós-eleição, as rotas dinâmicas retornam código `410 Gone` com link direto para o catálogo de dumps estáticos (`/dist-archive/manifest.json`).

---

## 2. Matriz de Tiers & Limites Operacionais

| Recurso / Dimensão | Tier FREE (Gratuito) | Tier PAID (Assinatura Cívica) |
|---|---|---|
| **Investimento** | **R$ 0,00** (Permanente) | **R$ 200,00 / mês** (Contrato PIX) |
| **Limite Diário de Requisições** | 1.000 req / dia | 10.000 req / dia |
| **Onboarding** | Self-Service instantâneo (`/api-publico`) | Ativação manual após PIX (`AdminGuard`) |
| **Catálogo dos 13 Pilares** | ✅ Completo | ✅ Completo |
| **Busca e Detalhes de Candidatos** | ✅ Sanitizado (até 100 por página) | ✅ Sanitizado (até 100 por página) |
| **Propostas Oficiais Traduzidas** | ✅ Completo | ✅ Completo |
| **Estatísticas Agregadas** | ✅ Por UF, Partido e Cargo | ✅ Por UF, Partido e Cargo |
| **Histórico de Votações Parlamentares** | ❌ (Requer upgrade) | ✅ Completo |
| **Ficha Limpa & Integrity Flags** | ❌ (Requer upgrade) | ✅ Completo |
| **Gap Analysis (Oferta vs. Demanda)** | ❌ (Requer upgrade) | ✅ Completo |
| **Dump Completo em CSV** | ❌ (Requer upgrade) | ✅ 1 download a cada 24 horas |

---

## 3. Autenticação & Cabeçalhos HTTP de Rate Limit

Todas as requisições para a API Pública requerem a inclusão da chave de API no cabeçalho `x-api-key`.

```http
GET /api/public/v1/candidates?state=SP&cargo=DEPUTADO_FEDERAL HTTP/1.1
Host: localhost:3000
x-api-key: pk_free_abcdef0123456789...
Accept: application/json
```

### Cabeçalhos de Resposta Injetados em Todas as Respostas
- `X-RateLimit-Limit`: Limite diário da chave vinculada (ex: `1000` ou `10000`).
- `X-RateLimit-Remaining`: Requisições restantes até a virada do dia UTC (ex: `842`).
- `X-RateLimit-Reset`: Timestamp Unix (segundos) em que o contador será resetado (meia-noite UTC).

---

## 4. Catálogo Completo de Endpoints (`/api/public/v1/*`)

### 4.1 Tier FREE & PAID

#### 1. Catálogo de Pilares
- **Rota:** `GET /api/public/v1/pillars`
- **Descrição:** Retorna os 13 pilares temáticos republicanos com títulos, ícones e descrições oficiais.
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE" http://localhost:3000/api/public/v1/pillars
```

#### 2. Busca de Candidatos
- **Rota:** `GET /api/public/v1/candidates`
- **Parâmetros de Query:**
  - `state` (opcional): UF da candidatura (ex: `SP`, `RJ`, `BR`).
  - `cargo` (opcional): `PRESIDENTE`, `SENADOR`, `DEPUTADO_FEDERAL`, etc.
  - `party` (opcional): Sigla do partido (ex: `PT`, `PSOL`, `REDE`).
  - `search` (opcional): Busca textual por nome ou número de urna.
  - `limit` (opcional, padrão 20, máximo 100): Itens por página.
  - `offset` (opcional, padrão 0): Deslocamento de paginação.
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE" \
  "http://localhost:3000/api/public/v1/candidates?state=SP&cargo=DEPUTADO_FEDERAL&limit=10"
```

#### 3. Detalhes de Candidato
- **Rota:** `GET /api/public/v1/candidates/:id`
- **Descrição:** Retorna a ficha pública sanitizada do candidato, incluindo status da candidatura no TSE e pontuações consolidadas nos 13 pilares (`profileScores`).
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE" http://localhost:3000/api/public/v1/candidates/c56a8f10-9b24-4f9e-8c31-7e8c1b9201a4
```

#### 4. Propostas de Campanha e Mandato
- **Rota:** `GET /api/public/v1/candidates/:id/proposals`
- **Descrição:** Retorna as propostas registradas e categorizadas por pilar, com versões em linguagem cidadã acessível.
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE" http://localhost:3000/api/public/v1/candidates/c56a8f10-9b24-4f9e-8c31-7e8c1b9201a4/proposals
```

#### 5. Estatísticas Agregadas Nacionais
- **Rota:** `GET /api/public/v1/stats/aggregate`
- **Descrição:** Métricas macro da base de dados (totais por cargo, estado, partido e média nacional de comprometimento por pilar temático).
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE" http://localhost:3000/api/public/v1/stats/aggregate
```

---

### 4.2 Endpoints Exclusivos do Tier PAID

Se uma chave do tier FREE acessar qualquer um dos endpoints abaixo, a API retornará `403 Forbidden` com payload estruturado:
```json
{
  "statusCode": 403,
  "error": "TIER_UPGRADE_REQUIRED",
  "message": "Este endpoint requer o tier PAID (R$ 200/mês). Solicite ativação comercial via contrato PIX em /api-publico.",
  "upgrade": "/api-publico"
}
```

#### 6. Histórico Completo de Votações
- **Rota:** `GET /api/public/v1/candidates/:id/voting-history`
- **Descrição:** Histórico detalhado de votações nominais e posições legislativas em matérias estruturantes.
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE_PAID" http://localhost:3000/api/public/v1/candidates/ID/voting-history
```

#### 7. Integridade Cívica & Ficha Limpa
- **Rota:** `GET /api/public/v1/candidates/:id/integrity`
- **Descrição:** Certidões de quitação eleitoral, enquadramento na Lei da Ficha Limpa (LC 135/2010) e apontamentos dos tribunais de contas.
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE_PAID" http://localhost:3000/api/public/v1/candidates/ID/integrity
```

#### 8. Gap Analysis (Demanda Popular vs. Oferta Parlamentar)
- **Rota:** `GET /api/public/v1/analytics/pillar-gap`
- **Descrição:** Análise agregada demonstrando o superávit ou déficit de comprometimento legislativo dos candidatos em relação ao benchmark ideal dos 13 pilares republicanos.
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE_PAID" http://localhost:3000/api/public/v1/analytics/pillar-gap
```

#### 9. Dump Completo de Candidatos em CSV
- **Rota:** `GET /api/public/v1/exports/candidates.csv`
- **Descrição:** Exportação massiva em arquivo CSV de todos os candidatos da base com scores p1 a p13.
- **Limite Adicional:** Máximo de 1 download a cada 24 horas por chave.
- **Exemplo curl:**
```bash
curl -H "x-api-key: SUA_CHAVE_PAID" http://localhost:3000/api/public/v1/exports/candidates.csv -o candidatos-2026.csv
```

---

## 5. Emissão de Chaves & Gestão

### 5.1 Solicitação Self-Service (Tier FREE)
- **Rota:** `POST /api/public/keys`
- **Rate Limit:** 5 solicitações por hora por IP (com honeypot anti-bot).
- **Body:**
```json
{
  "contactEmail": "pesquisador@instituto.org.br",
  "purpose": "Pesquisa eleitoral sobre representatividade de gênero nas eleições 2026"
}
```
- **Resposta (201 Created):**
```json
{
  "key": "pk_free_7d82a1b93f...",
  "tier": "FREE",
  "dailyLimit": 1000,
  "message": "Guarde esta chave em local seguro. Ela não será exibida novamente."
}
```

### 5.2 Emissão Manual do Tier PAID (Admin)
- **Fluxo:** O pesquisador ou redação entra em contato em `/api-publico` ou via e-mail institucional (`api@eleicoesprogressistas.org.br`), realiza o PIX da assinatura mensal (R$ 200,00) e o administrador emite a chave via:
```http
POST /api/public/admin/keys
Headers:
  x-admin-key: <ADMIN_SECRET>
Body:
{
  "contactEmail": "redacao@jornalindependente.com.br",
  "tier": "PAID",
  "purpose": "Acompanhamento legislativo diário",
  "dailyLimit": 10000,
  "expiresAt": "2026-10-08T00:00:00.000Z"
}
```

---

## 6. Tratamento de Erros & Códigos HTTP

| Código HTTP | Erro | Significado |
|---|---|---|
| `400 Bad Request` | `Bad Request` | Parâmetros de consulta ou payload JSON inválidos. |
| `401 Unauthorized` | `Unauthorized` | Chave de API ausente no header `x-api-key` ou inválida. |
| `403 Forbidden` | `Forbidden` | Chave de API inativa, revogada ou expirada. |
| `403 Forbidden` | `TIER_UPGRADE_REQUIRED` | Tentativa de acesso a rota PAID utilizando chave FREE. |
| `404 Not Found` | `Not Found` | Candidato ou registro não encontrado. |
| `410 Gone` | `Gone` | Plataforma operando em modo `archive` histórico. Dumps estáticos disponíveis. |
| `429 Too Many Requests` | `Too Many Requests` | Limite diário de requisições da chave esgotado. |
| `500 Internal Server Error` | `Internal Server Error` | Erro não previsto sanitizado sem vazamento de stack traces. |
