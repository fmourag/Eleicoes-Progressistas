# scripts/collect-feedback.ps1
$template = @"
# Feedback — Eleições Progressistas v2.2.0 (Beta)

**Data:** $(Get-Date -Format 'yyyy-MM-dd')
**Tester:** [NOME]
**Dispositivo:** [MODELO + ANDROID VERSION]

## 1. Instalação
- [ ] App instalou sem problemas
- [ ] Splash screen apareceu corretamente
- [ ] Permissões solicitadas foram adequadas

## 2. Funcionalidades Testadas
- [ ] Listagem de candidatos (Tab Candidatos)
- [ ] Matching por pilares (3 pilares selecionados)
- [ ] Raio-X do candidato (memória 40/30/30)
- [ ] Cola Eleitoral (geração de PDF)
- [ ] Doação PIX (chave copiada)

## 3. Bugs Encontrados
| # | Descrição | Severidade (P0/P1/P2) | Steps to Reproduce |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |

## 4. Sugestões de Melhoria
- 
- 

## 5. NPS (0-10)
Quão provável você recomendaria este app para um amigo? [  ]

## 6. Comentários Livres


"@

$feedbackFile = "feedback/feedback-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
if (!(Test-Path 'feedback')) { New-Item -ItemType Directory -Path 'feedback' | Out-Null }
$template | Set-Content $feedbackFile -Encoding utf8
Write-Host "Template de feedback criado: $feedbackFile" -ForegroundColor Green
Write-Host "Edite o arquivo e salve. Depois execute: git add feedback/ && git commit -m 'feedback: add beta tester feedback'" -ForegroundColor Cyan
