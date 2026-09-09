@echo off
setlocal enabledelayedexpansion

title Eleicoes Progressistas v2.2.0 - Inicializador Local

:: Garante execucao no diretorio raiz do projeto
cd /d "%~dp0"

echo ===============================================================================
echo        ELEICOES PROGRESSISTAS v2.2.0 - INICIALIZADOR LOCAL LEVE
echo ===============================================================================
echo.

:: -----------------------------------------------------------------------------
:: Leitura de parametros de linha de comando
:: -----------------------------------------------------------------------------
set FORCED_REBUILD=0
set CLEAN_BUILD=0
set RESET_DB=0
set SYNC_CANDIDATES=0
set OPEN_BROWSER=1

for %%A in (%*) do (
    if /i "%%A"=="--rebuild" set FORCED_REBUILD=1
    if /i "%%A"=="-r" set FORCED_REBUILD=1
    if /i "%%A"=="--clean" set CLEAN_BUILD=1
    if /i "%%A"=="--reset-db" set RESET_DB=1
    if /i "%%A"=="--sync" set SYNC_CANDIDATES=1
    if /i "%%A"=="--no-browser" set OPEN_BROWSER=0
)

if "!CLEAN_BUILD!"=="1" set FORCED_REBUILD=1

:: -----------------------------------------------------------------------------
:: 1. Parar servicos e servidores anteriores rodando nas portas da aplicacao
:: -----------------------------------------------------------------------------
echo [1/6] Encerrando processos e servidores anteriores nas portas...
for %%P in (3000 8081 8001 8002) do (
    for /f "tokens=5" %%A in ('netstat -ano 2^>nul ^| findstr /r /c:":%%P .*LISTENING"') do (
        taskkill /f /pid %%A >nul 2>&1
    )
)
echo       Portas 3000, 8081, 8001 e 8002 liberadas com sucesso.
echo.

:: -----------------------------------------------------------------------------
:: 2. Verificar dependencias NPM
:: -----------------------------------------------------------------------------
echo [2/6] Verificando dependencias do projeto...
if exist "node_modules\" goto DEPS_OK
echo       Instalando modulos npm...
call npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias npm.
    pause
    exit /b 1
)
:DEPS_OK
echo       Dependencias npm verificadas.
echo.

:: -----------------------------------------------------------------------------
:: 3. Banco de dados SQLite local
:: -----------------------------------------------------------------------------
echo [3/6] Verificando banco de dados local SQLite...
if "!RESET_DB!"=="1" (
    echo       Parametro --reset-db detectado. Removendo apps\api\dev.db antigo...
    if exist "apps\api\dev.db" del /f /q "apps\api\dev.db"
)

if exist "apps\api\dev.db" goto DB_EXISTS
echo       Criando e populando apps\api\dev.db com dados iniciais...
call npm run seed:quick
if errorlevel 1 (
    echo [ERRO] Falha ao inicializar o banco de dados.
    pause
    exit /b 1
)
goto DB_DONE

:DB_EXISTS
echo       Banco apps\api\dev.db pronto.
echo       Garantindo cliente Prisma sincronizado...
call npx prisma generate --schema=apps\api\prisma\schema-sqlite.prisma >nul 2>&1

:DB_DONE
if "!SYNC_CANDIDATES!"=="1" (
    echo       Sincronizando candidaturas oficiais TSE...
    call npm run sync:real
)
echo.

:: -----------------------------------------------------------------------------
:: 4. Verificacao Inteligente de Build
:: -----------------------------------------------------------------------------
echo [4/6] Verificando artefatos de compilacao...

if "!CLEAN_BUILD!"=="1" (
    echo       Limpando pastas dist anteriores...
    if exist "apps\api\dist" rmdir /s /q "apps\api\dist"
    if exist "apps\mobile\dist" rmdir /s /q "apps\mobile\dist"
    if exist "packages\shared\dist" rmdir /s /q "packages\shared\dist"
)

set NEED_REBUILD_SHARED=0
set NEED_REBUILD_API=0
set NEED_REBUILD_WEB=0

if "!FORCED_REBUILD!"=="1" (
    set NEED_REBUILD_SHARED=1
    set NEED_REBUILD_API=1
    set NEED_REBUILD_WEB=1
    goto RUN_BUILDS
)

:: Verifica packages\shared
if not exist "packages\shared\dist\index.js" set NEED_REBUILD_SHARED=1

