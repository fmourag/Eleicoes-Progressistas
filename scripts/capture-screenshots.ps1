# scripts/capture-screenshots.ps1
$screens = @("01-home-candidatos", "02-matching-pilares", "03-raio-x", "04-cola-pdf")
$outDir = "assets/store/screenshots"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (!(Test-Path $adb)) {
    $adb = "adb"
}

Write-Host "=== CAPTURA DE SCREENSHOTS PARA LOJA ===" -ForegroundColor Cyan
foreach ($s in $screens) {
    Write-Host "`n📱 Tela alvo: $s" -ForegroundColor Yellow
    Read-Host "Navegue até a tela no aparelho conectado e pressione ENTER para capturar"
    try {
        & $adb shell screencap -p /sdcard/sc.png
        & $adb pull /sdcard/sc.png "$outDir/$s.png"
        Write-Host "[OK] Capturado: $outDir/$s.png" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Erro ao capturar tela via ADB: $($_.Exception.Message)" -ForegroundColor Red
    }
}
