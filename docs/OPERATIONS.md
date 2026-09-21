# Operações — Eleições Progressistas v2.2.12

## 🚀 Comandos Rápidos

### Health Check (one-shot)
```powershell
.\scripts\quick-health.ps1
```

### Monitoramento Contínuo (a cada 5 min)
```powershell
.\scripts\health-monitor.ps1
```

### Validação de Feedback e Play Store Compliance
```powershell
npm run test:feedback
```

### Coletar Feedback de Tester
```powershell
.\scripts\collect-feedback.ps1
```

### Hotfix Rápido
```powershell
.\scripts\hotfix-template.ps1 -IssueNumber 123 -Description "Fix matching crash"
```

### Rollback de Emergência
```powershell
.\scripts\rollback.ps1 -CommitHash abc123
```

### Escala de Emergência (pico de tráfego)
```powershell
.\scripts\emergency-scale.ps1
```

---

## 🔗 Links Críticos

| Serviço | URL |
|---|---|
| Web App | https://eleicoes-progressistas.pages.dev |
| API Backend | https://eleicoes-progressistas.onrender.com |
| Beta Sideload APK | https://eleicoes-progressistas.onrender.com/beta |
| Feedback Cívico | https://eleicoes-progressistas.onrender.com/feedback |
| Dashboard Feedbacks | https://eleicoes-progressistas.onrender.com/feedback/dashboard |
| Supabase | https://supabase.com/dashboard/project/zsrjpitpyhsmsxerzxzc |
| Render | https://dashboard.render.com |
| Cloudflare | https://dash.cloudflare.com |
| GitHub | https://github.com/fmourag/Eleicoes-Progressistas |
| Play Console | https://play.google.com/console |
| Play Store Testing Track | https://play.google.com/apps/testing/com.eleicoesprogressistas.app |
| EAS Builds | https://expo.dev/accounts/fmourag/projects/eleicoes-progressistas/builds |

---

## 🛡️ Plano de Contingência

### Se API cair (5xx)
1. Verificar logs no Render: Dashboard → Logs
2. Checar Supabase: Dashboard → Logs → Postgres
3. Se necessário, restart manual: Render → Manual Deploy → Deploy latest commit

### Se pico de tráfego (1º turno 04/10)
1. Executar: `.\scripts\emergency-scale.ps1`
2. Upgrade Render para Starter ($7/mês)
3. Upgrade Supabase para Pro ($25/mês)
4. Monitorar Sentry a cada 15 min

### Se bug crítico reportado
1. Executar: `.\scripts\hotfix-template.ps1 -IssueNumber XXX -Description "..."`
2. Corrigir, commit, push, PR, merge
3. Deploy automático no Render (~3 min)
4. Validar: `.\scripts\quick-health.ps1`

---

## 📞 Contatos de Emergência
- Supabase Support: https://supabase.com/docs/guides/getting-started/support
- Render Support: https://render.com/support
- Cloudflare Support: https://support.cloudflare.com
