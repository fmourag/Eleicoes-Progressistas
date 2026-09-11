# scripts/send-beta-invites.ps1
$csvPath = "docs/testers-beta.csv"
$hash = "c99d481b43032aeca3e0c88a22da5504b668ccbe1f7716ac8f98d31b3a79d200"

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
    Write-Host "🇧🇷 $nome, você foi selecionado(a) para o Beta Fechado do Eleições Progressistas 2026! 📱 Instale em 2 min: https://eleicoes-progressistas.onrender.com/beta 🔐 SHA-256: $hash — São 5 min de teste que fortalecem a democracia. Feedback: contato@eleicoesprogressistas.org.br`n" -ForegroundColor Gray
    
    Write-Host "ASSUNTO E-MAIL: 🇧🇷 Convite: Beta Fechado — Eleições Progressistas 2026" -ForegroundColor White
    Write-Host "CORPO: Olá $nome ($org), acesse https://eleicoes-progressistas.onrender.com/beta para baixar o APK verificado ($hash).`n" -ForegroundColor Gray
}

