import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Ad, Advertiser } from '@prisma/client';
import { TransparencyReport } from './dto/contextual-ad-query.dto';
import { CreateAdvertiserDto } from './dto/create-advertiser.dto';
import { ApplyAdvertiserDto } from './dto/apply-advertiser.dto';
import { ReviewAdvertiserDto } from './dto/review-advertiser.dto';
import { ContractAdvertiserDto } from './dto/contract-advertiser.dto';

@Injectable()
export class AdsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async getContextualAd(screen: string, pillar?: string, date?: Date): Promise<Ad | null> {
    const now = date ? new Date(date) : new Date();

    // 1. Verifica se estamos no período eleitoral oficial de blackout (16/08 - 05/10)
    if (this.isElectionPeriod(now)) return null;

    // 2. Busca anúncio ativo, de anunciante aprovado/ativo e dentro do período de vigência
    let ad: (Ad & { advertiser?: Advertiser }) | null = null;
    if (pillar) {
      ad = await this.prisma.ad.findFirst({
        where: {
          isActive: true,
          advertiser: {
            isActive: true,
            status: { in: ['APROVADO', 'ATIVO'] },
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
          screen: screen,
          pillar: pillar,
        },
        include: { advertiser: true },
      });
    }

    if (!ad) {
      ad = await this.prisma.ad.findFirst({
        where: {
          isActive: true,
          advertiser: {
            isActive: true,
            status: { in: ['APROVADO', 'ATIVO'] },
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: now } }] },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
          screen: screen,
        },
        include: { advertiser: true },
      });
    }

    // 3. Validação defensiva de datas e status (cobre mocks de teste unitário)
    if (ad) {
      if (ad.startDate && new Date(ad.startDate) > now) return null;
      if (ad.endDate && new Date(ad.endDate) < now) return null;
      if (ad.advertiser) {
        if (ad.advertiser.status && !['APROVADO', 'ATIVO'].includes(ad.advertiser.status)) return null;
        if (ad.advertiser.startDate && new Date(ad.advertiser.startDate) > now) return null;
        if (ad.advertiser.endDate && new Date(ad.advertiser.endDate) < now) return null;
      }

      await this.prisma.ad.update({
        where: { id: ad.id },
        data: { impressions: { increment: 1 } },
      });
    }

    return ad;
  }

  async getColaFooterAd(deviceHash?: string, date?: Date): Promise<(Ad & { advertiser: Advertiser }) | null> {
    if (this.isElectionPeriod(date)) return null;

    if (deviceHash) {
      const optedOut = await this.hasOptedOut(deviceHash);
      if (optedOut) return null;
    }

    const ad = await this.prisma.ad.findFirst({
      where: {
        isActive: true,
        format: 'COLA_FOOTER',
        advertiser: { isActive: true, isApproved: true },
      },
      include: { advertiser: true },
    });

    if (ad) {
      await this.prisma.ad.update({
        where: { id: ad.id },
        data: { impressions: { increment: 1 } },
      });
    }

    return ad;
  }

  async recordClick(adId: string): Promise<void> {
    await this.prisma.ad.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });
  }

  async getTransparencyReport(): Promise<TransparencyReport> {
    const advertisers = await this.prisma.advertiser.findMany({
      where: { isActive: true, isApproved: true },
      include: { ads: true },
    });

    return {
      totalAdvertisers: advertisers.length,
      totalRevenue: advertisers.reduce((sum, adv) => sum + (adv.contractValue ? Number(adv.contractValue) : 0), 0),
      advertisers: advertisers.map(adv => {
        let pillars: string[] = [];
        if (Array.isArray(adv.pillarAlignment)) {
          pillars = adv.pillarAlignment as string[];
        } else if (typeof adv.pillarAlignment === 'string') {
          try {
            pillars = JSON.parse(adv.pillarAlignment);
          } catch {
            pillars = [adv.pillarAlignment];
          }
        }
        return {
          name: adv.name,
          cnpj: adv.cnpj,
          category: adv.category,
          pillars,
          contractValue: adv.contractValue !== null ? Number(adv.contractValue) : null,
          activeAds: adv.ads.filter(ad => ad.isActive).length,
        };
      }),
    };
  }

  async createAdvertiser(data: CreateAdvertiserDto): Promise<Advertiser> {
    return this.prisma.advertiser.create({
      data: {
        name: data.name,
        cnpj: data.cnpj,
        category: data.category,
        pillarAlignment: data.pillarAlignment,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isApproved: false, // Requer aprovação manual
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        contractValue: data.contractValue !== undefined ? data.contractValue : null,
      },
    });
  }

  async toggleApproval(id: string): Promise<Advertiser> {
    const adv = await this.prisma.advertiser.findUnique({ where: { id } });
    if (!adv) {
      throw new HttpException('Anunciante não encontrado', HttpStatus.NOT_FOUND);
    }
    return this.prisma.advertiser.update({
      where: { id },
      data: { isApproved: !adv.isApproved },
    });
  }

  async getAdminReport() {
    const ads = await this.prisma.ad.findMany({
      include: { advertiser: true },
    });

    const advertisers = await this.prisma.advertiser.findMany({
      where: { isActive: true, isApproved: true },
    });

    const totalRevenue = advertisers.reduce(
      (sum, adv) => sum + (adv.contractValue ? Number(adv.contractValue) : 0),
      0,
    );

    const adsReport = ads.map((ad) => {
      const ctr = ad.impressions > 0 ? Number((ad.clicks / ad.impressions).toFixed(4)) : 0;
      return {
        id: ad.id,
        title: ad.title,
        screen: ad.screen,
        format: ad.format,
        pillar: ad.pillar,
        impressions: ad.impressions,
        clicks: ad.clicks,
        ctr,
        advertiserId: ad.advertiserId,
        advertiserName: ad.advertiser?.name,
        isActive: ad.isActive,
      };
    });

    const totalImpressions = ads.reduce((sum, a) => sum + a.impressions, 0);
    const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);
    const overallCtr = totalImpressions > 0 ? Number((totalClicks / totalImpressions).toFixed(4)) : 0;

    return {
      totalRevenue,
      totalImpressions,
      totalClicks,
      overallCtr,
      ads: adsReport,
    };
  }

  async apply(dto: ApplyAdvertiserDto): Promise<{ protocol: string; sla: string; blackoutNotice: string }> {
    // Honeypot anti-bot
    if (dto.website && dto.website.trim() !== '') {
      return {
        protocol: 'ok',
        sla: '48h',
        blackoutNotice: 'Veiculação a partir de 05/10/2026',
      };
    }

    const cleanCnpj = dto.cnpj.replace(/\D/g, '');
    const existing = await this.prisma.advertiser.findFirst({
      where: {
        OR: [{ cnpj: dto.cnpj }, { cnpj: cleanCnpj }],
      },
    });

    if (existing) {
      throw new HttpException('CNPJ já cadastrado em nossa base', HttpStatus.CONFLICT);
    }

    const advertiser = await this.prisma.advertiser.create({
      data: {
        name: dto.name,
        cnpj: dto.cnpj,
        category: dto.category,
        pillarAlignment: dto.pillarAlignment,
        status: 'PROPOSTA',
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        applicationNote: dto.applicationNote,
        isActive: true,
        isApproved: false,
        startDate: new Date('2026-10-05T00:00:00.000Z'),
      },
    });

    return {
      protocol: advertiser.id,
      sla: '48h',
      blackoutNotice: 'Veiculação a partir de 05/10/2026',
    };
  }

  async getApplications(): Promise<Advertiser[]> {
    return this.prisma.advertiser.findMany({
      where: {
        status: { in: ['PROPOSTA', 'EM_ANALISE'] },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reviewAdvertiser(id: string, dto: ReviewAdvertiserDto): Promise<Advertiser> {
    const adv = await this.prisma.advertiser.findUnique({ where: { id } });
    if (!adv) {
      throw new HttpException('Anunciante não encontrado', HttpStatus.NOT_FOUND);
    }

    const isApproved = dto.decision === 'APROVADO';
    return this.prisma.advertiser.update({
      where: { id },
      data: {
        status: dto.decision,
        isApproved,
        applicationNote: dto.note
          ? adv.applicationNote
            ? `${adv.applicationNote}\n[Review]: ${dto.note}`
            : dto.note
          : adv.applicationNote,
      },
    });
  }

  async contractAdvertiser(id: string, dto: ContractAdvertiserDto): Promise<Advertiser> {
    const adv = await this.prisma.advertiser.findUnique({ where: { id } });
    if (!adv) {
      throw new HttpException('Anunciante não encontrado', HttpStatus.NOT_FOUND);
    }

    const startDate = new Date(dto.startDate);
    const blackoutEnd = new Date('2026-10-05T00:00:00.000Z');
    if (startDate < blackoutEnd) {
      throw new HttpException('A data de início do contrato deve ser a partir de 05/10/2026', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.advertiser.update({
      where: { id },
      data: {
        status: 'ATIVO',
        isActive: true,
        isApproved: true,
        contractValue: dto.contractValue,
        startDate: startDate,
        endDate: new Date(dto.endDate),
      },
    });
  }

  getActivationStatus(date: Date = new Date()) {
    const year = date.getFullYear();
    const electionEnd = new Date(year, 9, 5, 23, 59, 59);
    const isBlackout = this.isElectionPeriod(date);
    const diffMs = electionEnd.getTime() - date.getTime();
    const daysRemaining = isBlackout ? Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : 0;
    const servingNow = !isBlackout;

    return {
      blackoutUntil: `${year}-10-05`,
      daysRemaining,
      servingNow,
    };
  }

  async optOut(deviceHash: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.adOptOut.upsert({
      where: { deviceHash },
      update: { optedOutAt: new Date(), expiresAt },
      create: { deviceHash, expiresAt },
    });
  }

  async hasOptedOut(deviceHash: string): Promise<boolean> {
    const optOut = await this.prisma.adOptOut.findUnique({ where: { deviceHash } });
    if (!optOut) return false;
    return optOut.expiresAt > new Date();
  }

  public isElectionPeriod(date: Date = new Date()): boolean {
    const year = date.getFullYear();
    const electionStart = new Date(year, 7, 16, 0, 0, 0); // 16 de agosto
    const electionEnd = new Date(year, 9, 5, 23, 59, 59);   // 5 de outubro
    return date >= electionStart && date <= electionEnd;
  }
}
