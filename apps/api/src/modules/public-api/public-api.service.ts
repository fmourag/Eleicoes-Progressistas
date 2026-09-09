import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ApiKey, ApiKeyTier } from '@prisma/client';
import { CreatePublicKeyDto } from './dto/create-public-key.dto';
import { AdminCreateKeyDto } from './dto/admin-create-key.dto';
import { QueryPublicCandidatesDto } from './dto/query-candidates.dto';
import * as crypto from 'crypto';

export const PUBLIC_PILLARS = [
  { id: 'p1', label: 'Bem-Estar & Assistência Social', icon: '🏥', description: 'Garantia de segurança alimentar, saneamento básico, habitação popular digna e assistência social integrada.' },
  { id: 'p2', label: 'Justiça Social & Direitos Humanos', icon: '⚖️', description: 'Combate às desigualdades de gênero, raça e defesa intransigente dos direitos civis.' },
  { id: 'p3', label: 'Desenvolvimento Sustentável & Meio Ambiente', icon: '🌿', description: 'Transição energética verde, combate ao desmatamento e justiça climática.' },
  { id: 'p4', label: 'Soberania & Valores Nacionais', icon: '🇧🇷', description: 'Defesa das riquezas estratégicas, fomento à cultura nacional e política externa altiva.' },
  { id: 'p5', label: 'Reindustrialização & Tecnologia', icon: '🏭', description: 'Nova Indústria Brasil, inovação tecnológica sustentável e geração de empregos qualificados.' },
  { id: 'p6', label: 'Distribuição Justa de Renda & Tributação Progressiva', icon: '💰', description: 'Tributação de grandes fortunas, valorização do salário mínimo e combate à pobreza.' },
  { id: 'p7', label: 'Proteção do Vulnerável & Comunidades Tradicionais', icon: '🛡️', description: 'Segurança alimentar, inclusão de PcD, idosos, quilombolas e povos originários.' },
  { id: 'p8', label: 'Governo Eficiente & Transparência', icon: '📊', description: 'Fiscalização republicana, controle social dos gastos e extinção de privilégios.' },
  { id: 'p9', label: 'Saúde Integral, Universal & Fortalecimento do SUS', icon: '🩺', description: 'Acesso universal gratuito, saúde da família, valorização dos profissionais da saúde e ampliação da rede de atenção básica.' },
  { id: 'p10', label: 'Segurança Cidadã, Direitos & Inteligência Policial', icon: '🚨', description: 'Inteligência contra o crime organizado, desmilitarização progressiva, respeito aos direitos humanos e prevenção social nas periferias.' },
  { id: 'p11', label: 'Educação Pública Emancipatória & Valorização Docente', icon: '📚', description: 'Melhoria na qualidade do ensino através de maior investimento financeiro em escolas públicas, bolsas e valorização docente.' },
  { id: 'p12', label: 'Trabalho Digno, Renda & Seguridade Trabalhista', icon: '👷', description: 'Valorização do trabalho formal, defesa dos direitos trabalhistas, combate à precarização, segurança jurídica nas relações laborais e qualificação profissional.' },
  { id: 'p13', label: 'Economia Popular, Solidária & Microcrédito Produtivo', icon: '🤝', description: 'Incentivo aos microempreendedores individuais, desoneração fiscal orientada ao investimento e geração de empregos, desburocratização e microcrédito orientado.' },
];

// Registro em memória de downloads diários de CSV para evitar sobrecarga de banco
const csvDownloadTracker = new Map<string, number>();

