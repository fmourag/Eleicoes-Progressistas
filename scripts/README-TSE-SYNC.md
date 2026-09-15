# 🚀 Guia Rápido — Sincronização TSE

### Executar sincronização local:
\\\powershell
# Todas as UFs e cargos:
npx tsx scripts/sync-tse.ts

# Apenas 1 Estado / Cargo:
npx tsx scripts/sync-tse.ts --uf RJ --cargo 3   # Governador RJ
npx tsx scripts/sync-tse.ts --uf SP --cargo 6   # Deputados Federais SP
npx tsx scripts/sync-tse.ts --uf DF --cargo 8   # Deputados Distritais DF
\\\

### Códigos de Cargo no TSE:
- \1\: Presidente
- \3\: Governador
- \5\: Senador
- \6\: Deputado Federal
- \7\: Deputado Estadual
- \8\: Deputado Distrital
