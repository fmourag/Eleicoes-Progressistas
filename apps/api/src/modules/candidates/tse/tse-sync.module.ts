import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { TseMapperService } from './tse-mapper.service';
import { TsePhotoService } from './tse-photo.service';
import { TseSyncService } from './tse-sync.service';
import { TseSchedulerService } from './tse-scheduler.service';
import { TseSyncController } from './tse-sync.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TseSyncController],
  providers: [
    TseMapperService,
    TsePhotoService,
    TseSyncService,
    TseSchedulerService,
  ],
  exports: [TseSyncService, TseMapperService, TsePhotoService],
})
export class TseSyncModule {}
