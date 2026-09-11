# scripts/send-beta-invites.ps1
$csvPath = "docs/testers-beta.csv"
$hash = "7E61EE06F782DFF49B517DF6A486AE85B7CE7FDC4A79886C49AF7AFD4E1BB789"

if (!(Test-Path $csvPath)) {
    Write-Host "[ERRO] Arquivo $csvPath não encontrado!" -ForegroundColor Red
    exit 1
}

$testers = Import-Csv -Path $csvPath

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   MENSAGENS PERSONALIZADAS PARA TESTADORES BETA (SIDELOAD)" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

foreach ($t in $testers) {
    $nome = $t.name
    $email = $t.email
    $org = $t.organization
    
    Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "Destinatario: $nome ($email - $org)" -ForegroundColor Green
    Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "WHATSAPP / TELEGRAM:" -ForegroundColor White
    Write-Host "🇧🇷 $nome, você foi selecionado(a) para o Beta Fechado do Eleições Progressistas 2026! 📱 Instale em 2 min: https://eleicoes-progressistas.pages.dev/beta 🔐 SHA-256: $hash — São 5 min de teste que fortalecem a democracia. Feedback: contato@eleicoesprogressistas.org.br`n" -ForegroundColor Gray
    
    Write-Host "ASSUNTO E-MAIL: 🇧🇷 Convite: Beta Fechado — Eleições Progressistas 2026" -ForegroundColor White
    Write-Host "CORPO: Olá $nome ($org), acesse https://eleicoes-progressistas.pages.dev/beta para baixar o APK verificado ($hash).`n" -ForegroundColor Gray
}
