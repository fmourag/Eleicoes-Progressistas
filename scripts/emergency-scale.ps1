# scripts/emergency-scale.ps1
Write-Host '=== PLANO DE CONTINGÊNCIA — ELEIÇÕES 2026 ===' -ForegroundColor Cyan

Write-Host "`n1. RENDER (API):" -ForegroundColor Yellow
Write-Host '   - Free tier: 512MB RAM, 0.1 CPU, spin-down após 15 min'
Write-Host '   - Upgrade para Starter ($7/mês): 1GB RAM, 0.5 CPU, always-on'
Write-Host '   - Comando: Render Dashboard → Settings → Instance Type → Starter'

Write-Host "`n2. SUPABASE (DB):" -ForegroundColor Yellow
Write-Host '   - Free tier: 500MB storage, 5GB bandwidth/mês'
Write-Host '   - Upgrade para Pro ($25/mês): 8GB storage, 250GB bandwidth'
Write-Host '   - Comando: Supabase Dashboard → Settings → Billing → Upgrade'

Write-Host "`n3. CLOUDFLARE PAGES (Web):" -ForegroundColor Yellow
Write-Host '   - Free tier: ilimitado (já escala automaticamente)'
Write-Host '   - Nenhuma ação necessária'

Write-Host "`n4. EXPO EAS (Builds):" -ForegroundColor Yellow
Write-Host '   - Free tier: 30 builds/mês'
Write-Host '   - Upgrade para Production ($99/mês): ilimitado'
Write-Host '   - Comando: expo.dev/settings/billing'

Write-Host "`n5. SENTRY (Monitoramento):" -ForegroundColor Yellow
Write-Host '   - Free tier: 5k eventos/mês'
Write-Host '   - Upgrade para Team ($26/mês): 50k eventos'
Write-Host '   - Comando: sentry.io/settings/billing'

Write-Host "`n6. KEEP-ALIVE (anti spin-down):" -ForegroundColor Yellow
Write-Host '   - Workflow GitHub Actions já configurado (.github/workflows/keep-alive.yml)'
Write-Host '   - Ping a cada 10 min para Render não dormir'
Write-Host '   - Verificar: gh run list --workflow=keep-alive.yml'

Write-Host "`n=== CUSTO TOTAL ESTIMADO (SE UPGRADE TUDO) ===" -ForegroundColor Green
Write-Host 'Render Starter: $7/mês'
Write-Host 'Supabase Pro: $25/mês'
Write-Host 'Cloudflare Pages: $0'
Write-Host 'Expo Production: $99/mês (opcional)'
Write-Host 'Sentry Team: $26/mês'
Write-Host 'TOTAL: $157/mês (sem Expo) ou $256/mês (com Expo)'
