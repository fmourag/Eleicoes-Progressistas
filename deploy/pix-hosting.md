---
title: "Hospedagem Fiscal via Parceria com Sociedade Civil / ONG"
version: "2.2.0"
last_updated: "2026-09-07"
---

# Hospedagem Fiscal e Apoio Cívico via Parceria com Sociedade Civil

Instruções e diretrizes jurídicas para operação financeira e recebimento de doações PIX cívicas voluntárias sem necessidade de abertura imediata de pessoa jurídica própria.

---

## 1. O Conceito de Hospedagem Fiscal (Fiscal Sponsorship)

A **Hospedagem Fiscal** é uma prática amplamente adotada por projetos de código aberto, ativismo cívico e bens públicos digitais (ex: Open Collective, Software Freedom Conservancy). 

Nesse modelo:
* Uma **Associação Civil sem fins lucrativos ou OSCIP parceira** (já estabelecida, com CNPJ ativo e conta bancária regular) atua como custodiante fiscal do projeto.
* A entidade parceira disponibiliza a chave PIX institucional e emite os relatórios contábeis necessários.
* 100% dos valores arrecadados são mantidos em centro de custos apartado e destinados exclusivamente ao custeio de infraestrutura do aplicativo (servidores, backups, certificados e domínios).

---

## 2. Requisitos de Compliance e Transparência

1. **Conta e Chave PIX Exclusivas:** Utilizar chave PIX identificada (ex: `eleicoes@ongparceira.org.br`), vinculada diretamente à conta corrente da entidade.
2. **Termo de Cooperação Técnica e Mútua:** Assinatura de instrumento simples entre os mantenedores técnicos do app e a diretoria da ONG, estabelecendo:
   - Finalidade pública estrita (democratização da informação eleitoral).
   - Proibição absoluta de repasse de recursos a candidatos, partidos ou campanhas políticas.
   - Publicação periódica de extratos na página de transparência (`/api/finance/transparency`).
3. **Isenção de Imposto de Renda / ITCMD:** Doações pontuais de pequeno valor (R$ 5 a R$ 30) destinadas a entidades do terceiro setor gozam de imunidade/isenção tributária constitucional nos termos da legislação federal e estadual aplicável.

---

## 3. Configuração Técnica no Aplicativo

Configure as variáveis de ambiente com os dados fornecidos pela entidade hospedeira:

```env
# Frontend (Mobile/Web)
EXPO_PUBLIC_PIX_KEY="eleicoes@ongparceira.org.br"

# Backend (se configurado webhook bancário da entidade)
PIX_WEBHOOK_SECRET="<secret-hmac-fornecido-pelo-psp-da-ong>"
```

---

## 4. Prestação de Contas Aberta
Os dados consolidados de arrecadação e despesas são consumidos automaticamente pelo componente `<PixApoio />` e pela tela de transparência, permitindo auditoria por qualquer cidadão em tempo real.
