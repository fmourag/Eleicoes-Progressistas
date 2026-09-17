<#
.SYNOPSIS
    Atualiza o APK estático servido pela API NestJS no Render.
.DESCRIPTION
    Obtém o APK (via arquivo local ou GitHub Release), armazena em apps/api/static/apk/,
    calcula o hash SHA-256 e opcionalmente faz o commit e deploy.
#>
param(
    [string]$ApkPath,
    [string]$FromRelease = "v2.2.5",
    [string]$Version = "2.2.5",
    [switch]$AutoCommit
)

$ErrorActionPreference = "Stop"

$staticApkDir = Join-Path $PSScriptRoot "..\apps\api\static\apk"
$targetApkName = "eleicoes-progressistas-v$Version.apk"
$targetApkPath = Join-Path $staticApkDir $targetApkName
$shaPath = Join-Path $staticApkDir "sha256.txt"

if (-not (Test-Path $staticApkDir)) {
    New-Item -ItemType Directory -Path $staticApkDir -Force | Out-Null
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ATUALIZAÇÃO DE APK ESTÁTICO (RENDER) — v$Version        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if ($ApkPath -and (Test-Path $ApkPath)) {
    Write-Host "[1/4] Copiando APK de caminho local: $ApkPath" -ForegroundColor Yellow
    Copy-Item -Path $ApkPath -Destination $targetApkPath -Force
} else {
    $releaseUrl = "https://github.com/fmourag/Eleicoes-Progressistas/releases/download/$FromRelease/eleicoes-progressistas-$FromRelease-beta.apk"
    Write-Host "[1/4] Baixando APK da release GitHub: $releaseUrl" -ForegroundColor Yellow
    Invoke-WebRequest -Uri $releaseUrl -OutFile $targetApkPath -UseBasicParsing
}

$apkSize = (Get-Item $targetApkPath).Length
Write-Host "[2/4] APK gravado em: $targetApkPath ($apkSize bytes)" -ForegroundColor Green

Write-Host "[3/4] Calculando hash SHA-256..." -ForegroundColor Yellow
$hashResult = Get-FileHash -Path $targetApkPath -Algorithm SHA256
$sha256 = $hashResult.Hash.ToLower()
Set-Content -Path $shaPath -Value $sha256 -Encoding UTF8
Write-Host "✓ Hash SHA-256: $sha256" -ForegroundColor Green

if ($AutoCommit) {
    Write-Host "[4/4] Criando commit e enviando ao repositório..." -ForegroundColor Yellow
    git add $targetApkPath $shaPath
    git commit -m "build(apk): update static apk v$Version and sha256"
    git push origin main
    Write-Host "✓ Alterações enviadas com sucesso para o Render." -ForegroundColor Green
} else {
    Write-Host "[4/4] Concluído localmente. Para enviar ao Render execute: git add . && git commit -m 'build(apk): update static apk' && git push" -ForegroundColor Cyan
}
