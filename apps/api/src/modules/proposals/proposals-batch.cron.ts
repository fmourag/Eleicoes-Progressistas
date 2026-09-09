import { Injectable, Logger , Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProposalTranslationService } from './proposal-translation.service';

@Injectable()
export class ProposalsBatchCron {
  private readonly logger = new Logger(ProposalsBatchCron.name);

  constructor(@Inject(ProposalTranslationService) private readonly translationService: ProposalTranslationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleNightlyBatchTranslation() {
    this.logger.log('⏰ Executando Cron Job Noturno de Tradução de Propostas (03:00 AM)...');
    try {
      const stats = await this.translationService.processNightlyBatch();
      this.logger.log(
        `✅ Cron Job Noturno finalizado. Processadas: ${stats.processed}, Traduzidas: ${stats.translated}, Falhas: ${stats.failed}`,
      );
    } catch (err) {
      this.logger.error(`❌ Erro no Cron Job Noturno: ${(err as Error).message}`);
    }
  }
}
