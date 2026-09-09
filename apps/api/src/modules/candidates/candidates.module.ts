import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { TseCandidatesService } from './tse-candidates.service';

@Module({
  controllers: [CandidatesController],
  providers: [CandidatesService, TseCandidatesService],
  exports: [CandidatesService, TseCandidatesService],
})
export class CandidatesModule {}