@Injectable()
export class PublicApiService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // Gestão de Chaves
  // ─────────────────────────────────────────────────────────

  async createSelfServeKey(dto: CreatePublicKeyDto) {
    // Honeypot check
    if (dto.website) {
      return {
        key: `pk_free_${crypto.randomBytes(24).toString('hex')}`,
        tier: 'FREE',
        dailyLimit: 1000,
        message: 'Guarde esta chave em local seguro. Ela não será exibida novamente.',
      };
    }

    const plainKey = `pk_free_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');

    await this.prisma.apiKey.create({
      data: {
        keyHash,
        tier: ApiKeyTier.FREE,
        contactEmail: dto.contactEmail,
        purpose: dto.purpose,
        dailyLimit: 1000,
        isActive: true,
      },
    });

    return {
      key: plainKey,
      tier: 'FREE',
      dailyLimit: 1000,
      message: 'Guarde esta chave em local seguro. Ela não será exibida novamente.',
    };
  }

  async adminCreateKey(dto: AdminCreateKeyDto) {
    const tier = dto.tier || ApiKeyTier.PAID;
    const prefix = tier === ApiKeyTier.PAID ? 'pk_paid_' : 'pk_free_';
    const plainKey = `${prefix}${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');
    const dailyLimit = dto.dailyLimit || (tier === ApiKeyTier.PAID ? 10000 : 1000);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        keyHash,
        tier,
        contactEmail: dto.contactEmail,
        purpose: dto.purpose,
        dailyLimit,
        isActive: true,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return {
      key: plainKey,
      id: apiKey.id,
      tier: apiKey.tier,
      dailyLimit: apiKey.dailyLimit,
      contactEmail: apiKey.contactEmail,
      expiresAt: apiKey.expiresAt,
    };
  }

  async adminListKeys() {
    const keys = await this.prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tier: true,
        contactEmail: true,
        purpose: true,
        dailyLimit: true,
        usageCount: true,
        usageResetAt: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Mascara parcialmente os e-mails para proteção em relatórios de auditoria
    return keys.map((k) => {
      let maskedEmail = k.contactEmail || null;
      if (maskedEmail && maskedEmail.includes('@')) {
        const [user, domain] = maskedEmail.split('@');
        maskedEmail = `${user.slice(0, 2)}***@${domain}`;
      }
      return {
        ...k,
        contactEmail: maskedEmail,
      };
    });
  }

  async adminRevokeKey(id: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      throw new HttpException('Chave de API não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        tier: true,
        isActive: true,
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // Endpoints Públicos — Tier FREE & PAID
  // ─────────────────────────────────────────────────────────

  getPillars() {
    return PUBLIC_PILLARS;
  }

  async getCandidates(query: QueryPublicCandidatesDto) {
    const where: any = {};

    if (query.state) {
      where.state = query.state.toUpperCase();
    }
    if (query.cargo) {
      where.cargo = query.cargo.toUpperCase();
    }
    if (query.party) {
      where.party = query.party.toUpperCase();
    }
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s } },
        { numeroUrna: { contains: s } },
      ];
    }

    const take = Math.min(query.limit || 20, 100);
    const skip = query.offset || 0;

    const [total, candidates] = await Promise.all([
      this.prisma.candidate.count({ where }),
      this.prisma.candidate.findMany({
        where,
        take,
        skip,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          tseId: true,
          electionYear: true,
          name: true,
          socialName: true,
          viceName: true,
          party: true,
          partyNumber: true,
          numeroUrna: true,
          cargo: true,
          level: true,
          candidaturaStatus: true,
          municipality: true,
          state: true,
          photoUrl: true,
          fichaLimpa: true,
          profileScores: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      total,
      limit: take,
      offset: skip,
      items: candidates,
    };
  }

  async getCandidateById(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      select: {
        id: true,
        tseId: true,
        electionYear: true,
        name: true,
        socialName: true,
        viceName: true,
        party: true,
        partyNumber: true,
        numeroUrna: true,
        cargo: true,
        level: true,
        candidaturaStatus: true,
        municipality: true,
        state: true,
        photoUrl: true,
        fichaLimpa: true,
        governmentPlanUrl: true,
        governmentPlanSummary: true,
        profileScores: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!candidate) {
      throw new HttpException('Candidato não encontrado', HttpStatus.NOT_FOUND);
    }

    return candidate;
  }

  async getCandidateProposals(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!candidate) {
      throw new HttpException('Candidato não encontrado', HttpStatus.NOT_FOUND);
    }

    const proposals = await this.prisma.proposal.findMany({
      where: { candidateId: id },
      select: {
        id: true,
        pillar: true,
        title: true,
        description: true,
        translatedText: true,
        source: true,
        version: true,
      },
      orderBy: { pillar: 'asc' },
    });

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      totalProposals: proposals.length,
      proposals,
    };
  }

  async getStatsAggregate() {
    const candidates = await this.prisma.candidate.findMany({
      select: {
        cargo: true,
        state: true,
        party: true,
        profileScores: true,
      },
    });

    const byCargo: Record<string, number> = {};
    const byState: Record<string, number> = {};
    const byParty: Record<string, number> = {};
    const pillarTotals: Record<string, { sum: number; count: number }> = {};

    for (let i = 1; i <= 13; i++) {
      pillarTotals[`p${i}`] = { sum: 0, count: 0 };
    }

    for (const c of candidates) {
      byCargo[c.cargo] = (byCargo[c.cargo] || 0) + 1;
      if (c.state) byState[c.state] = (byState[c.state] || 0) + 1;
      if (c.party) byParty[c.party] = (byParty[c.party] || 0) + 1;

      if (c.profileScores && typeof c.profileScores === 'object') {
        const scores = c.profileScores as Record<string, number>;
        for (let i = 1; i <= 13; i++) {
          const key = `p${i}`;
          if (typeof scores[key] === 'number') {
            pillarTotals[key].sum += scores[key];
            pillarTotals[key].count += 1;
          }
        }
      }
    }

    const averagePillarCommitment: Record<string, number> = {};
    for (let i = 1; i <= 13; i++) {
      const key = `p${i}`;
      const entry = pillarTotals[key];
      averagePillarCommitment[key] = entry.count > 0 ? Number((entry.sum / entry.count).toFixed(2)) : 0;
    }

    return {
      totalCandidates: candidates.length,
      byCargo,
      byState,
      byParty,
      averagePillarCommitment,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Endpoints Exclusivos — Tier PAID
  // ─────────────────────────────────────────────────────────

  async getCandidateVotingHistory(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        party: true,
        cargo: true,
        votingHistory: true,
      },
    });

    if (!candidate) {
      throw new HttpException('Candidato não encontrado', HttpStatus.NOT_FOUND);
    }

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      party: candidate.party,
      cargo: candidate.cargo,
      votingHistory: candidate.votingHistory || [],
    };
  }

  async getCandidateIntegrity(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        fichaLimpa: true,
      },
    });

    if (!candidate) {
      throw new HttpException('Candidato não encontrado', HttpStatus.NOT_FOUND);
    }

    const flags = await this.prisma.integrityFlag.findMany({
      where: { candidateId: id },
      select: {
        id: true,
        source: true,
        flagType: true,
        description: true,
        severity: true,
        date: true,
        resolved: true,
        referenceUrl: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      fichaLimpa: candidate.fichaLimpa,
      totalFlags: flags.length,
      flags,
    };
  }

  async getAnalyticsPillarGap() {
    const candidates = await this.prisma.candidate.findMany({
      select: {
        party: true,
        cargo: true,
        profileScores: true,
      },
    });

    const pillarAverages: Record<string, { sum: number; count: number }> = {};
    for (let i = 1; i <= 13; i++) {
      pillarAverages[`p${i}`] = { sum: 0, count: 0 };
    }

    for (const c of candidates) {
      if (c.profileScores && typeof c.profileScores === 'object') {
        const scores = c.profileScores as Record<string, number>;
        for (let i = 1; i <= 13; i++) {
          const key = `p${i}`;
          if (typeof scores[key] === 'number') {
            pillarAverages[key].sum += scores[key];
            pillarAverages[key].count += 1;
          }
        }
      }
    }

    // Benchmark de prioridades republicanas ideais (distribuição ponderada uniforme de 70.0)
    const idealBaseline = 70.0;
    const gapAnalysis = PUBLIC_PILLARS.map((p) => {
      const entry = pillarAverages[p.id];
      const candidateAvg = entry && entry.count > 0 ? Number((entry.sum / entry.count).toFixed(2)) : 0;
      const gap = Number((candidateAvg - idealBaseline).toFixed(2));
      return {
        pillar: p.id,
        label: p.label,
        candidateSupplyAverage: candidateAvg,
        republicanBenchmark: idealBaseline,
        netGap: gap,
        classification: gap >= 0 ? 'SUPRIDO' : 'DEFICIT_DE_OFERTA',
      };
    });

    return {
      title: 'Gap Analysis: Oferta Parlamentar x Matriz Republicana',
      analyzedCandidates: candidates.length,
      baselineScore: idealBaseline,
      gapAnalysis,
    };
  }

  async exportCandidatesCsv(apiKeyId: string): Promise<string> {
    const now = Date.now();
    const lastDownload = csvDownloadTracker.get(apiKeyId);
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (lastDownload && now - lastDownload < ONE_DAY_MS) {
      const waitHours = Math.ceil((ONE_DAY_MS - (now - lastDownload)) / (60 * 60 * 1000));
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'EXPORT_LIMIT_EXCEEDED',
          message: `O dump completo de candidatos em CSV é restrito a 1 solicitação a cada 24 horas por chave. Tente novamente em aproximadamente ${waitHours} horas.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    csvDownloadTracker.set(apiKeyId, now);

    const candidates = await this.prisma.candidate.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        tseId: true,
        name: true,
        numeroUrna: true,
        party: true,
        partyNumber: true,
        cargo: true,
        level: true,
        candidaturaStatus: true,
        state: true,
        municipality: true,
        fichaLimpa: true,
        profileScores: true,
      },
    });

    const headers = [
      'id',
      'tseId',
      'name',
      'numeroUrna',
      'party',
      'partyNumber',
      'cargo',
      'level',
      'candidaturaStatus',
      'state',
      'municipality',
      'fichaLimpa',
      'p1',
      'p2',
      'p3',
      'p4',
      'p5',
      'p6',
      'p7',
      'p8',
      'p9',
      'p10',
      'p11',
      'p12',
      'p13',
    ];

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = candidates.map((c) => {
      const scores = (c.profileScores || {}) as Record<string, number>;
      return [
        escapeCsv(c.id),
        escapeCsv(c.tseId),
        escapeCsv(c.name),
        escapeCsv(c.numeroUrna || ''),
        escapeCsv(c.party),
        escapeCsv(c.partyNumber),
        escapeCsv(c.cargo),
        escapeCsv(c.level),
        escapeCsv(c.candidaturaStatus),
        escapeCsv(c.state),
        escapeCsv(c.municipality),
        escapeCsv(c.fichaLimpa ? 'SIM' : 'NAO'),
        escapeCsv(scores.p1 ?? ''),
        escapeCsv(scores.p2 ?? ''),
        escapeCsv(scores.p3 ?? ''),
        escapeCsv(scores.p4 ?? ''),
        escapeCsv(scores.p5 ?? ''),
        escapeCsv(scores.p6 ?? ''),
        escapeCsv(scores.p7 ?? ''),
        escapeCsv(scores.p8 ?? ''),
        escapeCsv(scores.p9 ?? ''),
        escapeCsv(scores.p10 ?? ''),
        escapeCsv(scores.p11 ?? ''),
        escapeCsv(scores.p12 ?? ''),
        escapeCsv(scores.p13 ?? ''),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
