import { Injectable, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { isValidTesterCode, VALID_TESTER_CODES } from './tester-codes';

@Injectable()
export class FeedbackService implements OnModuleInit {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Feedback" (
          "id" SERIAL PRIMARY KEY,
          "testerCode" VARCHAR(20) NOT NULL,
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
        );
      `);
      this.logger.log('Tabela Feedback garantida no banco de dados (PostgreSQL/compatível).');
    } catch {
      try {
        await this.prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Feedback" (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "testerCode" TEXT NOT NULL,
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
          );
        `);
        this.logger.log('Tabela Feedback garantida no banco de dados (SQLite).');
      } catch (err) {
        this.logger.warn(`Nota na inicialização da tabela Feedback: ${(err as Error).message}`);
      }
    }
  }

  async create(dto: CreateFeedbackDto) {
    const code = (dto.testerCode || '').trim().toUpperCase();
    if (!isValidTesterCode(code)) {
      throw new BadRequestException(`Código do Tester "${dto.testerCode}" é inválido ou não cadastrado.`);
    }

    const defaultEmail = VALID_TESTER_CODES[code];

    try {
      const feedback = await this.prisma.feedback.create({
        data: {
          testerCode: code,
          nome: dto.nome?.trim() || null,
          email: dto.email?.trim() || defaultEmail || null,
          device: dto.device?.trim() || 'Desconhecido',
          androidVersion: dto.androidVersion?.trim() || null,
          appVersion: dto.appVersion?.trim() || '2.2.2',
          nps: Number(dto.nps),
          problema: dto.problema?.trim() || 'nenhum',
          descricao: dto.descricao?.trim() || null,
          screenshotDesc: dto.screenshotDesc?.trim() || null,
        },
      });

      return {
        id: feedback.id,
        protocol: `FB-${feedback.id}`,
      };
    } catch (err: any) {
      this.logger.error(`Erro ao salvar feedback via Prisma Client: ${err.message}`, err.stack);
      try {
        const result: any = await this.prisma.$queryRawUnsafe(`
          INSERT INTO "Feedback" ("testerCode", "nome", "email", "device", "androidVersion", "appVersion", "nps", "problema", "descricao", "screenshotDesc")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING "id"
        `, code, dto.nome?.trim() || null, dto.email?.trim() || defaultEmail || null, dto.device?.trim() || 'Desconhecido', dto.androidVersion?.trim() || null, dto.appVersion?.trim() || '2.2.2', Number(dto.nps), dto.problema?.trim() || 'nenhum', dto.descricao?.trim() || null, dto.screenshotDesc?.trim() || null);

        const newId = result[0]?.id || Date.now();
        return {
          id: newId,
          protocol: `FB-${newId}`,
        };
      } catch (sqlErr: any) {
        this.logger.error(`Fallback SQL também falhou: ${sqlErr.message}`);
        throw new BadRequestException('Não foi possível registrar o feedback no momento.');
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
    const porTester: Record<string, number> = {};

    for (const f of feedbacks) {
      porProblema[f.problema] = (porProblema[f.problema] || 0) + 1;
      porTester[f.testerCode] = (porTester[f.testerCode] || 0) + 1;
    }

    return {
      total,
      avgNps,
      porProblema,
      porTester,
      ultimos: feedbacks.slice(0, 10),
    };
  }

  async getExportCsv(): Promise<string> {
    const feedbacks = await this.prisma.feedback.findMany({
      orderBy: { id: 'asc' },
    });

    const header = [
      'id',
      'testerCode',
      'nome',
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
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      return [
        f.id,
        escape(f.testerCode),
        escape(f.nome),
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
