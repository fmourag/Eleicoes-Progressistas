# Como construímos o Eleições Progressistas com R$ 0 de infraestrutura

## Stack 100% free tier em produção
- API NestJS no Render (free)
- Frontend Expo Web no Cloudflare Pages (free)
- PostgreSQL no Supabase sa-east-1 (free, 500MB)
- Monitoramento Sentry (free, 5k eventos/mês)
- Builds Android no Expo EAS (free, 30 builds/mês)

## Escolhas técnicas críticas
1. **Matching stateless**: ranking em memória, zero persistência
2. **Defense-in-depth**: Throttler + Helmet + GlobalFilter + timing-safe
3. **RLS no Postgres**: policies por tabela, zero dados expostos
4. **Blackout eleitoral**: /api/ads/activation com trava até 05/10
5. **Monorepo turborepo**: shared + api + mobile + etl + matching

## Compliance TSE nativo
- Coleta Zero de dados políticos
- Memória de cálculo auditável (40/30/30)
- Blackout automático de anúncios
- Transparência de financiadores

## Resultados
336 candidatos · 27 UFs · 13 pilares · 6 motores de receita ética

Código aberto: https://github.com/fmourag/Eleicoes-Progressistas
Web: https://eleicoes-progressistas.pages.dev

#Engineering #CivicTech #FreeTier #NestJS #ReactNative
