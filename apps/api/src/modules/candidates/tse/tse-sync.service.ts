import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TseMapperService } from './tse-mapper.service';
import { TsePhotoService } from './tse-photo.service';
import { TSE_CONFIG } from './tse.config';
import {
  TseSyncOptions,
  TseSyncResult,
  TseCandidateResponse,
  TseSyncStats,
  TseCandidateListResponse,
} from './types';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse';
import * as https from 'https';
import { Readable } from 'stream';

@Injectable()
export class TseSyncService {
  private readonly logger = new Logger(TseSyncService.name);
  private isSyncing = false;
  private lastResult: TseSyncResult | null = null;
  private logs: string[] = [];
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: TseMapperService,
    private readonly photoService: TsePhotoService,
  ) {}

  private addLog(message: string): void {
    const logLine = `[${new Date().toISOString()}] ${message}`;
    this.logs.push(logLine);
    if (this.logs.length > 500) {
      this.logs.shift();
    }
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  async getSyncStats(): Promise<TseSyncStats> {
    const totalInDb = await this.prisma.candidate.count();
    const totalByParty = await this.prisma.candidate.groupBy({
      by: ['party'],
      _count: { id: true },
    });
    const totalByCargo = await this.prisma.candidate.groupBy({
      by: ['cargo'],
      _count: { id: true },
    });
    const totalByState = await this.prisma.candidate.groupBy({
      by: ['state'],
      _count: { id: true },
    });

    const partyCounts: Record<string, number> = {};
    totalByParty.forEach((p) => {
      partyCounts[p.party] = p._count?.id || 0;
    });

    const roleCounts: Record<string, number> = {};
    totalByCargo.forEach((r) => {
      roleCounts[r.cargo] = r._count?.id || 0;
    });

    const stateCounts: Record<string, number> = {};
    totalByState.forEach((s) => {
      stateCounts[s.state] = s._count?.id || 0;
    });

    return {
      totalCandidates: totalInDb,
      lastSyncDate: this.lastResult?.completedAt || null,
      lastSyncStatus: this.lastResult?.status || 'idle',
      byParty: partyCounts,
      byRole: roleCounts,
      byState: stateCounts,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Faz requisição HTTP com rate limiting e retry exponencial em 429/5xx
   */
  private async fetchWithRetry(url: string, retries = TSE_CONFIG.MAX_RETRIES): Promise<any> {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        await this.delay(TSE_CONFIG.RATE_LIMIT_DELAY_MS);
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'User-Agent': TSE_CONFIG.USER_AGENT,
            Accept: 'application/json',
          },
          httpsAgent: this.httpsAgent,
        });
        return response.data;
      } catch (error: any) {
        attempt++;
        const status = error.response?.status;
        const isRateLimitOrServer = status === 429 || (status >= 500 && status < 600);

        if (attempt <= retries && (isRateLimitOrServer || error.code === 'ECONNABORTED')) {
          const backoff = TSE_CONFIG.RATE_LIMIT_DELAY_MS * Math.pow(2, attempt);
          this.logger.warn(
            `TSE API request to ${url} failed (status ${status}). Backing off for ${backoff}ms (attempt ${attempt}/${retries})...`,
          );
          await this.delay(backoff);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Sincronização oficial via API REST do TSE (somente listagem)
   */
  async syncFromApi(options: TseSyncOptions = {}): Promise<TseSyncResult> {
    if (this.isSyncing) {
      throw new Error('Uma sincronização já está em andamento');
    }

    this.isSyncing = true;
    const startedAt = new Date().toISOString();
    const ufs = options.ufs && options.ufs.length > 0 ? options.ufs : TSE_CONFIG.ALL_UFS;
    const roles = options.cargos && options.cargos.length > 0 ? options.cargos : TSE_CONFIG.CARGOS;
    const ano = options.ano || TSE_CONFIG.DEFAULT_ANO;
    const eleicaoId = options.eleicaoId || TSE_CONFIG.DEFAULT_ELEICAO_ID;

    let totalProcessed = 0;
    let totalImported = 0;
    let totalUpdated = 0;
    let totalExcluded = 0;
    let totalErrors = 0;
    const errors: Array<{ tseId?: string; name?: string; uf?: string; error: string }> = [];

    this.addLog(`Iniciando sincronização TSE API (Ano: ${ano}, Eleição: ${eleicaoId}, UFs: ${ufs.length}, Cargos: ${roles.length})`);

    try {
      for (const uf of ufs) {
        for (const role of roles) {
          // Presidente apenas em BR
          if (role.codigo === 1 && uf !== 'BR') continue;
          // Governador/Senador/Deputados não em BR
          if (role.codigo !== 1 && uf === 'BR') continue;

          const listUrl = `${TSE_CONFIG.API_BASE_URL}/candidatura/listar/${ano}/${uf}/${eleicaoId}/${role.codigo}/candidatos`;
          this.logger.log(`Consultando TSE: UF=${uf}, Cargo=${role.nome} (${role.codigo})`);
          this.addLog(`Consultando TSE: UF=${uf}, Cargo=${role.nome}`);

          let data: TseCandidateListResponse;
          try {
            data = await this.fetchWithRetry(listUrl);
          } catch (err: any) {
            this.logger.error(`Erro ao consultar ${listUrl}: ${err.message}`);
            this.addLog(`Erro ao consultar ${uf}/${role.nome}: ${err.message}`);
            errors.push({ uf, error: `Falha na listagem: ${err.message}` });
            totalErrors++;
            continue;
          }

          if (!data || !data.candidatos || !Array.isArray(data.candidatos)) {
            continue;
          }

          for (const candItem of data.candidatos) {
            totalProcessed++;
            const tseId = String(candItem.id);
            const partySigla = candItem.partido?.sigla || '';

            // Filtragem partidária
            if (this.mapper.isPartyExcluded(partySigla)) {
              totalExcluded++;
              continue;
            }

            try {
              let candidateData: TseCandidateResponse = candItem as TseCandidateResponse;

              // Detalhe individual apenas se explicitamente solicitado
              if (options.fetchDetails === true) {
                const detailUrl = `${TSE_CONFIG.API_BASE_URL}/candidatura/buscar/${ano}/${uf}/${eleicaoId}/candidato/${tseId}`;
                try {
                  candidateData = await this.fetchWithRetry(detailUrl);
                } catch {
                  candidateData = candItem as TseCandidateResponse;
                }
              }

              // Mapear candidato para entidade Prisma diretamente do item de listagem
              const prismaData = this.mapper.mapApiCandidateToPrisma(candidateData, uf, ano);

              // Fotos DESLIGADAS por padrão; ativadas somente se downloadPhotos === true
              if (options.downloadPhotos === true) {
                try {
                  const localPhotoUrl = await this.photoService.downloadAndCachePhoto(
                    tseId,
                    eleicaoId,
                    candidateData.fotoUrl,
                  );
                  if (localPhotoUrl) {
                    prismaData.photoUrl = localPhotoUrl;
                  }
                } catch (photoErr: any) {
                  this.logger.debug(`Erro no download de foto do candidato ${tseId}: ${photoErr.message}`);
                }
              }

              if (options.dryRun) {
                totalImported++;
                continue;
              }

              // Upsert idempotente no Prisma
              const existing = await this.prisma.candidate.findUnique({
                where: {
                  tseId_electionYear: {
                    tseId: prismaData.tseId,
                    electionYear: prismaData.electionYear,
                  },
                },
              });

              if (existing) {
                await this.prisma.candidate.update({
                  where: { id: existing.id },
                  data: {
                    name: prismaData.name,
                    socialName: prismaData.socialName,
                    party: prismaData.party,
                    partyNumber: prismaData.partyNumber,
                    numeroUrna: prismaData.numeroUrna,
                    cargo: prismaData.cargo,
                    level: prismaData.level,
                    candidaturaStatus: prismaData.candidaturaStatus,
                    municipality: prismaData.municipality,
                    state: prismaData.state,
                    photoUrl: prismaData.photoUrl || existing.photoUrl,
                    coalition: prismaData.coalition,
                    profileScores: prismaData.profileScores,
                    updatedAt: new Date(),
                  },
                });
                totalUpdated++;
              } else {
                await this.prisma.candidate.create({
                  data: {
                    tseId: prismaData.tseId,
                    electionYear: prismaData.electionYear,
                    name: prismaData.name,
                    socialName: prismaData.socialName,
                    party: prismaData.party,
                    partyNumber: prismaData.partyNumber,
                    numeroUrna: prismaData.numeroUrna,
                    cargo: prismaData.cargo,
                    level: prismaData.level,
                    candidaturaStatus: prismaData.candidaturaStatus,
                    municipality: prismaData.municipality,
                    state: prismaData.state,
                    cpfHash: prismaData.cpfHash,
                    photoUrl: prismaData.photoUrl,
                    coalition: prismaData.coalition,
                    profileScores: prismaData.profileScores,
                  },
                });
                totalImported++;
              }
            } catch (itemErr: any) {
              this.logger.error(`Erro ao processar candidato ${tseId} (${candItem.nomeUrna}): ${itemErr.message}`);
              errors.push({
                tseId,
                name: candItem.nomeUrna,
                uf,
                error: itemErr.message,
              });
              totalErrors++;
            }
          }
        }
      }

      const completedAt = new Date().toISOString();
      this.lastResult = {
        totalProcessed,
        totalImported,
        totalUpdated,
        totalExcluded,
        totalErrors,
        startedAt,
        completedAt,
        status: totalErrors > 0 && totalImported === 0 ? 'failed' : 'success',
        source: 'api',
        errors,
      };

      this.addLog(
        `Sincronização concluída: ${totalImported} inseridos, ${totalUpdated} atualizados, ${totalExcluded} excluídos, ${totalErrors} erros.`,
      );
      return this.lastResult;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincronização exclusiva e sob teto de fotos oficiais dos candidatos
   */
  async syncPhotosOnly(limit = 2000): Promise<TseSyncResult> {
    if (this.isSyncing) {
      throw new Error('Uma sincronização já está em andamento');
    }

    const safeLimit = Math.max(1, Math.min(limit, 2000));
    this.isSyncing = true;
    const startedAt = new Date().toISOString();
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    const errors: Array<{ tseId?: string; name?: string; uf?: string; error: string }> = [];

    this.addLog(`Iniciando job dedicado de sincronização de fotos (Teto: ${safeLimit})`);

    try {
      const candidates = await this.prisma.candidate.findMany({
        where: {
          OR: [
            { photoUrl: null },
            { NOT: { photoUrl: { startsWith: '/public/' } } },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: safeLimit,
      });

      this.logger.log(`Encontrados ${candidates.length} candidatos para cache de fotos.`);

      for (const cand of candidates) {
        totalProcessed++;
        try {
          await this.delay(TSE_CONFIG.RATE_LIMIT_DELAY_MS);
          const localPhotoUrl = await this.photoService.downloadAndCachePhoto(
            cand.tseId,
            String(cand.electionYear || TSE_CONFIG.DEFAULT_ELEICAO_ID),
            cand.photoUrl || undefined,
          );

          if (localPhotoUrl) {
            await this.prisma.candidate.update({
              where: { id: cand.id },
              data: {
                photoUrl: localPhotoUrl,
                updatedAt: new Date(),
              },
            });
            totalUpdated++;
          }

          if (totalProcessed % 100 === 0) {
            this.logger.log(`[Fotos] Processados ${totalProcessed}/${candidates.length} (Atualizados: ${totalUpdated})`);
            this.addLog(`[Fotos] Progresso: ${totalProcessed}/${candidates.length}`);
          }
        } catch (err: any) {
          totalErrors++;
          errors.push({
            tseId: cand.tseId,
            name: cand.name,
            uf: cand.state,
            error: err.message,
          });
        }
      }

      const completedAt = new Date().toISOString();
      this.lastResult = {
        totalProcessed,
        totalImported: 0,
        totalUpdated,
        totalExcluded: 0,
        totalErrors,
        startedAt,
        completedAt,
        status: totalErrors > 0 && totalUpdated === 0 ? 'failed' : 'success',
        source: 'photos',
        errors,
      };

      this.addLog(`Job de fotos finalizado: ${totalUpdated} fotos baixadas/atualizadas com sucesso.`);
      return this.lastResult;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincronização fallback via arquivo CSV / ZIP Dados Abertos do TSE
   */
  async syncFromCsv(
    csvOrZipUrl = TSE_CONFIG.FALLBACK_CSV_URL,
    options: TseSyncOptions = {},
  ): Promise<TseSyncResult> {
    if (this.isSyncing) {
      throw new Error('Uma sincronização já está em andamento');
    }

    this.isSyncing = true;
    const startedAt = new Date().toISOString();
    let totalProcessed = 0;
    let totalImported = 0;
    let totalUpdated = 0;
    let totalExcluded = 0;
    let totalErrors = 0;
    const errors: Array<{ tseId?: string; name?: string; uf?: string; error: string }> = [];

    this.addLog(`Iniciando sincronização Dados Abertos CSV (${csvOrZipUrl})`);

    try {
      const response = await axios.get(csvOrZipUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
        httpsAgent: this.httpsAgent,
        headers: {
          'User-Agent': TSE_CONFIG.USER_AGENT,
          Accept: '*/*',
        },
      });

      const buffer = Buffer.from(response.data);
      const isZip = csvOrZipUrl.endsWith('.zip') || (buffer[0] === 0x50 && buffer[1] === 0x4b);

      if (isZip) {
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
          if (entry.entryName.endsWith('.csv') && !entry.entryName.includes('BRASIL')) {
            const csvText = entry.getData().toString('latin1');
            const stream = Readable.from(csvText);
            await this.processCsvStream(stream, options, (res) => {
              totalProcessed += res.processed;
              totalImported += res.imported;
              totalUpdated += res.updated;
              totalExcluded += res.excluded;
              totalErrors += res.errors;
            });
          }
        }
      } else {
        const stream = Readable.from(buffer.toString('latin1'));
        await this.processCsvStream(stream, options, (res) => {
          totalProcessed += res.processed;
          totalImported += res.imported;
          totalUpdated += res.updated;
          totalExcluded += res.excluded;
          totalErrors += res.errors;
        });
      }

      const completedAt = new Date().toISOString();
      this.lastResult = {
        totalProcessed,
        totalImported,
        totalUpdated,
        totalExcluded,
        totalErrors,
        startedAt,
        completedAt,
        status: 'success',
        source: 'csv',
        errors,
      };

      return this.lastResult;
    } catch (err: any) {
      this.logger.error(`Falha no processamento CSV: ${err.message}`);
      this.lastResult = {
        totalProcessed,
        totalImported,
        totalUpdated,
        totalExcluded,
        totalErrors: totalErrors + 1,
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'failed',
        source: 'csv',
        errors: [{ error: err.message }],
      };
      return this.lastResult;
    } finally {
      this.isSyncing = false;
    }
  }

  private async processCsvStream(
    stream: NodeJS.ReadableStream,
    options: TseSyncOptions,
    onBatch: (res: { processed: number; imported: number; updated: number; excluded: number; errors: number }) => void,
  ): Promise<void> {
    const parser = stream.pipe(
      parse({
        delimiter: ';',
        columns: true,
        encoding: 'latin1',
        skip_empty_lines: true,
        trim: true,
      }),
    );

    let processed = 0;
    let imported = 0;
    let updated = 0;
    let excluded = 0;
    let errors = 0;

    for await (const record of parser) {
      processed++;
      const partySigla = record.SG_PARTIDO || '';

      if (this.mapper.isPartyExcluded(partySigla)) {
        excluded++;
        continue;
      }

      try {
        const prismaData = this.mapper.mapCsvRowToPrisma(record);

        if (!options.dryRun) {
          const existing = await this.prisma.candidate.findUnique({
            where: {
              tseId_electionYear: {
                tseId: prismaData.tseId,
                electionYear: prismaData.electionYear,
              },
            },
          });

          if (existing) {
            await this.prisma.candidate.update({
              where: { id: existing.id },
              data: {
                name: prismaData.name,
                socialName: prismaData.socialName,
                party: prismaData.party,
                partyNumber: prismaData.partyNumber,
                numeroUrna: prismaData.numeroUrna,
                cargo: prismaData.cargo,
                level: prismaData.level,
                candidaturaStatus: prismaData.candidaturaStatus,
                municipality: prismaData.municipality,
                state: prismaData.state,
                coalition: prismaData.coalition,
                profileScores: prismaData.profileScores,
                updatedAt: new Date(),
              },
            });
            updated++;
          } else {
            await this.prisma.candidate.create({
              data: {
                tseId: prismaData.tseId,
                electionYear: prismaData.electionYear,
                name: prismaData.name,
                socialName: prismaData.socialName,
                party: prismaData.party,
                partyNumber: prismaData.partyNumber,
                numeroUrna: prismaData.numeroUrna,
                cargo: prismaData.cargo,
                level: prismaData.level,
                candidaturaStatus: prismaData.candidaturaStatus,
                municipality: prismaData.municipality,
                state: prismaData.state,
                cpfHash: prismaData.cpfHash,
                photoUrl: prismaData.photoUrl,
                coalition: prismaData.coalition,
                profileScores: prismaData.profileScores,
              },
            });
            imported++;
          }
        } else {
          imported++;
        }
      } catch (err: any) {
        errors++;
      }

      if (processed % 100 === 0) {
        onBatch({ processed, imported, updated, excluded, errors });
        processed = 0;
        imported = 0;
        updated = 0;
        excluded = 0;
        errors = 0;
      }
    }

    if (processed > 0) {
      onBatch({ processed, imported, updated, excluded, errors });
    }
  }
}
