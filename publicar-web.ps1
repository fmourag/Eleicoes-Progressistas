# publicar-web.ps1
$ErrorActionPreference = "Stop"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  PUBLICADOR WEB - ELEICOES PROGRESSISTAS (Cloudflare Pages)" -ForegroundColor Cyan
Write-Host "=====================================================================`n" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "[1/3] Verificando autenticacao no Cloudflare..." -ForegroundColor Yellow
$whoami = npx wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[AVISO] Sua sessao no Cloudflare precisa ser autenticada." -ForegroundColor Yellow
    Write-Host "Abrindo navegador para autorizar o Cloudflare no Wrangler..." -ForegroundColor Green
    Write-Host "(Clique em 'Allow' no navegador e retorne a esta janela)`n" -ForegroundColor Green
    npx wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n[ERRO] Falha ao autenticar no Cloudflare." -ForegroundColor Red
        Read-Host "Pressione Enter para sair..."
        exit 1
    }
}
Write-Host "[OK] Sessao Cloudflare autenticada com sucesso!`n" -ForegroundColor Green

Write-Host "[2/3] Compilando web bundle de producao..." -ForegroundColor Yellow
npm run build:web -w @np/mobile
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERRO] Falha ao compilar build web." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

Write-Host "Copiando paginas estaticas (beta, privacidade, feedback)..." -ForegroundColor Cyan
Copy-Item -Path "static\*" -Destination "apps\mobile\dist\" -Recurse -Force

Write-Host "`n[3/3] Enviando deploy para eleicoes-progressistas.pages.dev..." -ForegroundColor Yellow
npx wrangler pages deploy apps/mobile/dist --project-name=eleicoes-progressistas
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERRO] Falha no deploy para o Cloudflare Pages." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "  SUCESSO! Versao v2.2.5 publicada com exito em:" -ForegroundColor Green
Write-Host "  https://eleicoes-progressistas.pages.dev" -ForegroundColor Green
Write-Host "=====================================================================`n" -ForegroundColor Green

Start-Process "https://eleicoes-progressistas.pages.dev"
Read-Host "Pressione Enter para finalizar..."