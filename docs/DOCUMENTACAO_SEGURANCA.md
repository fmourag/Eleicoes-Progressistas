---
title: "Documentação de Segurança"
version: "2.2.0"
last_updated: "2026-09-10"
---

# Documentação de Segurança

> **Resumo:** Diretrizes de segurança, conformidade com a LGPD, fluxo de dados sensíveis, RLS (Row Level Security) e anonimização via Device Hash.

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

### 1. LGPD — Conformidade
| Princípio | Art. | Implementação |
|-----------|------|---------------|
| Finalidade | 6º, I | Dados usados APENAS para matching eleitoral e transparência nas Eleições 2026 |
| Necessidade | 6º, III | Coleta mínima: até 3 prioridades temáticas temporárias em memória local de sessão (zero questionários) |
| Livre acesso | 6º, IV | Usuário exporta/exclui dados a qualquer momento |
| Qualidade | 6º, V | Scores validados no device antes do envio |
| Transparência | 6º, VI | Auditoria direta na fonte oficial: Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`) |
| Segurança | 6º, VII | Hash SHA-256 + SSL/TLS + Servimento Local de Imagens Oficiais |
| Responsabilização | 6º, X | DPO designado |

### 2. Privacidade (Privacy by Design)
#### Fluxo de Dados
```
Mobile                          Backend                         Python
  │                               │                               │
  │  priority_pillars [p2,p7]     │                               │
  │  location {uf, ibge_code}     │                               │
  │──────────────────────────────▶│                               │
  │                               │  voter + candidates           │
  │                               │──────────────────────────────▶│
  │                               │                               │
  │                               │  match_score, match_reason    │
  │                               │◀──────────────────────────────│
  │                               │                               │
  │  results[] + deviceHash       │                               │
  │◀──────────────────────────────│                               │
```

#### O que NUNCA sai do device
| Dado | Status |
|------|--------|
| Respostas/opiniões ideológicas | ❌ Inexistente (zero coleta, sem questionários) |
| Histórico de posicionamento político | ❌ Nunca coletado |
| CPF, email, nome | ❌ Nunca vinculado |
| IP do dispositivo | ❌ Nunca coletado |

#### O que é salvo no backend
| Dado | Chave | Retenção |
|------|-------|----------|
| Prioridades selecionadas | Sessão (memória volátil) | Zero retenção em disco |
| Matching scores | Stateless | Calculado em memória e retornado na requisição |

### 3. Device Hash
```typescript
// Geração do device hash (SHA-256 + salt rotativo)
const salt = process.env.DEVICE_HASH_SALT; // rotacionado a cada 90 dias
const hash = createHash('sha256')
  .update(`${deviceId}:${salt}`)
  .digest('hex')
  .slice(0, 32);
```
- `device_id`: UUID gerado no primeiro acesso (app salva localmente)
- `salt`: rotacionado a cada 90 dias → dados antigos ficam órfãos
- Sem vínculo a CPF, email, IMEI, ou qualquer identificador real

### 4. Autenticação (Supabase Auth)
| Fluxo | Detalhe |
|-------|---------|
| Cadastro | `supabase.auth.signUp()` → JWT Supabase |
| Login | `supabase.auth.signInWithPassword()` → JWT |
| Verificação backend | `supabase.auth.getUser(token)` via service key |
| Matching | Não requer auth (device_hash é suficiente) |

#### JWT Config
```typescript
// Backend verifica tokens Supabase (NÃO gera tokens próprios)
const { data, error } = await supabase.auth.getUser(token);
```

### 5. Segurança de Dados
#### Proteção de Candidatos
| Campo | Técnica |
|-------|---------|
| CPF | SHA-256 + salt (nunca exposto) |
| Dados de votação | Fonte pública (TSE), sem anonimização necessária |
| Financiamento | Fonte pública (TSE), sem anonimização necessária |

#### RLS (Supabase)
```sql
-- Candidatos: leitura pública, escrita admin-only
CREATE POLICY "candidates_public_read" ON candidates FOR SELECT USING (true);
CREATE POLICY "candidates_admin_write" ON candidates FOR INSERT USING (auth.jwt()->>'role' = 'admin');

