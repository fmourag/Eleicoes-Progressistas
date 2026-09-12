$adminToken = $env:ADMIN_FEEDBACK_TOKEN
if (-not $adminToken) { $adminToken = $env:ADMIN_SECRET }
if (-not $adminToken) { $adminToken = "dev-secret" }

$apiUrl = $env:API_URL
if (-not $apiUrl) { $apiUrl = "https://eleicoes-progressistas.onrender.com" }

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = "feedback"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$outFile = "$outDir/feedback-recebido-$timestamp.csv"

Write-Host "Baixando feedbacks de $apiUrl/api/feedback/export.csv..." -ForegroundColor Cyan
try {
    $headers = @{ "x-admin-token" = $adminToken }
    $response = Invoke-WebRequest -Uri "$apiUrl/api/feedback/export.csv" -Headers $headers -UseBasicParsing -TimeoutSec 30
    [System.IO.File]::WriteAllBytes((Resolve-Path $outDir).Path + "/feedback-recebido-$timestamp.csv", $response.RawContentStream.ToArray())
    Write-Host "✅ Feedbacks salvos com sucesso em: $outFile" -ForegroundColor Green
    
    # Atualizar cópia canônica latest
    Copy-Item $outFile "$outDir/feedback-latest.csv" -Force
} catch {
    Write-Host "❌ Falha ao baixar feedbacks: $($_.Exception.Message)" -ForegroundColor Red
}
