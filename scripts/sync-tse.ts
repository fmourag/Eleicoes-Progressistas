import { PrismaClient } from '@prisma/client';
import { TseMapperService } from '../apps/api/src/modules/candidates/tse/tse-mapper.service';
import { TsePhotoService } from '../apps/api/src/modules/candidates/tse/tse-photo.service';
import { TseSyncService } from '../apps/api/src/modules/candidates/tse/tse-sync.service';
import { TSE_CONFIG } from '../apps/api/src/modules/candidates/tse/tse.config';
import { TseSyncResult } from '../apps/api/src/modules/candidates/tse/types';

async function main() {
  const args = process.argv.slice(2);
  let targetUf: string | null = null;
  let targetCargo: number | null = null;
  let isCsv = false;
  let isDryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--uf' && args[i + 1]) {
      targetUf = args[i + 1].toUpperCase();
      i++;
    } else if (args[i] === '--cargo' && args[i + 1]) {
      targetCargo = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--csv') {
      isCsv = true;
    } else if (args[i] === '--dry-run') {
      isDryRun = true;
    }
  }

  console.log('\x1b[36m%s\x1b[0m', '=====================================================');
  console.log('\x1b[32m%s\x1b[0m', '  🇧🇷 ELEIÇÕES PROGRESSISTAS — SINCRONIZAÇÃO OFICIAL TSE');
  console.log('\x1b[36m%s\x1b[0m', '=====================================================');
  console.log(`Modo: ${isCsv ? 'Dados Abertos (CSV/ZIP)' : 'API REST DivulgaCandContas'}`);
  if (targetUf) console.log(`Filtro UF: ${targetUf}`);
  if (targetCargo) console.log(`Filtro Cargo ID: ${targetCargo}`);
  if (isDryRun) console.log('\x1b[33m%s\x1b[0m', '⚠️  Modo Dry-Run ATIVADO: Nenhuma gravação no banco será realizada.');
  console.log('-----------------------------------------------------');

  const prisma = new PrismaClient();
  const mapperService = new TseMapperService();
  const photoService = new TsePhotoService();
  const syncService = new TseSyncService(prisma as any, mapperService, photoService);

  const startTime = Date.now();

  try {
    let result: TseSyncResult;
    const ufs = targetUf ? [targetUf] : undefined;
    const cargos = targetCargo
      ? TSE_CONFIG.CARGOS.filter((c) => c.codigo === targetCargo)
      : undefined;

    if (isCsv) {
      console.log('Iniciando sincronização via Dados Abertos CSV...');
      result = await syncService.syncFromCsv(undefined, { dryRun: isDryRun });
    } else {
      console.log('Iniciando sincronização via API REST TSE...');
      result = await syncService.syncFromApi({
        ufs,
        cargos,
        dryRun: isDryRun,
      });
    }

    printSummary(result, Date.now() - startTime);
  } catch (err: any) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Erro fatal durante a sincronização: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

function printSummary(result: TseSyncResult, durationMs: number) {
  console.log('\n\x1b[32m%s\x1b[0m', '=================== RESUMO DO PROCESSAMENTO ===================');
  console.log(`⏱️  Tempo total: ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`👥 Total Processados: ${result.totalProcessed}`);
  console.log(`✨ Novos Inseridos: ${result.totalImported}`);
  console.log(`🔄 Atualizados: ${result.totalUpdated}`);
  console.log(`⏩ Excluídos (Conservadores/Outros): ${result.totalExcluded}`);
  console.log(`❌ Falhas: ${result.totalErrors}`);
  console.log(`🎯 Status Final: ${result.status.toUpperCase()} (${result.source})`);

  if (result.errors && result.errors.length > 0) {
    console.log('\n\x1b[33m%s\x1b[0m', '⚠️  Erros registrados:');
    result.errors.slice(0, 10).forEach((e) => {
      console.log(`   [${e.uf || 'N/A'}/${e.tseId || 'N/A'}] ${e.name || ''}: ${e.error}`);
    });
    if (result.errors.length > 10) {
      console.log(`   ...e mais ${result.errors.length - 10} erros nos logs.`);
    }
  }
  console.log('\x1b[32m%s\x1b[0m', '===============================================================');
}

main().catch(console.error);
