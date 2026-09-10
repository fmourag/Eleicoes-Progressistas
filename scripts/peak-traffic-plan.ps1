# scripts/peak-traffic-plan.ps1
Write-Host "=== PLANO DE PICO DE TRÁFEGO (04/10/2026) ===" -ForegroundColor Cyan

$timeline = @(
    @{ Time = "D-7 (27/09)"; Action = "Monitorar métricas diárias"; Tool = "Sentry + Cloudflare" },
    @{ Time = "D-3 (01/10)"; Action = "Upgrade Render para Starter (`$7/mês)"; Tool = "Render Dashboard" },
    @{ Time = "D-1 (03/10)"; Action = "Upgrade Supabase para Pro (`$25/mês)"; Tool = "Supabase Dashboard" },
    @{ Time = "D-Day (04/10)"; Action = "Monitoramento contínuo a cada 15 min"; Tool = ".\scripts\health-monitor.ps1" },
    @{ Time = "D+1 (05/10)"; Action = "Avaliar pico e decidir se mantém upgrades"; Tool = "Sentry + Render Metrics" }
)

Write-Host "`n📅 Timeline de preparação:" -ForegroundColor Yellow
$timeline | ForEach-Object {
    Write-Host "  $($_.Time): $($_.Action)" -ForegroundColor White
    Write-Host "    Ferramenta: $($_.Tool)" -ForegroundColor Gray
}

Write-Host "`n💰 Custo total estimado (D-3 a D+7):" -ForegroundColor Cyan
Write-Host "  • Render Starter: `$7/mês × 10 dias = `$2.33" -ForegroundColor White
Write-Host "  • Supabase Pro: `$25/mês × 10 dias = `$8.33" -ForegroundColor White
Write-Host "  • Cloudflare Pages: `$0" -ForegroundColor White
Write-Host "  • TOTAL: ~`$10.66" -ForegroundColor Green

Write-Host "`n🚨 Gatilhos para downgrade (D+7):" -ForegroundColor Yellow
Write-Host "  • Tráfego normalizado (< 1.000 req/dia)" -ForegroundColor White
Write-Host "  • P95 latency estável (< 3s)" -ForegroundColor White
Write-Host "  • Error rate < 1%" -ForegroundColor White
