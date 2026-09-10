# scripts/quick-health.ps1
$API = 'https://eleicoes-progressistas.onrender.com'
$WEB = 'https://eleicoes-progressistas.pages.dev'

Write-Host '=== HEALTH CHECK RAPIDO ===' -ForegroundColor Cyan

# API
try {
    $h = Invoke-RestMethod -Uri "$API/api/health" -TimeoutSec 30
    Write-Host "[OK] API: status=$($h.status) db=$($h.database)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] API: $($_.Exception.Message)" -ForegroundColor Red
}

# Web
try {
    $w = Invoke-WebRequest -Uri $WEB -TimeoutSec 30 -UseBasicParsing
    Write-Host "[OK] Web: HTTP $($w.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Web: $($_.Exception.Message)" -ForegroundColor Red
}

# Ops Mode
try {
    $o = Invoke-RestMethod -Uri "$API/api/ops/mode" -TimeoutSec 30
    Write-Host "[OK] Ops: mode=$($o.mode)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Ops: $($_.Exception.Message)" -ForegroundColor Red
}

# Blackout
try {
    $b = Invoke-RestMethod -Uri "$API/api/ads/activation" -TimeoutSec 30
    Write-Host "[OK] Blackout: servingNow=$($b.servingNow) until=$($b.blackoutUntil)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Blackout: $($_.Exception.Message)" -ForegroundColor Red
}

# Matching
try {
    $body = @{ priority_pillars = @('p3','p9','p11'); location = @{ uf = 'SP' } } | ConvertTo-Json
    $m = Invoke-RestMethod -Uri "$API/api/matching/rank" -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 15
    Write-Host "[OK] Match: $($m.results.Count) candidates ranked" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Match: $($_.Exception.Message)" -ForegroundColor Red
}

# Cola PDF
try {
    $c = Invoke-WebRequest -Uri "$API/api/cola/pdf?ids=6c72e3c5-29da-4952-9673-e1da0f0200f7&state=SP" -TimeoutSec 30 -UseBasicParsing
    Write-Host "[OK] Cola: $($c.StatusCode) $($c.Headers['Content-Type']) $($c.Content.Length) bytes" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Cola: $($_.Exception.Message)" -ForegroundColor Red
}
