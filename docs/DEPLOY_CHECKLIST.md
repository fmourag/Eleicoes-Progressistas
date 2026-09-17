---
title: "Checklist de Deploy e Lançamento Oficial"
version: "2.2.5"
last_updated: "2026-09-17"
---

# Checklist de Deploy e Pré-Lançamento — Eleições Progressistas v2.2.5

Roteiro operacional obrigatório para validação técnica, jurídica e de infraestrutura antes da liberação do tráfego público de produção.

## Objetivo

Democratizar o acesso à informação política nas Eleições Gerais 2026, conectando eleitores a candidatos de perfil Progressista alinhados aos 13 pilares estruturantes do desenvolvimento nacional, sob o compromisso: **"Cheque o passado. Escolha o futuro."**

A plataforma opera no modelo **Consulta por Prioridades (100% stateless e Coleta Zero)**: o cidadão seleciona até 3 temas de interesse sem informar opiniões políticas, recebendo um ranqueamento de candidatos baseado em dados públicos auditáveis via Portal de Dados Abertos do TSE (`dadosabertos.tse.jus.br`), com memória de cálculo transparente (Votações 40% + Discursos 30% + Posturas 30%), propostas traduzidas em linguagem simples e geração de Cola Eleitoral oficial para impressão em papel.

**Princípios operacionais:**
- **Privacidade Radical**: Zero coleta de opiniões, zero cadastro obrigatório, zero vínculo com CPF/email
- **Transparência Auditável**: Todos os dados provêm de fontes oficiais (TSE, Câmara, Senado) e são verificáveis em tempo real
- **Acessibilidade Universal**: App gratuito, linguagem simples, compatível com dispositivos de entrada e conexão instável
- **Alinhamento ao Interesse Nacional**: Priorização de candidatos comprometidos com soberania, justiça social e desenvolvimento sustentável
- **Conformidade Google Play**: Ausência total de *Review Gating*, uso da *In-App Review API* nativa por marcos neutros e canal universal de suporte

---

## 📋 1. Checklist Pré-Deploy

- [ ] **Saneamento Documental:** Apenas documentos atualizados com a versão `v2.2.5` e data `2026-09-17`.
- [ ] **Nota de Transparência:** Arquivo `docs/NOTA_TRANSPARENCIA_LANCAMENTO.md` e rota `/transparencia` linkada no perfil e rodapé.
- [ ] **Módulo de Apuração Oficial:** Endpoint do TSE (`resultados.tse.jus.br`) testado com parsing resiliente e fallback offline.
- [ ] **Apoio Cívico PIX Celular:** Chave PIX celular `(21) 97194-3298` (E.164 BACEN `+5521971943298`) e persistência 100% local no dispositivo.
- [ ] **Conformidade Play Store (Anti-Gating):** Bateria de testes aprovada (`npm run test:feedback`) garantindo CTA universal e neutro para todos os usuários.
- [ ] **In-App Review API Nativa:** `StoreReviewService` validado com cota de 30 dias e disparo exclusivo por marcos neutros de engajamento.
- [ ] **Injeção de Segredos:** Todas as variáveis de produção configuradas no Render, Cloudflare Pages e GitHub Secrets (`deploy/secrets.md`).
- [ ] **Monitoramento de Erros:** Telemetria técnica anônima configurada e testada no backend e cliente.
- [ ] **Compliance Eleitoral (Blackout):** Regra de suspensão automática de anúncios entre 16/08 e 05/10 testada e operante.
- [ ] **Carga de Dados Eleitorais:** Banco de dados populado com as candidaturas de 2026 das 27 UFs (`npm run db:seed`).
- [ ] **Acervo de Imagens Oficiais:** Fotos oficiais da urna (TSE) e retratos parlamentares presentes em `public/candidates/` e compilados em `dist/candidates/`.
- [ ] **Geração de Cola Eleitoral (PDF):** Endpoint `/api/cola/pdf` testado com saída em meia-folha / folha A4 com caixas de dígitos grandes e dados do TSE.
- [ ] **Blindagem Cibernética:** Rate limiting `@nestjs/throttler` (120 req/min), cabeçalhos Helmet (CSP/HSTS) e limite de corpo de 512 KB ativos.

---

## 🚀 2. Checklist Pós-Deploy (Smoke Tests)

- [ ] **Healthcheck da API:** `GET https://<api-domain>/api/health` retorna `200 OK` em `< 5000ms`.
- [ ] **Governança Operacional:** `GET https://<api-domain>/api/ops/mode` retorna `{ "mode": "full" }`.
- [ ] **Catálogo e Imagens:** `GET https://<api-domain>/api/candidates?state=RJ` retorna lista `200 OK` com fotos oficiais e presidência incluída.
- [ ] **Matching Stateless:** `POST https://<api-domain>/api/matching/rank` com 3 prioridades retorna top 20 ranqueado em `< 500ms`.
- [ ] **Geração de PDF:** `GET https://<api-domain>/api/cola/pdf?ids=...&state=SP` retorna binário `application/pdf` válido.
- [ ] **Página de Transparência:** `GET https://<app-domain>/transparencia` renderiza corretamente a nota de Coleta Zero.
- [ ] **Fluxo E2E Completo:** Usuário abre o app ➔ define localização ➔ seleciona prioridades ➔ visualiza ranking ➔ abre Raio-X ➔ adiciona à colinha ➔ exporta PDF / visualiza QR Code PIX.
