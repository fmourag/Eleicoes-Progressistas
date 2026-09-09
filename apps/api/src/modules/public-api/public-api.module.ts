import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { PublicApiService } from './public-api.service';
import { PublicKeysController } from './public-keys.controller';
import { PublicV1Controller } from './public-v1.controller';
import { PublicApiKeyGuard } from './guards/public-api-key.guard';
import { TierPaidGuard } from './guards/tier-paid.guard';
import { OpsModeService } from '../common/ops-mode.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicKeysController, PublicV1Controller],
  providers: [
    PublicApiService,
    PublicApiKeyGuard,
    TierPaidGuard,
    OpsModeService,
  ],
  exports: [PublicApiService, PublicApiKeyGuard],
})
export class PublicApiModule {}