-- Match results: legado sem escrita ativa (matching stateless em memória /api/matching/rank)
-- CREATE POLICY "matches_device_only" ON match_results FOR ALL USING (true);
```

#### Validação de Input
```typescript
// DTO com class-validator
priority_pillars: string[] (max 3, enum Pillar)
location: { uf: UF (2 chars), ibge_code: 7 digits }
```

### 6. Segurança e Sigilo da Cola Eleitoral
| Aspecto | Tratamento de Segurança |
|---------|-------------------------|
| Armazenamento da Seleção | 100% Client-Side (`localStorage` / `AsyncStorage`). Os candidatos selecionados para a colinha nunca são gravados em banco de dados ou vinculados a uma conta de usuário. |
| Geração de PDF (`/api/cola/pdf`) | Stateless & Transiente. O backend recebe apenas os IDs dos candidatos selecionados para renderizar o PDF via `PDFKit` e envia o stream binário diretamente na resposta HTTP. Nenhum registro persistente da cola do eleitor é mantido em disco ou banco. |
| Sigilo do Voto na Urna | O aplicativo incentiva a impressão da colinha em papel físico, garantindo estrita conformidade com a proibição do TSE de portar aparelhos celulares dentro da cabine de votação (Resolução TSE nº 23.736/2024). |

### 7. Blindagem Anti-Hacker (Defense-in-Depth)

A plataforma adota arquitetura de segurança em múltiplas camadas para proteção irrestrita contra ataques cibernéticos, DoS, enumeração e exploração de vulnerabilidades:

#### 7.1 Rate Limiting Inteligente (`@nestjs/throttler`)
Módulo `@nestjs/throttler` configurado globalmente com armazenamento em memória (`ThrottlerStorageService`) e limites específicos por endpoint:

| Endpoint | Limite | Justificativa de Proteção |
|----------|--------|---------------------------|
| Global (default) | 120 req / 60s | Proteção contra scraping massivo e DoS |
| `POST /api/auth/dev-login` | 10 req / 60s | Prevenção de ataques de força bruta a tokens |
| `GET /api/cola/pdf` | 15 req / 60s | Proteção de CPU contra esgotamento via renderização de PDF (PDFKit) |
| `POST /api/matching/rank` | 60 req / 60s | Proteção do motor de cálculo de compatibilidade |
| `POST /api/ads/apply` | 10 req / 60s | Prevenção de spam de propostas de anunciantes e proteção de recursos (com honeypot anti-bot) |
| `POST /api/ads/click/:id` | 30 req / 60s | Prevenção de fraude de métricas de clique |
| `POST /api/ads/opt-out` | 30 req / 60s | Prevenção de spam de opt-out |
| `POST /api/finance/pix/webhook` | 30 req / 60s | Prevenção de flood e repetição de webhooks |
| `POST /api/public/keys` | 5 req / 1h | Prevenção de abuso na geração de chaves públicas (com honeypot anti-bot) |
| `x-api-key (Tier FREE)` | 1.000 req / dia | Cota diária generosa para pesquisa acadêmica e jornalismo independente |
| `x-api-key (Tier PAID)` | 10.000 req / dia | Cota profissional para redações e institutos de análise |
| `GET /api/public/v1/exports/candidates.csv` | 1 req / 24h | Proteção contra sobrecarga de I/O em dumps massivos em formato CSV |

#### 7.2 Tratamento Global de Erros (`GlobalHttpExceptionFilter`)
- **Sanitização de Stack Traces:** Implementado filtro global `GlobalHttpExceptionFilter` que intercepta todas as exceções HTTP e não tratadas.
- **Formato Padronizado RFC:** Retorna exclusivamente payloads seguros no formato `{ statusCode, timestamp, path, message }`.
- **Prevenção de Information Leakage:** Erros internos de banco de dados (Prisma/SQL), caminhos de arquivos do servidor e detalhes de ambiente nunca são expostos ao cliente externo.

#### 7.3 Cabeçalhos de Segurança HTTP (`helmet`)
- **Strict-Transport-Security (HSTS):** `max-age=31536000; includeSubDomains; preload` forçando tráfego HTTPS criptografado.
- **Content-Security-Policy (CSP):** Diretivas rígidas para scripts, estilos e fontes locais com bloqueio de injeção de scripts externos maliciosos (`XSS`).
- **X-Frame-Options (`SAMEORIGIN`):** Proteção contra ataques de clickjacking.
- **X-Content-Type-Options (`nosniff`):** Bloqueio de MIME type sniffing.
- **Ocultação de Fingerprinting:** Remoção do cabeçalho `X-Powered-By` (`app.disable('x-powered-by')`) para dificultar reconhecimento de tecnologia por bots e scanners maliciosos.

#### 7.4 Limitação de Payload DoS (Express Body-Parser)
- **Teto Rigoroso de 512 KB:** `json({ limit: '512kb' })` e `urlencoded({ limit: '512kb', extended: true })`.
- **Mitigação de Ataques:** Impede esgotamento de memória RAM da aplicação via envio de payloads gigantes ou ataques de ReDoS (Regular Expression Denial of Service).

#### 7.5 Proteção contra Ataques de Temporização (`crypto.timingSafeEqual`)
- **Webhook PIX (`/api/finance/pix/webhook`):** A verificação da assinatura HMAC `x-webhook-signature` utiliza `crypto.timingSafeEqual` com buffers de tamanho fixo (`Buffer.from(signature, 'hex')` e hash computado).
- **Mitigação:** Elimina completamente ataques de temporização (timing side-channel attacks) que tentam adivinhar o segredo de autenticação por meio do tempo de comparação de strings.

#### 7.6 Proteção de Endpoints Operacionais
- **Manutenção de Memória (`/api/system/reset-memory`):** Endpoint reservado exclusivamente para rotinas operacionais, protegido por autenticação via cabeçalho `x-admin-secret` ou query param validado contra a variável `ADMIN_SECRET` de produção. Requisições sem autorização recebem `403 Forbidden` imediato.

#### 7.7 Validação de Entrada Estrita (`ValidationPipe`)
- `whitelist: true` (remove propriedades não declaradas no DTO)
- `forbidNonWhitelisted: true` (rejeita requisições com campos extras maliciosos)
- `transform: true` (coerção segura de tipos com class-transformer)

---

### 8. Checklist de Segurança (Auditoria 2.2.0)
- [x] RLS habilitado em tabelas públicas/privadas
- [x] HTTPS forçado com cabeçalhos HSTS via Helmet
- [x] Content-Security-Policy (CSP) ativo e validado
- [x] Ocultação de fingerprinting (`x-powered-by` desabilitado)
- [x] Rate limiting ativo com `@nestjs/throttler` (Global 120/min + limites dedicados)
- [x] Tratamento de exceções blindado (`GlobalHttpExceptionFilter` sem vazamento de stack)
- [x] Limite de payload HTTP restrito a 512 KB contra DoS de memória
- [x] Proteção contra timing attacks no webhook PIX via `crypto.timingSafeEqual`
- [x] Endpoint operacional `/api/system/reset-memory` protegido por `ADMIN_SECRET`
- [x] Input validation rigoroso com `ValidationPipe` (whitelist + forbidNonWhitelisted)
- [x] Device hash com salt rotativo (90 dias)
- [x] Zero coleta de opiniões ou posicionamentos; matching stateless sem persistência
- [x] Seleções da Cola Eleitoral estritamente locais no dispositivo (Zero-Knowledge Server)
- [x] Geração de PDF via PDFKit transiente em memória com rate limit de 15 req/min
- [x] DPO designado e contato publicado
- [x] Política de privacidade e termos de uso publicados
- [x] ETL: CPF sempre mascarado/hasheado (SHA-256)
- [x] Matching service: autenticação e fallback síncrono local em TypeScript (`USE_LOCAL_MATCHING=true`)
