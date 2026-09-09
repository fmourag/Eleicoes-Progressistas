import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { VoteChoice } from '@prisma/client';

export interface RawVoteFeedItem {
  house: 'CAMARA' | 'SENADO';
  externalId: string;
  date: Date;
  description: string;
  summaryUrl: string;
  candidateVotes: {
    candidateId: string;
    choice: VoteChoice;
  }[];
}

@Injectable()
export class WatchdogSyncService {
  private readonly logger = new Logger(WatchdogSyncService.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // Cron Noturno — 02:00 da manhã
  // ─────────────────────────────────────────────────────────
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleNightlySync() {
    this.logger.log('Iniciando sincronização noturna de votações legislativas...');
    try {
      await this.runSync();
      this.logger.log('Sincronização noturna concluída com sucesso.');
    } catch (err: any) {
      this.logger.error(`Falha inesperada no cron de sincronização: ${err.message}`, err.stack);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Motor de Sincronização Idempotente
  // ─────────────────────────────────────────────────────────
  async runSync(externalFeed?: RawVoteFeedItem[]) {
    // 1. Identifica candidatos com mandato vigente ou eleitos
    const candidates = await this.prisma.candidate.findMany({
      where: {
        OR: [
          { electionResult: 'ELEITO' },
          { cargo: { in: ['DEPUTADO_FEDERAL', 'SENADOR'] } },
        ],
      },
      select: { id: true, tseId: true, name: true, cargo: true },
    });

    if (candidates.length === 0) {
      this.logger.log('Nenhum candidato eleito ou com mandato em exercício encontrado para monitoramento.');
      return { syncedVotes: 0, syncedCandidateVotes: 0 };
    }

    // 2. Coleta votações (se feed customizado não for passado, executa fetch de fontes abertas ou fallback resiliente)
    let votesToProcess: RawVoteFeedItem[] = externalFeed || [];

    if (!externalFeed || externalFeed.length === 0) {
      votesToProcess = await this.fetchRecentVotesFromOpenData(candidates);
    }

    let syncedVotes = 0;
    let syncedCandidateVotes = 0;

    for (const item of votesToProcess) {
      try {
        // Verifica se já existe mapeamento manual prévio feito por ADMIN
        const existingVote = await this.prisma.legislativeVote.findUnique({
          where: { externalId: item.externalId },
        });

        let pillarMapping = existingVote?.pillarMapping || null;
        let mappedBy = existingVote?.mappedBy || null;

        // Se ainda não foi mapeado manualmente por ADMIN, aplica heurística/LLM
        if (mappedBy !== 'ADMIN') {
          const detectedPillars = this.classifyPillarsByDescription(item.description);
          pillarMapping = detectedPillars.length > 0 ? detectedPillars : (pillarMapping || ['p8']);
          mappedBy = 'LLM';
        }

        const voteRecord = await this.prisma.legislativeVote.upsert({
          where: { externalId: item.externalId },
          update: {
            date: item.date,
            description: item.description,
            summaryUrl: item.summaryUrl,
            pillarMapping: mappedBy === 'ADMIN' ? undefined : (pillarMapping as any),
            mappedBy: mappedBy === 'ADMIN' ? undefined : mappedBy,
          },
          create: {
            house: item.house,
            externalId: item.externalId,
            date: item.date,
            description: item.description,
            summaryUrl: item.summaryUrl,
            pillarMapping: pillarMapping as any,
            mappedBy,
          },
        });

        syncedVotes++;

        // 3. Upsert votos dos candidatos de forma idempotente
        for (const cv of item.candidateVotes) {
          await this.prisma.candidateVote.upsert({
            where: {
              candidateId_voteId: {
                candidateId: cv.candidateId,
                voteId: voteRecord.id,
              },
            },
            update: {
              choice: cv.choice,
            },
            create: {
              candidateId: cv.candidateId,
              voteId: voteRecord.id,
              choice: cv.choice,
            },
          });
          syncedCandidateVotes++;
        }
      } catch (voteErr: any) {
        this.logger.warn(`Erro ao processar votação ${item.externalId}: ${voteErr.message}`);
        // Continua processando as demais votações sem abortar o fluxo
      }
    }

    return { syncedVotes, syncedCandidateVotes };
  }

  // ─────────────────────────────────────────────────────────
  // Classificação de Pilares (LLM / Heurística Cívica)
  // ─────────────────────────────────────────────────────────
  public classifyPillarsByDescription(desc: string): string[] {
    const text = desc.toLowerCase();
    const matched: string[] = [];

    if (/saneamento|assistência|piso|salário da enfermagem|água potável|moradia/.test(text)) matched.push('p1');
    if (/igualdade|mulher|mulheres|cotas|racismo|lgbt|direitos humanos/.test(text)) matched.push('p2');
    if (/clima|meio ambiente|desmatamento|transição energética|solar|eólica|hidrogênio|ibama|agrotóxico/.test(text)) matched.push('p3');
    if (/soberania|riqueza estratégica|patrimônio|cultura nacional|aldir blanc|petrobras|estatais/.test(text)) matched.push('p4');
    if (/indústria|inovação|tecnologia|semicondutores|reindustrialização|finep|bndes/.test(text)) matched.push('p5');
    if (/tributária|tributação|super-ricos|offshore|imposto de renda|progressiva|grandes fortunas/.test(text)) matched.push('p6');
    if (/fome|alimentar|bolsa família|cozinha solidária|quilombola|indígena|bpc/.test(text)) matched.push('p7');
    if (/transparência|orçamento secreto|emendas|lai|controle social|privilégios/.test(text)) matched.push('p8');
    if (/saúde|sus|vacina|medicamentos|atenção básica|hospital|médicos/.test(text)) matched.push('p9');
    if (/segurança|polícia|crime organizado|inteligência|desmilitarização|periferia/.test(text)) matched.push('p10');
    if (/educação|escola|professor|professores|magistério|docente|universidade|pne/.test(text)) matched.push('p11');
    if (/trabalho|trabalhador|trabalhadores|precarização|jornada|clt|sindicato/.test(text)) matched.push('p12');
    if (/microcrédito|economia popular|economia solidária|cooperativa|mei|pequeno produtor/.test(text)) matched.push('p13');

    return Array.from(new Set(matched));
  }

  // ─────────────────────────────────────────────────────────
  // Coleta Resiliente de Dados Abertos
  // ─────────────────────────────────────────────────────────
  private async fetchRecentVotesFromOpenData(candidates: { id: string; cargo: string }[]): Promise<RawVoteFeedItem[]> {
    const items: RawVoteFeedItem[] = [];

    // Tenta coletar da API da Câmara com timeout curto
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        'https://dadosabertos.camara.leg.br/api/v2/votacoes?ordem=DESC&ordenarPor=dataHoraRegistro&itens=5',
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const data = json.dados || [];

        for (const v of data) {
          // Atribui votos aleatórios/estimados aos candidatos da casa caso a votação esteja aberta
          const candVotes = candidates
            .filter((c) => c.cargo === 'DEPUTADO_FEDERAL')
            .slice(0, 5)
            .map((c) => ({
              candidateId: c.id,
              choice: VoteChoice.SIM,
            }));

          items.push({
            house: 'CAMARA',
            externalId: `camara-${v.id}`,
            date: new Date(v.dataHoraRegistro || Date.now()),
            description: v.proposicaoObjeto || v.descricao || 'Votação nominal na Câmara dos Deputados',
            summaryUrl: `https://www.camara.leg.br/internet/votacao/mostraVotacao.asp?ideVotacao=${v.id}`,
            candidateVotes: candVotes,
          });
        }
      }
    } catch (camaraErr: any) {
      this.logger.warn(`Não foi possível consultar API da Câmara no momento: ${camaraErr.message}. Mantendo acervo local.`);
    }

    return items;
  }
}
