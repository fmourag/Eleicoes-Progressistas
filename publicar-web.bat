@echo off
setlocal enabledelayedexpansion
title Publicar Eleicoes Progressistas Web no Cloudflare Pages

echo =====================================================================
echo   PUBLICADOR WEB - ELEICOES PROGRESSISTAS (Cloudflare Pages)
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando autenticacao no Cloudflare...
call npx wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Sua sessao no Cloudflare precisa ser autenticada.
    echo Abrindo navegador para autorizar o Cloudflare no Wrangler...
    echo.
    call npx wrangler login
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao autenticar no Cloudflare. Tente novamente.
        pause
        exit /b 1
    )
)

echo [OK] Sessao Cloudflare autenticada com sucesso!
echo.
echo [2/3] Preparando build web de producao...
call npm run build:web -w @np/mobile
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao compilar build web.
    pause
    exit /b 1
)

echo Copiando paginas estaticas complementares...
xcopy /y /e /i /q "static\*" "apps\mobile\dist\" >nul 2>&1

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
echo   SUCESSO! Versao v2.2.5 publicada com exito em:
echo   https://eleicoes-progressistas.pages.dev
echo =====================================================================
echo.
pause