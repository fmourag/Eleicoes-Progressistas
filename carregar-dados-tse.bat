@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Eleicoes Progressistas - Carga de Dados TSE (CSV/ZIP)

cd /d "%~dp0"

echo ===============================================================================
echo        ELEICOES PROGRESSISTAS - CARGA DE DADOS OFICIAIS TSE
echo ===============================================================================
echo.

:: 1. Identificar arquivo ZIP
set "ZIP_FILE=%~1"

if "!ZIP_FILE!"=="" (
    if exist "%USERPROFILE%\Downloads\consulta_cand_2026.zip" (
        set "ZIP_FILE=%USERPROFILE%\Downloads\consulta_cand_2026.zip"
    ) else if exist ".\consulta_cand_2026.zip" (
        set "ZIP_FILE=.\consulta_cand_2026.zip"
    )
)

:PROMPT_FILE
if "!ZIP_FILE!"=="" (
    echo [!] Nenhum arquivo consulta_cand_2026.zip detectado automaticamente.
    echo.
    echo Arraste o arquivo .zip para esta janela ou digite o caminho completo:
    set /p "ZIP_FILE=> "
    set "ZIP_FILE=!ZIP_FILE:"=!"
)

if not exist "!ZIP_FILE!" (
    echo.
    echo [ERRO] O arquivo especificado nao foi encontrado: "!ZIP_FILE!"
    echo.
    set "ZIP_FILE="
    goto PROMPT_FILE
)

echo [OK] Arquivo selecionado:
echo     "!ZIP_FILE!"
echo.

:MENU
echo -------------------------------------------------------------------------------
echo Escolha o modo de execucao:
echo   [1] Sincronizacao REAL (Gravar candidatos no banco de dados)
echo   [2] Modo SIMULACAO (Dry-run - apenas teste, sem gravar no banco)
echo   [3] Escolher outro arquivo .zip
echo   [4] Sair
echo -------------------------------------------------------------------------------
set /p "OPCAO=Opcao [1-4] (Padrao: 1): "
if "!OPCAO!"=="" set "OPCAO=1"

if "!OPCAO!"=="1" goto EXEC_REAL
if "!OPCAO!"=="2" goto EXEC_DRY
if "!OPCAO!"=="3" (
    set "ZIP_FILE="
    cls
    goto PROMPT_FILE
)
if "!OPCAO!"=="4" goto FIM
goto MENU

:EXEC_REAL
echo.
echo ===============================================================================
echo [1/2] Iniciando carga de candidatos no Banco de Dados...
echo ===============================================================================
call npx tsx scripts/sync-tse.ts --csv --file "!ZIP_FILE!"
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Ocorreu uma falha durante o processamento do arquivo.
    goto FIM
)
echo.
echo ===============================================================================
echo [2/2] Deseja rodar a sincronizacao dos parlamentares em exercicio?
echo ===============================================================================
set /p "RODAR_PARLAMENTARES=Executar sync de parlamentares? (S/N, Padrao: S): "
if "!RODAR_PARLAMENTARES!"=="" set "RODAR_PARLAMENTARES=S"
if /i "!RODAR_PARLAMENTARES!"=="S" (
    echo.
    call npx tsx scripts/sync-real-candidates.ts
)
goto CONCLUIDO

:EXEC_DRY
echo.
echo ===============================================================================
echo Executando em modo SIMULACAO (Dry-Run)...
echo ===============================================================================
call npx tsx scripts/sync-tse.ts --csv --file "!ZIP_FILE!" --dry-run
goto CONCLUIDO

:CONCLUIDO
echo.
echo ===============================================================================
echo [OK] Processamento concluido com sucesso!
echo ===============================================================================

:FIM
echo.
pause