:: Verifica apps\api
if not exist "apps\api\dist\main.js" goto SET_API_REBUILD
powershell -NoProfile -Command "$s=(Get-ChildItem 'apps\api\src' -Recurse -File | Measure-Object LastWriteTime -Maximum).Maximum; $d=(Get-Item 'apps\api\dist\main.js').LastWriteTime; if($s -gt $d){exit 1}else{exit 0}" >nul 2>&1
if errorlevel 1 (
    echo       Modificacoes detectadas em apps\api\src.
    set NEED_REBUILD_API=1
)
goto CHECK_WEB

:SET_API_REBUILD
set NEED_REBUILD_API=1

:CHECK_WEB
:: Verifica apps\mobile
if not exist "apps\mobile\dist\index.html" goto SET_WEB_REBUILD
powershell -NoProfile -Command "$s=(Get-ChildItem 'apps\mobile\app','apps\mobile\components','apps\mobile\utils' -Recurse -File | Measure-Object LastWriteTime -Maximum).Maximum; $d=(Get-Item 'apps\mobile\dist\index.html').LastWriteTime; if($s -gt $d){exit 1}else{exit 0}" >nul 2>&1
if errorlevel 1 (
    echo       Modificacoes detectadas no frontend mobile/web.
    set NEED_REBUILD_WEB=1
)
goto RUN_BUILDS

:SET_WEB_REBUILD
set NEED_REBUILD_WEB=1

:RUN_BUILDS
if "!NEED_REBUILD_SHARED!"=="1" (
    echo       Compilando @np/shared...
    call npm run build -w @np/shared
)

if "!NEED_REBUILD_API!"=="1" (
    echo       Compilando @np/api...
    call npm run build:api
)

if "!NEED_REBUILD_WEB!"=="1" (
    echo       Compilando frontend web @np/mobile...
    call npm run build:web -w @np/mobile
)

:: Sincroniza fotos de candidatos com a distribuicao web
if exist "apps\mobile\public\candidates" (
    if not exist "apps\mobile\dist\candidates" mkdir "apps\mobile\dist\candidates" >nul 2>&1
    xcopy /E /I /Y /D "apps\mobile\public\candidates" "apps\mobile\dist\candidates" >nul 2>&1
)

echo       Artefatos de compilacao prontos.
echo.

:: -----------------------------------------------------------------------------
:: 5. Variaveis de Ambiente do Modo Local Leve
:: -----------------------------------------------------------------------------
echo [5/6] Configurando ambiente local...
set NODE_ENV=development
set DB_PROVIDER=sqlite
set DATABASE_URL=file:./dev.db
set USE_LOCAL_MATCHING=true
set JWT_SECRET=dev-secret-not-for-production
set PORT=3000
set CORS_ORIGINS=http://localhost:3000,http://localhost:8081

:: -----------------------------------------------------------------------------
:: 6. Inicializacao do Servidor e Abertura Automatica do Navegador
:: -----------------------------------------------------------------------------
echo [6/6] Iniciando servidor e monitor de abertura...

if "!OPEN_BROWSER!"=="1" (
    start "" powershell -NoProfile -WindowStyle Hidden -Command "$url = 'http://localhost:3000'; for ($i = 0; $i -lt 30; $i++) { Start-Sleep -Seconds 1; try { $res = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { Start-Process $url; break } } catch {} }"
)

echo.
echo ===============================================================================
echo  APLICACAO PRONTA E RODANDO!
echo.
echo  Principal:      http://localhost:3000
echo  Candidatos:     http://localhost:3000/candidatos
echo  Prioridades:    http://localhost:3000/matching
echo  Minha Cola:     http://localhost:3000/cola
echo  Apoie (PIX):    http://localhost:3000/apoie
echo  Health Check:   http://localhost:3000/api/health
echo.
echo  Dicas de uso do script:
echo    iniciar.bat --rebuild    Forca recompilacao de todos os pacotes
echo    iniciar.bat --clean      Limpa pastas dist/ e recompila do zero
echo    iniciar.bat --reset-db   Reinicializa o banco SQLite com o seed inicial
echo    iniciar.bat --sync       Sincroniza candidaturas adicionais do TSE
echo.
echo  Pressione Ctrl+C para encerrar o servidor.
echo ===============================================================================
echo.

cd apps\api
node dist\main.js
