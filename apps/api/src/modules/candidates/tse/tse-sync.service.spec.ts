import { TseSyncService } from './tse-sync.service';
import { TseMapperService } from './tse-mapper.service';
import { TsePhotoService } from './tse-photo.service';
import { PrismaService } from '../../common/prisma.service';

describe('TseSyncService', () => {
  let service: TseSyncService;
  let prismaMock: any;
  let mapperService: TseMapperService;
  let photoServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      candidate: {
        count: jest.fn().mockResolvedValue(10),
        groupBy: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    mapperService = new TseMapperService();
    photoServiceMock = {
      downloadAndCachePhoto: jest.fn().mockResolvedValue('/public/candidates/tse_123.jpg'),
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
});
