import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

let protocolCounter = 0;
function generateProtocol(): string {
  const timestamp = Date.now();
  protocolCounter = (protocolCounter + 1) % 1000000;
  const rand = Math.random().toString(36).substring(2, 6) + protocolCounter.toString(36);
  return `FB-${timestamp}-${rand}`;
}

@Injectable()
export class FeedbackService implements OnModuleInit {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // 1. PostgreSQL migrations
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Feedback" (
          "id" SERIAL PRIMARY KEY,
          "protocol" VARCHAR(60) NOT NULL UNIQUE,
          "testerName" TEXT,
          "nome" TEXT,
          "email" TEXT,
          "device" TEXT NOT NULL,
          "androidVersion" TEXT,
          "appVersion" TEXT NOT NULL,
          "nps" INTEGER NOT NULL,
          "problema" TEXT NOT NULL,
          "descricao" TEXT,
          "screenshotDesc" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch {}

    const pgMigrations = [
      `ALTER TABLE "Feedback" ADD COLUMN IF NOT EXISTS "protocol" VARCHAR(60)`,
      `ALTER TABLE "Feedback" ADD COLUMN IF NOT EXISTS "testerName" TEXT`,
      `ALTER TABLE "Feedback" ALTER COLUMN "testerCode" DROP NOT NULL`,
      `ALTER TABLE "Feedback" ALTER COLUMN "testerCode" SET DEFAULT ''`,
      `UPDATE "Feedback" SET "protocol" = 'FB-' || "id" WHERE "protocol" IS NULL`,
    ];

    for (const sql of pgMigrations) {
      try {
        await this.prisma.$executeRawUnsafe(sql);
      } catch {}
    }

    // 2. SQLite migrations
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Feedback" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT,
          "protocol" TEXT NOT NULL UNIQUE,
          "testerName" TEXT,
          "nome" TEXT,
          "email" TEXT,
          "device" TEXT NOT NULL,
          "androidVersion" TEXT,
          "appVersion" TEXT NOT NULL,
          "nps" INTEGER NOT NULL,
          "problema" TEXT NOT NULL,
          "descricao" TEXT,
          "screenshotDesc" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch {}

    const sqliteMigrations = [
      `ALTER TABLE "Feedback" ADD COLUMN "protocol" TEXT`,
      `ALTER TABLE "Feedback" ADD COLUMN "testerName" TEXT`,
    ];

