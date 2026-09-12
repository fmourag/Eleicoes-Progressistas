$csvFile = "feedback/feedback-latest.csv"
if (-not (Test-Path $csvFile)) {
    $found = Get-ChildItem "feedback/feedback-recebido-*.csv" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($found) {
        $csvFile = $found.FullName
    } else {
        Write-Host "Nenhum arquivo de feedback encontrado. Execute scripts/pull-feedback.ps1 primeiro." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "=== ESTATÍSTICAS DE FEEDBACK (BETA v2.2.2) ===" -ForegroundColor Cyan
$feedbacks = Import-Csv -Path $csvFile -Delimiter ";"

$total = $feedbacks.Count
Write-Host "Total de reportes recebidos: $total" -ForegroundColor White

if ($total -gt 0) {
    $npsVals = $feedbacks | ForEach-Object { [int]$_.nps }
    $avgNps = ($npsVals | Measure-Object -Average).Average
    Write-Host ("Média NPS: {0:N2} / 10" -f $avgNps) -ForegroundColor Green

    Write-Host "`nDistribuição por Tipo de Problema:" -ForegroundColor Yellow
    $feedbacks | Group-Object problema | Select-Object Count, Name | Format-Table -AutoSize

    Write-Host "`nDistribuição por Dispositivo / OS:" -ForegroundColor Cyan
    $feedbacks | Group-Object device | Select-Object Count, Name | Format-Table -AutoSize

    Write-Host "Últimos 5 Protocolos Registrados:" -ForegroundColor Gray
    $feedbacks | Select-Object -Last 5 protocol, createdAt, nps, problema | Format-Table -AutoSize
}

