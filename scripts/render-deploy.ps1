<#
.SYNOPSIS
    Deploy e validação do serviço Eleições Progressistas no Render.
.DESCRIPTION
    Realiza push para o branch main e valida a disponibilidade dos endpoints unificados no Render,
    incluindo a integridade dos bundles JavaScript do Expo Web.
#>
param(
    [string]$BaseUrl = "https://eleicoes-progressistas.onrender.com",
    [int]$WaitSeconds = 50,
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

    Write-Host "[2/3] Aguardando $WaitSeconds segundos para inicialização e conclusão da build no Render..." -ForegroundColor Yellow
    Start-Sleep -Seconds $WaitSeconds
} else {
    Write-Host "[1/3] Push ignorado conforme parâmetro -SkipPush." -ForegroundColor Gray
}

Write-Host "[3/3] Validando endpoints e integridade dos scripts em $BaseUrl..." -ForegroundColor Yellow

$endpoints = @(
    @{ Name = "API Healthcheck"; Path = "/api/health"; ExpectedStatus = 200 },
    @{ Name = "Web App SPA (Raiz /)"; Path = "/"; ExpectedStatus = 200 },
    @{ Name = "Web App SPA (/web/)"; Path = "/web/"; ExpectedStatus = 200 },
    @{ Name = "Download APK (Header check)"; Path = "/download/apk"; ExpectedStatus = 200; Method = "Head" },
    @{ Name = "APK SHA-256"; Path = "/download/apk/sha256"; ExpectedStatus = 200 },
    @{ Name = "Feedback Page"; Path = "/feedback"; ExpectedStatus = 200 }
)

$allPassed = $true
$scriptPathFound = $null

foreach ($ep in $endpoints) {
    $url = "$BaseUrl$($ep.Path)"
    Write-Host " -> Testando $($ep.Name) [$url]... " -NoNewline
    try {
        if ($ep.Method -eq "Head") {
            $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 20 -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 20 -UseBasicParsing
        }

        if ($response.StatusCode -eq $ep.ExpectedStatus) {
            Write-Host "OK ($($response.StatusCode))" -ForegroundColor Green

            # Se for a página SPA, extrai o caminho do bundle JS para validação estrita
            if ($ep.Path -eq "/web/" -or $ep.Path -eq "/") {
                if ($response.Content -match '<script src="([^"]+)"') {
                    $scriptPathFound = $Matches[1]
                }
            }
        } else {
            Write-Host "WARN: Status $($response.StatusCode)" -ForegroundColor Yellow
            $allPassed = $false
        }
    } catch {
        Write-Host "FALHA: $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

# Validação do bundle JavaScript do Expo Web
if ($scriptPathFound) {
    $scriptUrl = "$BaseUrl$scriptPathFound"
    Write-Host " -> Testando Execução do Script JS [$scriptUrl]... " -NoNewline
    try {
        $jsResponse = Invoke-WebRequest -Uri $scriptUrl -Method Get -TimeoutSec 20 -UseBasicParsing
        $contentType = $jsResponse.Headers["Content-Type"]
        if ($jsResponse.StatusCode -eq 200 -and $contentType -match "javascript") {
            Write-Host "OK (200, Content-Type: $contentType)" -ForegroundColor Green
        } elseif ($jsResponse.StatusCode -eq 200) {
            Write-Host "WARN: 200 OK mas Content-Type inesperado: $contentType" -ForegroundColor Yellow
            $allPassed = $false
        } else {
            Write-Host "FALHA: Status $($jsResponse.StatusCode)" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host "FALHA: $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host "WARN: Não foi possível detectar a tag de script no index.html" -ForegroundColor Yellow
}

Write-Host "----------------------------------------------------------"
if ($allPassed) {
    Write-Host "✓ Todos os endpoints e bundles JS estão 100% operacionais no Render!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alguns endpoints falharam. O build no Render pode ainda estar em andamento." -ForegroundColor Yellow
    Write-Host "Consulte os logs em: https://dashboard.render.com" -ForegroundColor Gray
}
