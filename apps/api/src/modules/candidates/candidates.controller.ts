import { Controller, Get, Param, Query, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
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

  @Get(['photo-proxy', 'photo-proxy/:tseId'])
  async getCandidatePhotoProxy(
    @Param('tseId') paramTseId?: string,
    @Query('name') name?: string,
    @Query('state') state?: string,
    @Query('tseId') queryTseId?: string,
    @Query('cargo') cargo?: string,
    @Res() res?: Response,
  ) {
    if (!res) return;
    const tseId = paramTseId || queryTseId;

    // 1. Verifica se já existe cache em disco
    if (tseId) {
      const localFile = path.join(TSE_CONFIG.PHOTO_STORAGE_DIR, `tse_${tseId}.jpg`);
      if (fs.existsSync(localFile) && fs.statSync(localFile).size > 1024) {
        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=604800, s-maxage=2592000');
        res.set('Access-Control-Allow-Origin', '*');
        return res.sendFile(localFile);
      }
    }

    // 2. Resolve URL dinâmica
    const photoUrl = await this.candidatesService.resolveCandidatePhotoDynamic(name, state, tseId, cargo);
    if (!photoUrl) {
      return res.status(404).send({ message: 'Photo not found' });
    }

    // 3. Se for URL remota HTTP/HTTPS, baixa o buffer e envia com headers corretos e salva em cache
    if (photoUrl.startsWith('http')) {
      try {
        const response = await axios.get(photoUrl, {
          responseType: 'arraybuffer',
          timeout: 8000,
          headers: {
            'User-Agent': TSE_CONFIG.USER_AGENT,
            Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
          },
        });

        const buffer = Buffer.from(response.data);
        const contentType = String(response.headers['content-type'] || 'image/jpeg');

        // Salva em cache local se tiver tseId
        if (tseId && buffer.length > 1024) {
          try {
            if (!fs.existsSync(TSE_CONFIG.PHOTO_STORAGE_DIR)) {
              fs.mkdirSync(TSE_CONFIG.PHOTO_STORAGE_DIR, { recursive: true });
            }
            fs.writeFileSync(path.join(TSE_CONFIG.PHOTO_STORAGE_DIR, `tse_${tseId}.jpg`), buffer);
          } catch {}
        }

        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=604800, s-maxage=2592000');
        res.set('Access-Control-Allow-Origin', '*');
        return res.send(buffer);
      } catch {
        return res.redirect(photoUrl);
      }
    }

    return res.redirect(photoUrl);
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
