# Relatório Oficial de Auditoria e Reconciliação Nacional TSE 2026

**Data da Reconciliação:** 2026-09-15T18:09:03.562Z  
**Referência Oficial (Ground Truth):** TSE Dados Abertos 2026 (`consulta_cand_2026`) de 14/09/2026  
**Total de Candidaturas Oficiais Titulares no TSE:** 20046  
**Total de Candidatos Ativos em Produção (`visible: true`):** 4877  
**Total de Registros em Quarentena (`visible: false`):** 2379  
**Divergências Ativas Restantes:** 0

---

## 1. Status de Conformidade por Categoria

| Categoria | Descrição | Status no App | Total |
|---|---|:---:|:---:|
| **A_PHANTOM** | Candidatos inexistentes no TSE 2026 oficial | ✅ 0 Ativos | 0 |
| **B_MISSING** | Candidatos progressistas aptos do TSE ausentes | ✅ 0 Ausentes | 0 |
| **C_MISMATCH** | Inconsistência de Número, Cargo ou Partido | ✅ 0 Mismatches | 0 |
| **D_VICE_WRONG** | Vices divergentes da coligação TSE (`SQ_COLIGACAO`) | ✅ 0 Incorretos | 0 |
| **E_STALE_YEAR** | Resquícios de 2022 ou anos obsoletos | ✅ 0 Obsoletos | 0 |
| **F_OVERWRITE** | Conflito de escritores concorrentes | ✅ Resolvido (Escritor Único) | 0 |
| **G_STATIC_STALE** | Desalinhamento entre Static Archive e Banco | ✅ Sincronizado (4.877 registros) | 0 |
| **QUARANTINE** | Registros legados/não-progressistas preservados com trilha | 🛡️ Preservado s/ hard-delete | 2379 |

---

## 2. Spot-Check RJ — Validação Estrita contra Extrato 14/09/2026

### 2.1 Governador do Rio de Janeiro (Exatamente 4 Candidatos Oficiais)
* **WILLIAM SIRI** (PSOL 50) — **Vice Oficial:** JULIANA CARVALHO
* **CYRO GARCIA** (PSTU 16) — **Vice Oficial:** PERCILIANA
* **JULIETE** (UP 80) — **Vice Oficial:** BIA MARTINS
* **LUAN MONTEIRO** (PCO 29) — **Vice Oficial:** CAETANO ALBUQUERQUE

* **Status Rodrigo Neves:** Ocultado em quarentena (`visible: false`).
* **Status Eduardo Paes:** Ocultado (`visible: false`, não pertencente ao roll progressista).

### 2.2 Senador do Rio de Janeiro (Exatamente 6 Candidatos Oficiais)
* **BENEDITA DA SILVA** (PT 131)
* **MONICA BENICIO** (PSOL 500)
* **PAULA FALCÃO** (PSTU 160)
* **LUIZ EUGENIO** (PCO 290)
* **VINICIUS BENEVIDES** (UP 808)
* **MICHELLY XAVIER** (UP 800)

---

## 3. Integridade do Pipeline e Arquitetura de Produção

1. **Escritor Único:** Todos os syncs concorrentes legados (`seed.ts`, `sync-real-candidates.ts`) foram bloqueados por guarda de segurança (`ALLOW_LEGACY_SYNC !== 'true'`).
2. **Eliminação do Fallback 2022:** O ID residual `2040602022` foi removido de `@np/shared` e do pipeline de fotos.
3. **Persistência de Metadados Oficiais:** Colunas `rawTseData`, `source`, `tseValidated` e `visible` adicionadas ao banco de dados via Prisma Push.
4. **Static Archive Regenerado:** Arquivo `dist-archive/candidates-2026.json` gerado com os 4.877 candidatos validados e hash SHA-256 no `manifest.json`.
