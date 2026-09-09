---
title: "Consumo de Tokens"
version: "2.2.0"
last_updated: "2026-09-08"
---

# Consumo de Tokens

> **Resumo:** Diretrizes de uso de IA, mapeamento de chamadas a LLM e estratégias de controle de custo (cache, fallback) na aplicação Eleições Progressistas.

## Visão geral da aplicação
- **Nome:** Eleições Progressistas ("Cheque o passado. Escolha o futuro.")
- **Versão:** 2.2.0
- **Arquitetura:** Mobile (Expo React-Native) ↔ Supabase Auth ↔ NestJS API ↔ FastAPI Matching Service ↔ PostgreSQL / SQLite
- **Principais módulos:** Auth, Priorities Matching, Candidate Management, Geo, ETL, CI/CD, Cola Eleitoral, Watchdog (Observatório de Mandatos), Ads (Anúncios Éticos), Finance (Sustentabilidade PIX), Public-API (Tiered API), Reports (Relatórios B2B)

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável

## Conteúdo específico

### 1. Regras Gerais
| Regra | Descrição |
|-------|-----------|
| Cache-first | Sempre buscar cache antes de chamar LLM |
| Batch processing | Agrupar chamadas em vez de calls individuais |
| Model selection | Usar modelo mais barato para tarefas simples |
| Token budget | Definir limite mensal por feature |

### 2. Mapeamento de Uso de IA
| Feature | Modelo | Token Estimado/mês | Custo/mês |
|---------|--------|-------------------|-----------|
| Tradutor de Propostas | Gemini 1.5 Flash / Haiku | 500K | ~$1 |
| Promessômetro (resumo) | Gemini 1.5 Flash | 200K | ~$0.50 |
| Matching (não usa LLM) | — (FastAPI + NumPy / TS) | 0 | $0 |
| Cola Eleitoral (PDFKit local) | — | 0 | $0 |
| Busca inteligente | Embeddings (opcional) | 100K | ~$0.02 |

**Total estimado: ~$2/mês (10K users)**

### 3. Estratégias de Cache
#### Cache de Traduções
```
Key:    proposal:{candidate_id}:{pilar}:{hash_texto}
TTL:    30 dias
Format: { translated_text, model_version }
```
- Se proposta já traduzida → retorna cache
- Invalidação: quando candidato atualiza proposta (raro)

#### Cache de Promessas
```
Key:    promise:{candidate_id}:{election_year}
TTL:    7 dias
Format: { summary, score, analyzed_at }
```

#### Cache de Matching (Stateless)
```
Key:    match:{device_hash}:{candidate_id}:{pillars_hash}
TTL:    24 horas
Format: { score, computed_at }
```

### 4. Diretrizes de Prompt
#### Tradutor de Propostas
```
System: Você é um tradutor de linguagem política para linguagem simples.
        Retorne APENAS o texto traduzido, sem explicação.
        Limite: 200 tokens output.

User:   Traduza esta proposta política para um leigo:
        "{proposta_original}"
```

#### Promessômetro (Resumo)
```
System: Analise o voto de um político e retorne um JSON:
        { "fidelidade": 0-100, "resumo": "..." }
        Limite: 150 tokens output.

User:   Proposta: "{proposta}"
        Voto real: "{voto}"
```

### 5. Controle de Custo
| Mecanismo | Implementação |
|-----------|---------------|
| Rate limiting | 10 req/min/usuário para features com LLM |
| Token counter | Log de tokens usados por request no backend |
| Budget alerts | Sentry/Cron alerta quando custo > $50/mês |
| Fallback | Se LLM indisponível → mostrar texto original |
| Batch queue | Filas Redis para processar traduções em lote |

### 6. Regras de Prompt para a Equipe
#### Ao usar IA no desenvolvimento:
| Regra | Exemplo |
|-------|---------|
| Contexto mínimo necessário | Enviar apenas trecho relevante, não arquivo inteiro |
| Instrução específica | "Gere migration SQL para adicionar coluna X" |
| Sem boilerplate | "Não gere imports, apenas a função" |
| Validar output | Sempre testar código gerado antes de commitar |
| Versionar prompts | Salvar prompts eficazes em `prompts/` |

#### Template de Prompt (Desenvolvimento):
```
Contexto: {arquivo/trecho relevante}
Tarefa: {ação específica}
Restrições: {linguagem, framework, padrão}
Output: {formato esperado}
```

### 7. Métricas de Controle
```sql
-- Queries de controle de custo
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  cost_usd DECIMAL(10,6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custo mensal por feature
SELECT feature,
       SUM(cost_usd) as total_cost,
       SUM(input_tokens + output_tokens) as total_tokens
FROM token_usage
WHERE created_at >= date_trunc('month', NOW())
GROUP BY feature
ORDER BY total_cost DESC;
```
