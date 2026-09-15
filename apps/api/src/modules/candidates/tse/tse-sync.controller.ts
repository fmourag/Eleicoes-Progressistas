import {
  Controller,
  Post,
  Get,
  Param,
  Headers,
  Query,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { TseSyncService } from './tse-sync.service';
import { TSE_CONFIG } from './tse.config';

function isValidAdmin(provided?: string): boolean {
  if (!provided || typeof provided !== 'string') return false;
  const allowed = [process.env.ADMIN_SECRET, process.env.ADMIN_FEEDBACK_TOKEN].filter(Boolean) as string[];
  if (allowed.length === 0) return false; // FAIL-CLOSED: sem secrets configurados, ninguém administra
  const clean = provided.trim();
  return allowed.some((secret) => {
    const a = Buffer.from(clean);
    const b = Buffer.from(secret);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

function isValidCron(provided?: string): boolean {
  if (!provided || typeof provided !== 'string') return false;
  const allowed = [process.env.CRON_SECRET, process.env.ADMIN_SECRET].filter(Boolean) as string[];
  if (allowed.length === 0) return false;
  return allowed.includes(provided.trim());
}

@Controller('candidates')
export class TseSyncController implements OnModuleInit {
  private readonly logger = new Logger(TseSyncController.name);

  constructor(private readonly syncService: TseSyncService) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SECRET) {
      this.logger.error(
        'ADMIN_SECRET ausente: endpoints de sync permanecerão bloqueados (fail-closed)',
      );
    }
  }

  @Post('sync-tse')
  @HttpCode(HttpStatus.OK)
  async triggerSyncAll(
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('dryRun') dryRun?: string,
  ) {
    const token = adminToken || adminKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }
    return this.syncService.syncFromApi({ dryRun: dryRun === 'true' });
  }

  @Post('sync-tse/uf/:uf/cargo/:cargoId')
  @HttpCode(HttpStatus.OK)
  async triggerSyncUfCargo(
    @Param('uf') uf: string,
    @Param('cargoId') cargoId: string,
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('dryRun') dryRun?: string,
  ) {
    const token = adminToken || adminKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }
    const code = parseInt(cargoId, 10);
    const cargo = TSE_CONFIG.CARGOS.filter((c) => c.codigo === code);
    return this.syncService.syncFromApi({
      ufs: [uf.toUpperCase()],
      cargos: cargo.length > 0 ? cargo : undefined,
      dryRun: dryRun === 'true',
    });
  }

  @Post('sync-photos')
  @HttpCode(HttpStatus.OK)
  async triggerSyncPhotos(
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('limit') limitStr?: string,
  ) {
    const token = adminToken || adminKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }
    const parsedLimit = limitStr ? parseInt(limitStr, 10) : 2000;
    const safeLimit = isNaN(parsedLimit) ? 2000 : Math.max(1, Math.min(parsedLimit, 2000));
    return this.syncService.syncPhotosOnly(safeLimit);
  }

  @Post('sync-csv')
  @HttpCode(HttpStatus.OK)
  async triggerSyncCsv(
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('dryRun') dryRun?: string,
  ) {
    const token = adminToken || adminKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }
    return this.syncService.syncFromCsv(undefined, { dryRun: dryRun === 'true' });
  }

  @Get('sync-stats')
  async getSyncStats() {
    return this.syncService.getSyncStats();
  }

  @Get('sync-logs')
  async getSyncLogs() {
    return {
      logs: this.syncService.getLogs(),
    };
  }

  @Post('sync-scheduled')
  @HttpCode(HttpStatus.OK)
  async triggerScheduledSync(
    @Headers('x-cron-secret') cronSecret?: string,
  ) {
    if (!isValidCron(cronSecret)) {
      throw new UnauthorizedException('Segredo de cron inválido ou ausente.');
    }
    return this.syncService.syncFromApi();
  }
}
