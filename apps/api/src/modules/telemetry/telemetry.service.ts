import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface DashboardSummary {
  totalWebVisits: number;
  todayWebVisits: number;
  weekWebVisits: number;
  totalApkDownloads: number;
  todayApkDownloads: number;
  weekApkDownloads: number;
  totalShares: number;
  todayShares: number;
  conversionRate: string;
}

export interface DailyMetric {
  date: string;
  webVisits: number;
  apkDownloads: number;
  shares: number;
}

export interface TelemetryDashboardData {
  summary: DashboardSummary;
  deviceBreakdown: { device: string; count: number; percentage: string }[];
  shareBreakdown: { channel: string; count: number }[];
  dailyHistory: DailyMetric[];
  generatedAt: string;
}

@Injectable()
export class TelemetryService implements OnModuleInit {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // 1. PostgreSQL setup
    try {
      await (this.prisma as any).$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AccessMetric" (
          "id" SERIAL PRIMARY KEY,
          "eventType" VARCHAR(40) NOT NULL,
          "deviceType" VARCHAR(20) NOT NULL DEFAULT 'unknown',
          "referrer" VARCHAR(120),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await (this.prisma as any).$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "idx_access_metric_event_date" 
        ON "AccessMetric" ("eventType", "createdAt")
      `);
    } catch {
      // 2. SQLite setup fallback
      try {
        await (this.prisma as any).$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "AccessMetric" (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "eventType" TEXT NOT NULL,
            "deviceType" TEXT NOT NULL DEFAULT 'unknown',
            "referrer" TEXT,
            "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (err: any) {
        this.logger.warn(`Erro ao inicializar tabela AccessMetric: ${err?.message}`);
      }
    }
  }

  detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  async recordEvent(eventType: string, deviceType = 'unknown', referrer?: string): Promise<void> {
    try {
      const sanitizedEvent = (eventType || 'WEB_VISIT').substring(0, 40);
      const sanitizedDevice = (deviceType || 'unknown').substring(0, 20);
      const sanitizedRef = referrer ? referrer.substring(0, 120) : null;

      await (this.prisma as any).$executeRawUnsafe(
        'INSERT INTO "AccessMetric" ("eventType", "deviceType", "referrer", "createdAt") VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        sanitizedEvent,
        sanitizedDevice,
        sanitizedRef,
      );
    } catch {
      // SQLite syntax fallback ($1 -> ?)
      try {
        await (this.prisma as any).$executeRawUnsafe(
          'INSERT INTO "AccessMetric" ("eventType", "deviceType", "referrer") VALUES (?, ?, ?)',
          eventType,
          deviceType,
          referrer || null,
        );
      } catch (err: any) {
        this.logger.error(`Falha ao registrar métrica de acesso (${eventType}): ${err?.message}`);
      }
    }
  }

  async getDashboardData(days = 30): Promise<TelemetryDashboardData> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    let rows: any[] = [];
    try {
      rows = (await (this.prisma as any).$queryRawUnsafe(
        'SELECT "eventType", "deviceType", "createdAt" FROM "AccessMetric" WHERE "createdAt" >= $1 ORDER BY "createdAt" ASC',
        startDate,
      )) as any[];
    } catch {
      try {
        rows = (await (this.prisma as any).$queryRawUnsafe(
          'SELECT "eventType", "deviceType", "createdAt" FROM "AccessMetric" WHERE "createdAt" >= ? ORDER BY "createdAt" ASC',
          startDate.toISOString(),
        )) as any[];
      } catch {
        rows = [];
      }
    }

    let totalWebVisits = 0;
    let todayWebVisits = 0;
    let weekWebVisits = 0;

    let totalApkDownloads = 0;
    let todayApkDownloads = 0;
    let weekApkDownloads = 0;

    let totalShares = 0;
    let todayShares = 0;

    const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
    const shareCounts: Record<string, number> = { whatsapp: 0, email: 0, copy: 0, other: 0 };

    // Agrupamento diário
    const dailyMap = new Map<string, { webVisits: number; apkDownloads: number; shares: number }>();

    // Inicializa todos os dias do período
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap.set(dateKey, { webVisits: 0, apkDownloads: 0, shares: 0 });
    }

    for (const row of rows) {
      const rowDate = new Date(row.createdAt);
      const dateKey = rowDate.toISOString().split('T')[0];
      const isToday = rowDate >= startOfToday;
      const isThisWeek = rowDate >= sevenDaysAgo;
      const entry = dailyMap.get(dateKey) || { webVisits: 0, apkDownloads: 0, shares: 0 };

      const event = row.eventType;
      const device = (row.deviceType || 'unknown').toLowerCase();
      if (deviceCounts[device] !== undefined) {
        deviceCounts[device]++;
      } else {
        deviceCounts.unknown = (deviceCounts.unknown || 0) + 1;
      }

      if (event === 'WEB_VISIT') {
        totalWebVisits++;
        entry.webVisits++;
        if (isToday) todayWebVisits++;
        if (isThisWeek) weekWebVisits++;
      } else if (event === 'APK_DOWNLOAD') {
        totalApkDownloads++;
        entry.apkDownloads++;
        if (isToday) todayApkDownloads++;
        if (isThisWeek) weekApkDownloads++;
      } else if (event.startsWith('SHARE_')) {
        totalShares++;
        entry.shares++;
        if (isToday) todayShares++;
        const channel = event.replace('SHARE_', '').toLowerCase();
        if (shareCounts[channel] !== undefined) {
          shareCounts[channel]++;
        } else {
          shareCounts.other++;
        }
      }

      dailyMap.set(dateKey, entry);
    }

    const totalEvents = totalWebVisits + totalApkDownloads;
    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        count,
        percentage: totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(1) + '%' : '0%',
      }))
      .filter((d) => d.count > 0 || d.device !== 'unknown');

    const shareBreakdown = Object.entries(shareCounts).map(([channel, count]) => ({
      channel,
      count,
    }));

    const dailyHistory: DailyMetric[] = Array.from(dailyMap.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    const conversionRate =
      totalWebVisits > 0
        ? ((totalApkDownloads / totalWebVisits) * 100).toFixed(1) + '%'
        : '0%';

    return {
      summary: {
        totalWebVisits,
        todayWebVisits,
        weekWebVisits,
        totalApkDownloads,
        todayApkDownloads,
        weekApkDownloads,
        totalShares,
        todayShares,
        conversionRate,
      },
      deviceBreakdown,
      shareBreakdown,
      dailyHistory,
      generatedAt: new Date().toISOString(),
    };
  }
}
