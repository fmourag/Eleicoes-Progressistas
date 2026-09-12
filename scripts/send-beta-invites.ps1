# scripts/send-beta-invites.ps1
$csvPath = "docs/tester-codes.csv"
$hash = "9b8f1a71f1d786eefc711c646785c9ed87338c3957a3bf6926db889bd757d6c7"
$downloadUrl = "https://eleicoes-progressistas.onrender.com/beta"
$baseFeedbackUrl = "https://eleicoes-progressistas.onrender.com/feedback"

if (!(Test-Path $csvPath)) {
    Write-Host "[ERRO] Arquivo $csvPath não encontrado! Execute scripts/generate-tester-codes.ps1 primeiro." -ForegroundColor Red
    exit 1
}

$testers = Import-Csv -Path $csvPath

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   MENSAGENS INDIVIDUALIZADAS PARA TESTADORES BETA (v2.2.2)" -ForegroundColor Cyan
Write-Host "   Link de Download Único + Identificação no Envio de Feedback" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

foreach ($t in $testers) {
    $code = $t.code
    $nome = $t.name
    $email = $t.email
    $org = $t.organization
    $personalFeedbackUrl = "$baseFeedbackUrl?code=$code"
    
    Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "Destinatário: $nome ($code | $email - $org)" -ForegroundColor Green
    Write-Host "----------------------------------------------------------------" -ForegroundColor Yellow
    
    Write-Host "WHATSAPP / TELEGRAM:" -ForegroundColor White
    Write-Host "🇧🇷 Olá $nome! A versão v2.2.2 do Eleições Progressistas está liberada.`n" -ForegroundColor Gray
    Write-Host "📱 Link ÚNICO de instalação: $downloadUrl" -ForegroundColor Gray
    Write-Host "🔐 SHA-256: $hash`n" -ForegroundColor Gray
    Write-Host "🔑 Seu Código de Tester: $code" -ForegroundColor Cyan
    Write-Host "📝 Envio rápido de feedback: $personalFeedbackUrl (ou toque no botão 💬 dentro do app)`n" -ForegroundColor Gray
    
    Write-Host "ASSUNTO E-MAIL: 🇧🇷 Homologação v2.2.2: Fotos Parlamentares + UI Responsiva [$code]" -ForegroundColor White
    Write-Host "CORPO: Olá $nome ($org),`n`nAcesse $downloadUrl para baixar o APK verificado da v2.2.2 ($hash).`n`nAo finalizar seus testes (5 min), envie seu feedback pelo link pré-preenchido: $personalFeedbackUrl ou diretamente pelo botão flutuante 💬 no app.`n`nEquipe Eleições Progressistas`n" -ForegroundColor Gray
}
