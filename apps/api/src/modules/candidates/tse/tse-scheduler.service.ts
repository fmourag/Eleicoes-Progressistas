import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TseSyncService } from './tse-sync.service';

@Injectable()
export class TseSchedulerService {
  private readonly logger = new Logger(TseSchedulerService.name);

  constructor(private readonly syncService: TseSyncService) {}

  // Agendamento diário de candidatos às 03:00 BRT (06:00 UTC)
  @Cron('0 6 * * *')
  async runDailySync() {
    this.logger.log('⏰ Disparando rotina agendada diária de sincronização TSE (03:00 BRT)...');
    try {
      const result = await this.syncService.syncFromApi();
      this.logger.log(
        `✅ Sincronização diária concluída: ${result.totalProcessed} processados, ${result.totalImported} novos, ${result.totalUpdated} atualizados, ${result.totalExcluded} excluídos.`,
      );
    } catch (err: any) {
      this.logger.error(`❌ Falha na rotina de sincronização diária: ${err.message}`, err.stack);
    }
  }

  // Agendamento noturno de fotos às 05:00 BRT (08:00 UTC) com teto de 2.000
  @Cron('0 8 * * *')
  async runNightlyPhotoSync() {
    this.logger.log('⏰ Disparando job noturno de cache de fotos TSE (05:00 BRT, max 2.000 fotos)...');
    try {
      const result = await this.syncService.syncPhotosOnly(2000);
      this.logger.log(
        `✅ Job noturno de fotos concluído: ${result.totalUpdated} fotos cacheadas com sucesso.`,
      );
    } catch (err: any) {
      this.logger.error(`❌ Falha no job noturno de fotos: ${err.message}`, err.stack);
    }
  }
}
