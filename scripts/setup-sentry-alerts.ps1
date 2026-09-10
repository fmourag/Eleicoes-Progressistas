# scripts/setup-sentry-alerts.ps1
Write-Host "=== CONFIGURAÇÃO DE ALERTAS SENTRY ===" -ForegroundColor Cyan

$alerts = @(
    @{ Name = "API Error Rate > 5%"; Condition = "event.type:error rate():5m > 0.05"; Action = "email" },
    @{ Name = "P95 Latency > 5s"; Condition = "transaction.duration:p95():5m > 5000"; Action = "email" },
    @{ Name = "Mobile Crash Rate > 1%"; Condition = "event.type:error tag[platform]:android rate():1h > 0.01"; Action = "email" },
    @{ Name = "Database Connection Lost"; Condition = "event.type:error message:*database*connected* rate():1m > 0"; Action = "email+slack" }
)

Write-Host "`nAlertas recomendados para v2.2.0:" -ForegroundColor Yellow
$alerts | ForEach-Object {
    Write-Host "  • $($_.Name)" -ForegroundColor White
    Write-Host "    Condição: $($_.Condition)" -ForegroundColor Gray
    Write-Host "    Ação: $($_.Action)" -ForegroundColor Gray
}

Write-Host "`n📋 Passos manuais no Sentry:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://sentry.io/organizations/<org>/alerts/" -ForegroundColor White
Write-Host "2. Clique em 'Create Alert Rule'" -ForegroundColor White
Write-Host "3. Configure cada alerta acima" -ForegroundColor White
Write-Host "4. Adicione destinatários: [SEU EMAIL]" -ForegroundColor White
Write-Host "5. (Opcional) Integre com Slack/Discord" -ForegroundColor White
