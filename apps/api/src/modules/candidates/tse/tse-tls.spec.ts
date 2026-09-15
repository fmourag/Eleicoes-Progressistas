import { TseSyncService } from './tse-sync.service';
import { TsePhotoService } from './tse-photo.service';
import { TseMapperService } from './tse-mapper.service';

describe('TSE TLS Security Verification', () => {
  it('TseSyncService should enforce strict TLS verification (rejectUnauthorized !== false)', () => {
    const prismaMock: any = {};
    const mapperMock = new TseMapperService();
    const photoMock: any = {};

    const service = new TseSyncService(prismaMock, mapperMock, photoMock);
    const agent = (service as any).httpsAgent;

    expect(agent).toBeDefined();
    expect(agent.options.rejectUnauthorized).not.toBe(false);
  });

  it('TsePhotoService should enforce strict TLS verification (rejectUnauthorized !== false)', () => {
    const photoService = new TsePhotoService();
    const agent = (photoService as any).httpsAgent;

    expect(agent).toBeDefined();
    expect(agent.options.rejectUnauthorized).not.toBe(false);
  });
});
