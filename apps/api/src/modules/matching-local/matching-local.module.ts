import { Module } from '@nestjs/common';
import { MatchingLocalService } from './matching-local.service';

@Module({
  providers: [MatchingLocalService],
  exports: [MatchingLocalService],
})
export class MatchingLocalModule {}
