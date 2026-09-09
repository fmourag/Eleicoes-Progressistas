import { Module } from '@nestjs/common';
import { ProposalsController } from './proposals.controller';
import { ProposalTranslationService } from './proposal-translation.service';
import { ProposalsBatchCron } from './proposals-batch.cron';

@Module({
  controllers: [ProposalsController],
  providers: [ProposalTranslationService, ProposalsBatchCron],
  exports: [ProposalTranslationService],
})
export class ProposalsModule {}
