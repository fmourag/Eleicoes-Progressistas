# scripts/hotfix-template.ps1
param(
    [string]$IssueNumber,
    [string]$Description
)

$branchName = "hotfix/$IssueNumber-$(Get-Date -Format 'yyyyMMdd')"
git checkout -b $branchName

Write-Host "Branch de hotfix criada: $branchName" -ForegroundColor Green
Write-Host "Faça as correções, commit e push:" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'hotfix(#$IssueNumber): $Description'" -ForegroundColor White
Write-Host "  git push origin $branchName" -ForegroundColor White
Write-Host "`nDepois abra PR no GitHub e merge." -ForegroundColor Yellow
