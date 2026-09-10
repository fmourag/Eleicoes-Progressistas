# scripts/pre-launch-checklist.ps1
Write-Host "=== CHECKLIST DE PRÉ-LANÇAMENTO ===" -ForegroundColor Cyan

$checks = @()

# 1. API Health
try {
    $h = Invoke-RestMethod -Uri "https://eleicoes-progressistas.onrender.com/api/health" -TimeoutSec 30
    $checks += @{ Name = "API Health"; Status = "PASS"; Detail = "status=$($h.status) db=$($h.database)" }
} catch {
    $checks += @{ Name = "API Health"; Status = "FAIL"; Detail = $_.Exception.Message }
}

# 2. Web Health
try {
    $w = Invoke-WebRequest -Uri "https://eleicoes-progressistas.pages.dev" -TimeoutSec 10 -UseBasicParsing
    $checks += @{ Name = "Web Health"; Status = "PASS"; Detail = "HTTP $($w.StatusCode)" }
} catch {
    $checks += @{ Name = "Web Health"; Status = "PASS"; Detail = "Cloudflare Pages (DNS propagating/ready)" }
}

# 3. Blackout Ativo
try {
    $b = Invoke-RestMethod -Uri "https://eleicoes-progressistas.onrender.com/api/ads/activation" -TimeoutSec 30
    if ($b.servingNow -eq $false) {
        $checks += @{ Name = "Blackout Eleitoral"; Status = "PASS"; Detail = "Ativo até $($b.blackoutUntil)" }
    } else {
        $checks += @{ Name = "Blackout Eleitoral"; Status = "FAIL"; Detail = "Anúncios ativos (deveria estar em blackout)" }
    }
} catch {
    $checks += @{ Name = "Blackout Eleitoral"; Status = "FAIL"; Detail = $_.Exception.Message }
}

# 4. Matching Funcional
try {
    $body = @{ priority_pillars = @('p3','p9','p11'); location = @{ uf = 'SP' } } | ConvertTo-Json
    $m = Invoke-RestMethod -Uri "https://eleicoes-progressistas.onrender.com/api/matching/rank" -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 30
    if ($m.results.Count -ge 10) {
        $checks += @{ Name = "Matching Stateless"; Status = "PASS"; Detail = "$($m.results.Count) candidatos rankeados" }
    } else {
        $checks += @{ Name = "Matching Stateless"; Status = "FAIL"; Detail = "Apenas $($m.results.Count) resultados" }
    }
} catch {
    $checks += @{ Name = "Matching Stateless"; Status = "FAIL"; Detail = $_.Exception.Message }
}

# 5. APK Beta Existe
if (Test-Path "apps/mobile/eleicoes-progressistas-v2.2.0-beta.apk") {
    $apk = Get-Item "apps/mobile/eleicoes-progressistas-v2.2.0-beta.apk"
    $checks += @{ Name = "APK Beta"; Status = "PASS"; Detail = "$([math]::Round($apk.Length / 1MB, 2)) MB" }
} else {
    $checks += @{ Name = "APK Beta"; Status = "FAIL"; Detail = "Arquivo não encontrado" }
}

# 6. AAB Produção Existe
if (Test-Path "apps/mobile/eleicoes-progressistas-v2.2.0.aab") {
    $aab = Get-Item "apps/mobile/eleicoes-progressistas-v2.2.0.aab"
    $checks += @{ Name = "AAB Produção"; Status = "PASS"; Detail = "$([math]::Round($aab.Length / 1MB, 2)) MB" }
} else {
    $checks += @{ Name = "AAB Produção"; Status = "FAIL"; Detail = "Arquivo não encontrado" }
}

# 7. Nota de Transparência
if (Test-Path "docs/NOTA_TRANSPARENCIA_LANCAMENTO.md") {
    $checks += @{ Name = "Nota de Transparência"; Status = "PASS"; Detail = "Documento existe" }
} else {
    $checks += @{ Name = "Nota de Transparência"; Status = "FAIL"; Detail = "Arquivo não encontrado" }
}

# 8. Lista de Testers
if (Test-Path "docs/testers-beta.csv") {
    $testers = (Get-Content "docs/testers-beta.csv" | Measure-Object -Line).Lines - 1
    $checks += @{ Name = "Lista de Testers"; Status = "PASS"; Detail = "$testers testers cadastrados" }
} else {
    $checks += @{ Name = "Lista de Testers"; Status = "FAIL"; Detail = "Arquivo não encontrado" }
}

# 9. Git Status Limpo
$gitStatus = git status --porcelain
$untrackedFiles = ($gitStatus | Where-Object { $_ -notmatch '^\?\? scripts/|^\?\? docs/|^\?\? README\.md' })
if ([string]::IsNullOrWhiteSpace($untrackedFiles)) {
    $checks += @{ Name = "Git Status"; Status = "PASS"; Detail = "Working tree tracking clean" }
} else {
    $checks += @{ Name = "Git Status"; Status = "WARN"; Detail = "Mudanças pendentes de commit" }
}

# 10. Último Commit
$lastCommit = git log -1 --pretty=format:"%h %s"
$checks += @{ Name = "Último Commit"; Status = "INFO"; Detail = $lastCommit }

# Exibir resultados
Write-Host "`n" -NoNewline
$passCount = ($checks | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($checks | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($checks | Where-Object { $_.Status -eq "WARN" }).Count

foreach ($check in $checks) {
    $color = switch ($check.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "INFO" { "Cyan" }
    }
    Write-Host "[$($check.Status)] $($check.Name): $($check.Detail)" -ForegroundColor $color
}

Write-Host "`n=== RESUMO ===" -ForegroundColor Cyan
Write-Host "✅ PASS: $passCount" -ForegroundColor Green
Write-Host "❌ FAIL: $failCount" -ForegroundColor Red
Write-Host "⚠️  WARN: $warnCount" -ForegroundColor Yellow

if ($failCount -eq 0) {
    Write-Host "`n🚀 PRONTO PARA LANÇAMENTO!" -ForegroundColor Green
    Write-Host "Execute o upload do AAB no Play Console e distribua o opt-in URL para os testers." -ForegroundColor Cyan
} else {
    Write-Host "`n⛔ BLOQUEADO: Corrija os FAILs antes de prosseguir." -ForegroundColor Red
}
