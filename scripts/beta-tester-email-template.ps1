# scripts/beta-tester-email-template.ps1
$template = @"
Assunto: 🇧🇷 Convite: Beta Fechado — Eleições Progressistas 2026

Olá [NOME],

Você foi selecionado(a) para participar do **Beta Fechado** do Eleições Progressistas 2026, uma plataforma cívica gratuita que conecta eleitores a candidatos auditáveis via TSE.

## 📱 Como participar

1. Acesse o link de opt-in:
   https://play.google.com/apps/testing/com.eleicoesprogressistas.app

2. Clique em "Become a tester"

3. Instale o app via Play Store

## 🧪 O que testar

- **Listagem de candidatos**: navegue pela lista de 336 candidatos das 27 UFs
- **Matching por pilares**: selecione 3 pilares prioritários e veja o ranking
- **Raio-X do candidato**: verifique a memória de cálculo 40/30/30
- **Cola Eleitoral**: gere o PDF oficial com números do TSE
- **Doação PIX**: copie a chave e valide o fluxo

## 📝 Como reportar bugs

Use este template e envie para [SEU EMAIL]:

---
**Bug Report — Eleições Progressistas v2.2.0**

**Data:** [DATA]
**Dispositivo:** [MODELO + ANDROID VERSION]
**Descrição:** [O QUE ACONTECEU]
**Steps to Reproduce:** [PASSO A PASSO]
**Severidade:** P0 (crash) / P1 (funcionalidade quebrada) / P2 (cosmético)
---

## ⏰ Prazo

O Beta estará ativo por **7 dias** (até [DATA + 7 DIAS]).

## 🎯 Seu impacto

Seu feedback ajudará a garantir que o app esteja pronto para servir **50.000+ eleitores** antes do 1º turno (04/10/2026).

Obrigado por fazer parte desta iniciativa de transparência eleitoral!

Atenciosamente,
Equipe Eleições Progressistas

---
🔗 Web: https://eleicoes-progressistas.pages.dev
💻 Código: https://github.com/fmourag/Eleicoes-Progressistas
"@

$emailFile = "docs/BETA_TESTER_EMAIL_TEMPLATE.md"
$template | Set-Content $emailFile -Encoding utf8
Write-Host "Template de email criado: $emailFile" -ForegroundColor Green
Write-Host "Edite [NOME], [SEU EMAIL] e [DATA] antes de enviar." -ForegroundColor Cyan
