import { TseSyncService } from './tse-sync.service';
import { TseMapperService } from './tse-mapper.service';
import { TsePhotoService } from './tse-photo.service';
import { PrismaService } from '../../common/prisma.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TseSyncService', () => {
  let service: TseSyncService;
  let prismaMock: any;
  let mapperService: TseMapperService;
  let photoServiceMock: any;

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock = {
      candidate: {
        count: jest.fn().mockResolvedValue(10),
        groupBy: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'cand-1',
            tseId: '1001',
            name: 'Candidato 1',
            state: 'DF',
            electionYear: 2026,
            photoUrl: null,
          },
        ]),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    mapperService = new TseMapperService();
    photoServiceMock = {
      downloadAndCachePhoto: jest.fn().mockResolvedValue('/public/candidates/tse_1001.jpg'),
      hasLocalPhoto: jest.fn().mockReturnValue(true),
    };

    service = new TseSyncService(
      prismaMock as unknown as PrismaService,
      mapperService,
      photoServiceMock as unknown as TsePhotoService,
    );
  });

  it('should get sync stats successfully', async () => {
    const stats = await service.getSyncStats();
    expect(stats.totalCandidates).toBe(10);
    expect(stats.lastSyncStatus).toBe('idle');
  });

  it('should return empty logs initially', () => {
    const logs = service.getLogs();
    expect(Array.isArray(logs)).toBe(true);
  });

  it('should perform syncFromApi using ONLY list payload without fetching details, and photos OFF by default', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        candidatos: [
          {
            id: '1001',
            nomeUrna: 'CANDIDATO UM',
            numero: 13,
            partido: { sigla: 'PT' },
            cargo: { codigo: 8, nome: 'Deputado Distrital' },
          },
          {
            id: '1002',
            nomeUrna: 'CANDIDATO DOIS',
            numero: 50,
            partido: { sigla: 'PSOL' },
            cargo: { codigo: 8, nome: 'Deputado Distrital' },
          },
        ],
      },
    });

    const result = await service.syncFromApi({
      ufs: ['DF'],
      cargos: [{ codigo: 8, nome: 'Deputado Distrital' }],
      dryRun: true,
    });

    expect(result.status).toBe('success');
    expect(result.totalProcessed).toBe(2);
    expect(result.totalImported).toBe(2);

    // ZERO chamadas de detalhe — apenas 1 chamada para a listagem
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    // Fotos DESLIGADAS por padrão
    expect(photoServiceMock.downloadAndCachePhoto).not.toHaveBeenCalled();
  });

  it('should download photos during syncFromApi ONLY when downloadPhotos is explicitly true', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        candidatos: [
          {
            id: '1001',
            nomeUrna: 'CANDIDATO UM',
            numero: 13,
            partido: { sigla: 'PT' },
            cargo: { codigo: 8, nome: 'Deputado Distrital' },
            fotoUrl: 'http://tse.jus.br/foto1.jpg',
          },
        ],
      },
    });

    const result = await service.syncFromApi({
      ufs: ['DF'],
      cargos: [{ codigo: 8, nome: 'Deputado Distrital' }],
      downloadPhotos: true,
      dryRun: true,
    });

    expect(result.status).toBe('success');
    expect(photoServiceMock.downloadAndCachePhoto).toHaveBeenCalledTimes(1);
    expect(photoServiceMock.downloadAndCachePhoto).toHaveBeenCalledWith(
      '1001',
      expect.any(String),
      'http://tse.jus.br/foto1.jpg',
    );
  });

  it('should execute syncPhotosOnly up to the specified limit', async () => {
    const result = await service.syncPhotosOnly(5);
    expect(result.status).toBe('success');
    expect(prismaMock.candidate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 }),
    );
    expect(photoServiceMock.downloadAndCachePhoto).toHaveBeenCalled();
    expect(prismaMock.candidate.update).toHaveBeenCalled();
  });
});
