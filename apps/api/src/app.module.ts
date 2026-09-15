import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard, minutes } from '@nestjs/throttler';
import { PrismaModule } from './modules/common/prisma.module';
import { SupabaseModule } from './modules/common/supabase/supabase.module';
import { HealthController } from './modules/common/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { MatchingModule } from './modules/matching/matching.module';
import { GeoModule } from './modules/geo/geo.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { ColaModule } from './modules/cola/cola.module';
import { AdsModule } from './modules/ads/ads.module';
import { FinanceModule } from './modules/finance/finance.module';
import { PublicApiModule } from './modules/public-api/public-api.module';
import { WatchdogModule } from './modules/watchdog/watchdog.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { TseSyncModule } from './modules/candidates/tse/tse-sync.module';
import { OpsController } from './modules/common/ops.controller';
import { PagesController } from './modules/common/pages.controller';
import { OpsModeService } from './modules/common/ops-mode.service';
import { OpsModeGuard } from './modules/common/ops-mode.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: minutes(1),
        limit: 120, // 120 requisições por minuto por IP globalmente
      },
    ]),
    PrismaModule,
    SupabaseModule,
    AuthModule,
    CandidatesModule,
    MatchingModule,
    GeoModule,
    ProposalsModule,
    ColaModule,
    AdsModule,
    FinanceModule,
    PublicApiModule,
    WatchdogModule,
    ReportsModule,
    FeedbackModule,
    TseSyncModule,
  ],
  controllers: [HealthController, OpsController, PagesController],
  providers: [
    OpsModeService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OpsModeGuard,
    },
  ],
})
export class AppModule {}
