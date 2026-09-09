import { Module } from '@nestjs/common';
import { ColaController } from './cola.controller';
import { ColaService } from './cola.service';
import { PrismaModule } from '../common/prisma.module';
import { AdsModule } from '../ads/ads.module';

@Module({
  imports: [PrismaModule, AdsModule],
  controllers: [ColaController],
  providers: [ColaService],
  exports: [ColaService],
})
export class ColaModule {}
