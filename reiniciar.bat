@echo off
chcp 65001 >nul
title Eleicoes Progressistas v2.2.5 - Reiniciar (Lite)
echo ===================================================
echo  Reiniciar v2.2.5 - Encerra processos e inicia Lite
echo ===================================================

echo [1/5] Matando processos antigos...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8001" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8002" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 >nul
echo       OK.

echo [2/5] Verificando Node.js...
node -v >nul 2>&1 || (echo [ERRO] Node.js nao instalado. & pause & exit /b 1)
echo       Node %errorlevel% OK.

echo [3/5] Dependencias...
if not exist node_modules\@np\shared\dist\index.js (
  echo       Instalando dependencias (1x)...
  call npm install --no-audit --progress=false --legacy-peer-deps >nul 2>&1
)
if not exist apps\mobile\node_modules\expo\package.json (
  echo       Instalando mobile...
  call npm install --no-audit --progress=false --legacy-peer-deps --prefix apps/mobile >nul 2>&1
)
echo       Dependencias OK.

echo [4/5] Banco e builds...
if not exist apps\api\dev.db if not exist apps\api\prisma\dev.db (
  echo       Criando banco SQLite...
  call npm run setup:quick >nul 2>&1
  if exist apps\api\prisma\dev.db copy /Y apps\api\prisma\dev.db apps\api\dev.db >nul 2>&1
)
if not exist apps\mobile\dist\index.html (
  echo       Compilando web...
  call npm run build -w @np/shared >nul 2>&1
  call npm run build:web -w @np/mobile >nul 2>&1
  if exist static\ xcopy /E /I /Y /D "static\*" "apps\mobile\dist\" >nul 2>&1
)
if not exist apps\api\dist\main.js (
  echo       Compilando API...
  call npm run build -w @np/shared >nul 2>&1
  call npm run build:api >nul 2>&1
)
echo       Builds OK.

echo [5/5] Iniciando servidor unico em http://localhost:3000 ...
set DATABASE_URL=file:./dev.db
set NODE_ENV=development
set DB_PROVIDER=sqlite
set USE_LOCAL_MATCHING=true
set JWT_SECRET=dev-secret-not-for-production
set PORT=3000
start "" http://localhost:3000
npm run start:lite
