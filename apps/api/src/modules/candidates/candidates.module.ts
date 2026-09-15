import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { TseCandidatesService } from './tse-candidates.service';
import { TseSyncModule } from './tse/tse-sync.module';

@Module({
  imports: [TseSyncModule],
  controllers: [CandidatesController],
  providers: [CandidatesService, TseCandidatesService],
  exports: [CandidatesService, TseCandidatesService, TseSyncModule],
})
export class CandidatesModule {}
