import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { TseMapperService } from './tse-mapper.service';
import { TsePhotoService } from './tse-photo.service';
import { TseSyncService } from './tse-sync.service';
import { TseSchedulerService } from './tse-scheduler.service';
import { TseSyncController } from './tse-sync.controller';
import { TsePhotoPrefetchService } from './tse-photo-prefetch.service';

@Module({
  imports: [PrismaModule],
  controllers: [TseSyncController],
  providers: [
    TseMapperService,
    TsePhotoService,
    TseSyncService,
    TseSchedulerService,
    TsePhotoPrefetchService,
  ],
  exports: [TseSyncService, TseMapperService, TsePhotoService, TsePhotoPrefetchService],
})
export class TseSyncModule {}