    for (const sql of sqliteMigrations) {
      try {
        await this.prisma.$executeRawUnsafe(sql);
      } catch {}
    }
  }

  async create(dto: CreateFeedbackDto) {
    const protocol = generateProtocol();
    const resolvedName = dto.testerName?.trim() || dto.nome?.trim() || null;

    const reviewCta = {
      playStoreUrl: 'https://play.google.com/store/apps/details?id=eleicoes.progressistas',
      testingTrackUrl: 'https://play.google.com/apps/testing/eleicoes.progressistas',
      supportEmail: 'fmourag@gmail.com',
    };

    try {
      const feedback = await this.prisma.feedback.create({
        data: {
          protocol,
          testerName: resolvedName,
          nome: resolvedName,
          email: dto.email?.trim() || null,
          device: dto.device?.trim() || 'Desconhecido',
          androidVersion: dto.androidVersion?.trim() || null,
          appVersion: dto.appVersion?.trim() || '2.2.5',
          nps: Number(dto.nps),
          problema: dto.problema?.trim() || 'nenhum',
          descricao: dto.descricao?.trim() || null,
          screenshotDesc: dto.screenshotDesc?.trim() || null,
        },
      });

      return {
        id: feedback.id,
        protocol: feedback.protocol,
        reviewCta,
      };
    } catch (err: any) {
      this.logger.error(`Erro ao salvar feedback via Prisma Client: ${err.message}`, err.stack);

      try {
        await this.prisma.$executeRawUnsafe(`ALTER TABLE "Feedback" ALTER COLUMN "testerCode" DROP NOT NULL`);
      } catch {}

      try {
        const result: any = await this.prisma.$queryRawUnsafe(`
          INSERT INTO "Feedback" ("protocol", "testerName", "nome", "email", "device", "androidVersion", "appVersion", "nps", "problema", "descricao", "screenshotDesc")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING "id", "protocol"
        `, protocol, resolvedName, resolvedName, dto.email?.trim() || null, dto.device?.trim() || 'Desconhecido', dto.androidVersion?.trim() || null, dto.appVersion?.trim() || '2.2.5', Number(dto.nps), dto.problema?.trim() || 'nenhum', dto.descricao?.trim() || null, dto.screenshotDesc?.trim() || null);

        const newId = result[0]?.id || Date.now();
        const retProtocol = result[0]?.protocol || protocol;
        return {
          id: newId,
          protocol: retProtocol,
          reviewCta,
        };
      } catch (sqlErr: any) {
        this.logger.warn(`Tentando fallback com coluna testerCode caso ainda exista na tabela...`);
        try {
          const result: any = await this.prisma.$queryRawUnsafe(`
            INSERT INTO "Feedback" ("protocol", "testerCode", "testerName", "nome", "email", "device", "androidVersion", "appVersion", "nps", "problema", "descricao", "screenshotDesc")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING "id", "protocol"
          `, protocol, protocol, resolvedName, resolvedName, dto.email?.trim() || null, dto.device?.trim() || 'Desconhecido', dto.androidVersion?.trim() || null, dto.appVersion?.trim() || '2.2.5', Number(dto.nps), dto.problema?.trim() || 'nenhum', dto.descricao?.trim() || null, dto.screenshotDesc?.trim() || null);

          const newId = result[0]?.id || Date.now();
          const retProtocol = result[0]?.protocol || protocol;
          return {
            id: newId,
            protocol: retProtocol,
            reviewCta,
          };
        } catch (finalSqlErr: any) {
          this.logger.error(`Fallback SQL final também falhou: ${finalSqlErr.message}`);
          throw new BadRequestException('Não foi possível registrar o feedback no momento.');
        }
      }
    }
  }

  async getDashboard() {
    const feedbacks = await this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const total = feedbacks.length;
    const avgNps = total > 0
      ? Number((feedbacks.reduce((acc: number, f: any) => acc + f.nps, 0) / total).toFixed(2))
      : 0;

    const porProblema: Record<string, number> = {};

    for (const f of feedbacks) {
      porProblema[f.problema] = (porProblema[f.problema] || 0) + 1;
    }

    return {
      total,
      avgNps,
      porProblema,
      ultimos: feedbacks.slice(0, 100).map((f: any) => ({
        id: f.id,
        protocol: f.protocol,
        testerName: f.testerName || f.nome || 'Anônimo',
        email: f.email || '-',
        device: f.device || '-',
        androidVersion: f.androidVersion || '-',
        appVersion: f.appVersion || '-',
        nps: f.nps,
        problema: f.problema,
        descricao: f.descricao || '',
        screenshotDesc: f.screenshotDesc || '',
        createdAt: f.createdAt,
      })),
    };
  }

  async getExportCsv(): Promise<string> {
    const feedbacks = await this.prisma.feedback.findMany({
      orderBy: { id: 'asc' },
    });

    const header = [
      'id',
      'protocol',
      'testerName',
      'email',
      'device',
      'androidVersion',
      'appVersion',
      'nps',
      'problema',
      'descricao',
      'screenshotDesc',
      'createdAt',
    ].join(';');

    const rows = feedbacks.map((f: any) => {
      const escape = (val: any) => {
        if (val === null || val === undefined) return '""';
        let str = String(val);
        // Mitigação contra CSV Formula Injection (OWASP / CWE-1236)
        if (/^[=+\-@\t\r]/.test(str)) {
          str = "'" + str;
        }
        return `"${str.replace(/"/g, '""')}"`;
      };

      return [
        f.id,
        escape(f.protocol),
        escape(f.testerName || f.nome),
        escape(f.email),
        escape(f.device),
        escape(f.androidVersion),
        escape(f.appVersion),
        f.nps,
        escape(f.problema),
        escape(f.descricao),
        escape(f.screenshotDesc),
        escape(f.createdAt?.toISOString?.() || f.createdAt),
      ].join(';');
    });

    // UTF-8 BOM para abrir perfeitamente no Excel brasileiro
    return '\uFEFF' + [header, ...rows].join('\r\n');
  }
}
