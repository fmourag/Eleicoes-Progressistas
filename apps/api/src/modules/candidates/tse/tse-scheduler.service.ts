import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TseSyncService } from './tse-sync.service';

@Injectable()
export class TseSchedulerService {
  private readonly logger = new Logger(TseSchedulerService.name);

  constructor(private readonly syncService: TseSyncService) {}

  // Agendamento diário às 03:00 BRT (06:00 UTC)
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
}
