import { Controller, Get , Inject } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Controller('health')
export class HealthController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Get()
  async check() {
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
    return {
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbOk ? 'connected' : 'disconnected',
    };
  }
}
