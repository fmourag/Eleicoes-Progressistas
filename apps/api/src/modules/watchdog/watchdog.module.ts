import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { WatchdogService } from './watchdog.service';
import { WatchdogSyncService } from './watchdog-sync.service';
import { WatchdogController } from './watchdog.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WatchdogController],
  providers: [WatchdogService, WatchdogSyncService],
  exports: [WatchdogService, WatchdogSyncService],
})
export class WatchdogModule {}
