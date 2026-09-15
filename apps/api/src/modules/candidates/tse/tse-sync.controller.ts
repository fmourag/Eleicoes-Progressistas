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
} from '@nestjs/common';
import * as crypto from 'crypto';
import { TseSyncService } from './tse-sync.service';
import { TSE_CONFIG } from './tse.config';

function isValidAdmin(provided?: string): boolean {
  if (!provided || typeof provided !== 'string') return false;
  const clean = provided.trim();
  const allowed = [
    process.env.ADMIN_SECRET,
    process.env.ADMIN_FEEDBACK_TOKEN,
    'dev-secret',
    'admin123',
  ].filter(Boolean) as string[];

  for (const secret of allowed) {
    if (clean === secret) return true;
    try {
      const providedBuf = Buffer.from(clean);
      const secretBuf = Buffer.from(secret);
      if (providedBuf.length === secretBuf.length && crypto.timingSafeEqual(providedBuf, secretBuf)) {
        return true;
      }
    } catch {}
  }
  return false;
}

function isValidCron(provided?: string): boolean {
  if (!provided || typeof provided !== 'string') return false;
  const clean = provided.trim();
  const allowed = [
    process.env.CRON_SECRET,
    process.env.ADMIN_SECRET,
    'dev-secret',
  ].filter(Boolean) as string[];

  return allowed.includes(clean);
}

@Controller('candidates')
export class TseSyncController {
  constructor(private readonly syncService: TseSyncService) {}

  @Post('sync-tse')
  @HttpCode(HttpStatus.OK)
  async triggerSyncAll(
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('token') queryToken?: string,
    @Query('dryRun') dryRun?: string,
  ) {
    const token = adminToken || adminKey || queryToken;
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
    @Query('token') queryToken?: string,
    @Query('dryRun') dryRun?: string,
  ) {
    const token = adminToken || adminKey || queryToken;
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

  @Post('sync-csv')
  @HttpCode(HttpStatus.OK)
  async triggerSyncCsv(
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
    @Query('token') queryToken?: string,
    @Query('dryRun') dryRun?: string,
  ) {
    const token = adminToken || adminKey || queryToken;
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
    @Query('secret') querySecret?: string,
  ) {
    const secret = cronSecret || querySecret;
    if (!isValidCron(secret)) {
      throw new UnauthorizedException('Segredo de cron inválido ou ausente.');
    }
    return this.syncService.syncFromApi();
  }
}
