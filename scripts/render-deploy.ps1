<#
.SYNOPSIS
    Deploy e validação do serviço Eleições Progressistas no Render.
.DESCRIPTION
    Realiza push para o branch main e valida a disponibilidade dos endpoints unificados no Render.
#>
param(
    [string]$BaseUrl = "https://eleicoes-progressistas.onrender.com",
    [int]$WaitSeconds = 45,
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ELEIÇÕES PROGRESSISTAS — DEPLOY NO RENDER               " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $SkipPush) {
    Write-Host "[1/3] Enviando alterações para o repositório remoto (origin/main)..." -ForegroundColor Yellow
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao executar git push origin main."
    }
    Write-Host "✓ Código sincronizado com sucesso." -ForegroundColor Green

    Write-Host "[2/3] Aguardando $WaitSeconds segundos para inicialização da build no Render..." -ForegroundColor Yellow
    Start-Sleep -Seconds $WaitSeconds
} else {
    Write-Host "[1/3] Push ignorado conforme parâmetro -SkipPush." -ForegroundColor Gray
}

Write-Host "[3/3] Validando endpoints em $BaseUrl..." -ForegroundColor Yellow

$endpoints = @(
    @{ Name = "API Healthcheck"; Path = "/api/health"; ExpectedStatus = 200 },
    @{ Name = "Web App (SPA)"; Path = "/web/"; ExpectedStatus = 200 },
    @{ Name = "Download APK (Header check)"; Path = "/download/apk"; ExpectedStatus = 200; Method = "Head" },
    @{ Name = "APK SHA-256"; Path = "/download/apk/sha256"; ExpectedStatus = 200 },
    @{ Name = "Feedback Page"; Path = "/feedback"; ExpectedStatus = 200 }
)

$allPassed = $true

foreach ($ep in $endpoints) {
    $url = "$BaseUrl$($ep.Path)"
    Write-Host " -> Testando $($ep.Name) [$url]... " -NoNewline
    try {
        if ($ep.Method -eq "Head") {
            $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 15 -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 15 -UseBasicParsing
        }

        if ($response.StatusCode -eq $ep.ExpectedStatus) {
            Write-Host "OK ($($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "WARN: Status $($response.StatusCode)" -ForegroundColor Yellow
            $allPassed = $false
        }
    } catch {
        Write-Host "FALHA: $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host "----------------------------------------------------------"
if ($allPassed) {
    Write-Host "✓ Todos os endpoints unificados estão operacionais no Render!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alguns endpoints falharam. O build no Render pode ainda estar em andamento." -ForegroundColor Yellow
    Write-Host "Consulte os logs em: https://dashboard.render.com" -ForegroundColor Gray
}
