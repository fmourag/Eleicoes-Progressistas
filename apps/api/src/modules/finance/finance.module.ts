import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PrismaModule } from '../common/prisma.module';
import { OpsModeService } from '../common/ops-mode.service';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceController],
  providers: [FinanceService, OpsModeService],
  exports: [FinanceService],
})
export class FinanceModule {}
