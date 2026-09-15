@echo off
chcp 65001 >nul
title Publicar Eleições Progressistas Web no Cloudflare Pages

echo =====================================================================
echo   PUBLICADOR WEB — ELEIÇÕES PROGRESSISTAS (Cloudflare Pages)
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando autenticação no Cloudflare...
call npx wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Sua sessão no Cloudflare expirou ou você ainda não fez login.
    echo Abrindo navegador para você autorizar o Wrangler...
    echo.
    call npx wrangler login
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao autenticar no Cloudflare. Tente novamente.
        pause
        exit /b 1
    )
)

echo [OK] Sessão Cloudflare autenticada!
echo.
echo [2/3] Gerando build web de produção (apps/mobile/dist)...
call npm run build:web -w @np/mobile
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao compilar build web.
    pause
    exit /b 1
)

echo.
echo [3/3] Enviando deploy para eleicoes-progressistas.pages.dev...
call npx wrangler pages deploy apps/mobile/dist --project-name=eleicoes-progressistas
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha no deploy para o Cloudflare Pages.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo   SUCESSO! Versão v2.2.3 publicada em:
echo   https://eleicoes-progressistas.pages.dev
echo =====================================================================
echo.
pause
