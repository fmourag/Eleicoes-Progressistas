import { Controller, Get, Param, Query, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import { CandidatesService } from './candidates.service';
import { TseCandidatesService } from './tse-candidates.service';
import { TsePhotoPrefetchService } from './tse/tse-photo-prefetch.service';
import { TSE_CONFIG } from './tse/tse.config';

@Controller('candidates')
export class CandidatesController {
  constructor(
    @Inject(CandidatesService) private candidatesService: CandidatesService,
    @Inject(TseCandidatesService) private tseCandidatesService: TseCandidatesService,
    @Inject(TsePhotoPrefetchService) private photoPrefetch: TsePhotoPrefetchService,
  ) {}

  @Get('photo-proxy')
  async getCandidatePhotoProxy(
    @Query('name') name?: string,
    @Query('state') state?: string,
    @Query('tseId') tseId?: string,
    @Query('cargo') cargo?: string,
    @Res() res?: Response,
  ) {
    const photoUrl = await this.candidatesService.resolveCandidatePhotoDynamic(name, state, tseId, cargo);
    if (photoUrl) {
      return res?.redirect(photoUrl);
    }
    return res?.status(404).send({ message: 'Photo not found' });
  }

  @Get()
  async findAll(
    @Query('municipality') municipality?: string,
    @Query('state') state?: string,
    @Query('cargo') cargo?: string,
    @Query('party') party?: string,
    @Query('search') search?: string,
  ) {
    return this.candidatesService.findByLocation(municipality, state, cargo, party, search);
  }

  @Get('tse/live')
  async getLiveTseCandidates(
    @Query('year') year?: number,
    @Query('uf') uf?: string,
    @Query('cargo') cargoCode?: number,
  ) {
    return this.tseCandidatesService.fetchLiveCandidates(year ?? 2026, '2045202026', uf ?? 'BR', cargoCode ?? 1);
  }

  @Get('tse/source-info')
  async getTseSourceInfo() {
    return {
      provider: 'Tribunal Superior Eleitoral - TSE',
      service: 'Portal de Dados Abertos e DivulgaCandContas',
      trustedPortal: 'https://dadosabertos.tse.jus.br/',
      endpoints: [
        {
          name: 'Portal de Dados Abertos do TSE (Fonte Oficial e Confiável)',
          url: 'https://dadosabertos.tse.jus.br/',
          isTrusted: true,
          description: 'Repositório público de conjuntos de dados oficiais da Justiça Eleitoral.',
        },
        {
          name: 'DivulgaCandContas (TSE)',
          url: 'https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1',
          isTrusted: true,
          description: 'API de registros de candidaturas e prestações de contas.',
        },
      ],
      electionYear: 2026,
      status: 'ONLINE',
      syncedAt: new Date().toISOString(),
    };
  }

  @Get('tse/dados-abertos-search')
  async getDadosAbertosSearch(@Query('q') query?: string) {
    const q = query && query.trim() ? query.trim() : 'candidatos 2026';
    const searchUrl = this.tseCandidatesService.getTseDadosAbertosSearchUrl(q);
    return {
      portal: 'https://dadosabertos.tse.jus.br/',
      searchUrl,
      query: q,
      isTrusted: true,
      title: 'Portal de Dados Abertos do TSE',
      description: 'Fonte oficial e confiável de dados da Justiça Eleitoral.',
    };
  }

  @Get(':id/tse-detail')
  async getTseDetail(@Param('id') id: string) {
    const candidate = (await this.candidatesService.findById(id)) as any;
    const uf: string = candidate?.state || 'BR';
    const year: number = Number(candidate?.electionYear) || 2026;
    const tseId: string = candidate?.tseId || id;
    return this.tseCandidatesService.fetchCandidateDetail(year, '2045202026', uf, tseId);
  }

  @Get(':id/finances')
  async getFinances(@Param('id') id: string) {
    const candidate = (await this.candidatesService.findById(id)) as any;
    const cargo: string = candidate?.cargo || 'PRESIDENTE';
    const uf: string = candidate?.state || 'BR';
    const tseId: string = candidate?.tseId || id;
    return this.tseCandidatesService.fetchCampaignFinances('2045202026', cargo, uf, tseId);
  }

  @Get(':id/photo')
  async getCandidatePhoto(@Param('id') id: string, @Res() res: Response) {
    const candidate = (await this.candidatesService.findById(id)) as any;
    if (!candidate) {
      return res.status(404).send({ message: 'Candidate not found' });
    }

    const tseId = candidate.tseId;
    if (tseId && this.photoPrefetch.hasLocal(tseId)) {
      const localFilePath = path.join(TSE_CONFIG.PHOTO_STORAGE_DIR, `tse_${tseId}.jpg`);
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.setHeader('Content-Type', 'image/jpeg');
      return res.sendFile(localFilePath);
    }

    if (tseId && /^\d+$/.test(tseId)) {
      this.photoPrefetch.prefetch(tseId, candidate.photoUrl);
    }

    const redirectUrl =
      candidate.photoUrl && candidate.photoUrl.startsWith('http')
        ? candidate.photoUrl
        : (candidate.tseId && /^\d+$/.test(candidate.tseId)
            ? `${TSE_CONFIG.PHOTO_BASE_URL}/${TSE_CONFIG.DEFAULT_ELEICAO_ID}/${candidate.tseId}`
            : '/placeholder-candidate.png');

    return res.redirect(302, redirectUrl);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findById(id);
  }

  @Get(':id/raio-x')
  async getRaioX(@Param('id') id: string) {
    return this.candidatesService.getRaioX(id);
  }

  @Get('cargos/:level')
  async getEligibleCargos(@Param('level') level: string) {
    return this.candidatesService.getEligibleCargos(level as any);
  }
}
