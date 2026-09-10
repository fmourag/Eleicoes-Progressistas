# scripts/rollback.ps1
param(
    [string]$CommitHash
)

Write-Host "=== ROLLBACK PARA COMMIT $CommitHash ===" -ForegroundColor Yellow
git revert --no-commit $CommitHash..HEAD
git commit -m "revert: rollback to $CommitHash"
git push origin main

Write-Host "`nRollback completo. Deploy automático no Render (~3 min)." -ForegroundColor Green
Write-Host "Valide com: .\scripts\quick-health.ps1" -ForegroundColor Cyan
