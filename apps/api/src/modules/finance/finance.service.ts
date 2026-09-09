import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PixWebhookDto } from './dto/pix-webhook.dto';
import { OpsModeService } from '../common/ops-mode.service';

export interface MonthlyCostItem {
  category: string;
  monthlyCostBrl: number;
  description: string;
}

export interface CostsBreakdownResponse {
  monthlyBudget: {
    items: MonthlyCostItem[];
    totalMonthlyCostBrl: number;
  };
  period: {
    startDate: string;
    monthsOperating: number;
    totalAccumulatedCostBrl: number;
  };
  revenue: {
    donationsBrl: number;
    donationsCount: number;
    ethicalAdsBrl: number;
    totalAccumulatedRevenueBrl: number;
  };
  breakEven: {
    isBreakEven: boolean;
    balanceBrl: number;
    percentageCovered: number;
  };
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  // Custos mensais configurados (infraestrutura free-tier + domínio institucional)
  private readonly costConfig: MonthlyCostItem[] = [
    { category: 'Hospedagem Frontend (Cloudflare Pages)', monthlyCostBrl: 0.0, description: 'Plano Free (largura de banda ilimitada)' },
    { category: 'Hospedagem Backend (Render Free / Oracle Always Free)', monthlyCostBrl: 0.0, description: 'Scale-to-zero / instâncias ARM Always Free' },
    { category: 'Banco de Dados & Auth (Supabase Free)', monthlyCostBrl: 0.0, description: '500MB DB / 50k MAU' },
    { category: 'Domínio Institucional (.org.br / .com.br)', monthlyCostBrl: 3.33, description: 'R$ 40,00 anuais no Registro.br (~R$ 3,33/mês)' },
    { category: 'Monitoramento (Sentry Free Tier)', monthlyCostBrl: 0.0, description: 'Até 5.000 eventos/mês' },
    { category: 'Reserva para Excedentes / Tráfego de Pico', monthlyCostBrl: 0.0, description: 'Sem custo fixo adicional previsto' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly opsModeService: OpsModeService,
  ) {}

  async getCostsBreakdown(simulatedDate: Date = new Date()): Promise<CostsBreakdownResponse> {
    const totalMonthlyCost = this.costConfig.reduce((sum, item) => sum + item.monthlyCostBrl, 0);

    // Projeto iniciado em janeiro/2026 (início do ciclo eleitoral)
    const startDate = new Date(2026, 0, 1);
    const months = Math.max(1, (simulatedDate.getFullYear() - startDate.getFullYear()) * 12 + (simulatedDate.getMonth() - startDate.getMonth()) + 1);
    const totalAccumulatedCost = Number((totalMonthlyCost * months).toFixed(2));

    // 1. Receita de Doações PIX (tabela DonationEvent)
    const donations = await this.prisma.donationEvent.findMany();
    const donationsCentsTotal = donations.reduce((sum, d) => sum + d.amountCents, 0);
    const donationsBrl = Number((donationsCentsTotal / 100).toFixed(2));

    // 2. Receita de Anúncios Éticos Aprovados (tabela Advertiser)
    const approvedAdvertisers = await this.prisma.advertiser.findMany({
      where: { isActive: true, isApproved: true },
    });
    const ethicalAdsBrl = approvedAdvertisers.reduce((sum, adv) => sum + (adv.contractValue ? Number(adv.contractValue) : 0), 0);

    const totalAccumulatedRevenue = Number((donationsBrl + ethicalAdsBrl).toFixed(2));
    const balanceBrl = Number((totalAccumulatedRevenue - totalAccumulatedCost).toFixed(2));
    const isBreakEven = balanceBrl >= 0;
    const percentageCovered = totalAccumulatedCost > 0 ? Number(((totalAccumulatedRevenue / totalAccumulatedCost) * 100).toFixed(1)) : 100;

    return {
      monthlyBudget: {
        items: this.costConfig,
        totalMonthlyCostBrl: totalMonthlyCost,
      },
      period: {
        startDate: '2026-01-01',
        monthsOperating: months,
        totalAccumulatedCostBrl: totalAccumulatedCost,
      },
      revenue: {
        donationsBrl,
        donationsCount: donations.length,
        ethicalAdsBrl,
        totalAccumulatedRevenueBrl: totalAccumulatedRevenue,
      },
      breakEven: {
        isBreakEven,
        balanceBrl,
        percentageCovered,
      },
    };
  }

  async recordDonation(dto: PixWebhookDto) {
    // Idempotência estrita por eventId
    const existing = await this.prisma.donationEvent.findUnique({
      where: { eventId: dto.eventId },
    });
    if (existing) {
      this.logger.log(`Webhook PIX ignorado (evento duplicado ${dto.eventId})`);
      return { success: true, duplicate: true, donation: existing };
    }

    try {
      const donation = await this.prisma.donationEvent.create({
        data: {
          provider: dto.provider,
          eventId: dto.eventId,
          amountCents: Math.round(dto.amountCents),
        },
      });
      this.logger.log(`Doação PIX registrada: ${donation.id} (R$ ${(donation.amountCents / 100).toFixed(2)})`);
      return { success: true, duplicate: false, donation };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const item = await this.prisma.donationEvent.findUnique({ where: { eventId: dto.eventId } });
        return { success: true, duplicate: true, donation: item };
      }
      throw err;
    }
  }

  async getTransparency(date?: Date) {
    const costs = await this.getCostsBreakdown(date);
    const opsMode = this.opsModeService.getMode(date);

    return {
      title: 'Transparência Financeira e Sustentabilidade Cívica',
      description: 'Publicação Sem Prejuízo: sem fins lucrativos, sem assinaturas, com planilha aberta em tempo real.',
      breakEven: costs.breakEven,
      period: costs.period,
      monthlyCosts: costs.monthlyBudget,
      revenue: costs.revenue,
      operatingMode: opsMode,
      fiscalHosting: 'Associação / Coletivo Progressista Sem Fins Lucrativos',
      lastUpdated: '2026-09-07',
    };
  }
}
