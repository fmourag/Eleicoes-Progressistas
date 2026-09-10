# scripts/rollout-plan.ps1
param(
    [ValidateSet("beta", "production")]
    [string]$Track = "beta"
)

Write-Host "=== PLANO DE ROLLOUT PROGRESSIVO ===" -ForegroundColor Cyan

if ($Track -eq "beta") {
    Write-Host "`n🔒 BETA FECHADO (Internal Testing)" -ForegroundColor Yellow
    Write-Host "  • Público: 50 testers convidados" -ForegroundColor White
    Write-Host "  • Duração: 7 dias (D+0 a D+7)" -ForegroundColor White
    Write-Host "  • Critério de saída: Crash-free rate ≥ 98% + NPS ≥ 70" -ForegroundColor White
    Write-Host "`n📊 Métricas de sucesso:" -ForegroundColor Cyan
    Write-Host "  • 50 instalações ativas" -ForegroundColor White
    Write-Host "  • 0 crashes P0" -ForegroundColor White
    Write-Host "  • < 3 bugs P1" -ForegroundColor White
    Write-Host "  • 300+ matchings completados" -ForegroundColor White
} else {
    Write-Host "`n🌐 PRODUÇÃO (Public Release)" -ForegroundColor Yellow
    Write-Host "  • Fase 1 (D+7): 10% dos usuários (staged rollout)" -ForegroundColor White
    Write-Host "  • Fase 2 (D+10): 50% dos usuários" -ForegroundColor White
    Write-Host "  • Fase 3 (D+14): 100% dos usuários" -ForegroundColor White
    Write-Host "`n📊 Métricas de sucesso:" -ForegroundColor Cyan
    Write-Host "  • 5.000 instalações na primeira semana" -ForegroundColor White
    Write-Host "  • Crash-free rate ≥ 99%" -ForegroundColor White
    Write-Host "  • P95 latency ≤ 3s" -ForegroundColor White
    Write-Host "  • 50.000 usuários até 04/10/2026" -ForegroundColor White
}

Write-Host "`n🚨 Gatilhos de rollback:" -ForegroundColor Red
Write-Host "  • Crash rate > 2%" -ForegroundColor White
Write-Host "  • Error rate > 10%" -ForegroundColor White
Write-Host "  • P95 latency > 10s" -ForegroundColor White
Write-Host "  • Bug P0 não resolvido em 4h" -ForegroundColor White
