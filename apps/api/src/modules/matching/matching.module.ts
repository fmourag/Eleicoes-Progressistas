import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { PrismaModule } from '../common/prisma.module';
import { MatchingLocalModule } from '../matching-local/matching-local.module';

@Module({
  imports: [PrismaModule, ConfigModule, MatchingLocalModule],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
