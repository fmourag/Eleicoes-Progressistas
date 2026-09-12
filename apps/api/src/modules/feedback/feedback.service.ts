import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { isValidTesterCode, VALID_TESTER_CODES } from './tester-codes';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto) {
    const code = (dto.testerCode || '').trim().toUpperCase();
    if (!isValidTesterCode(code)) {
      throw new BadRequestException(`Código do Tester "${dto.testerCode}" é inválido ou não cadastrado.`);
    }

    const defaultEmail = VALID_TESTER_CODES[code];

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
