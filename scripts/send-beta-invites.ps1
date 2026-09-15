# scripts/send-beta-invites.ps1
$hash = "71a52845fc483f699c975a736ea6eeba954eca9cf3ae49b3886259581a23ea40"
$downloadUrl = "https://eleicoes-progressistas.onrender.com/beta"
$feedbackUrl = "https://eleicoes-progressistas.onrender.com/feedback"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   MENSAGEM DE DISTRIBUIÇÃO BETA ABERTO / CÍVICO (v2.2.3)" -ForegroundColor Cyan
Write-Host "   Download Único + Protocolo Automático de Feedback" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "WHATSAPP / TELEGRAM (TRANSMISSÃO DIRETA):" -ForegroundColor Green
$msgWhatsApp = @"
🇧🇷 *ELEIÇÕES PROGRESSISTAS v2.2.3 — AUDITORIA CÍVICA ABERTA*

A versão v2.2.3 já está disponível para testes públicos e auditoria!

📲 *Download Oficial (APK):*
$downloadUrl

🔐 *SHA-256 de Integridade:*
`$hash`

📝 *Feedback & Relato de Testes:*
Acesse $feedbackUrl ou toque no botão flutuante 💬 no app.
Ao enviar, você recebe instantaneamente seu *Protocolo de Atendimento*!

Obrigado por fortalecer a transparência eleitoral! 🇧🇷
"@

Write-Host $msgWhatsApp -ForegroundColor Gray

Write-Host "`n----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "ASSUNTO E-MAIL:" -ForegroundColor White
Write-Host "🇧🇷 Auditoria Cívica v2.2.2: Eleições Progressistas Disponível para Testes" -ForegroundColor Cyan
Write-Host "`nCORPO DO E-MAIL:" -ForegroundColor White
$msgEmail = @"
Prezado(a) Cidadão(ã) / Auditor(a),

A versão 2.2.2 do Eleições Progressistas já está disponível para testes abertos de homologação.

1. Baixe o instalador oficial verificado:
   $downloadUrl

2. Verifique o hash SHA-256 do arquivo:
   $hash

3. Envie suas observações em 5 minutos através de:
   - Botão flutuante de feedback 💬 no próprio aplicativo
   - Formulário web direto: $feedbackUrl

Ao enviar seu relatório, um protocolo único (FB-...) é emitido automaticamente para acompanhamento técnico.

Fraternalmente,
Equipe Eleições Progressistas
Contato: fmourag@gmail.com
"@
Write-Host $msgEmail -ForegroundColor Gray

