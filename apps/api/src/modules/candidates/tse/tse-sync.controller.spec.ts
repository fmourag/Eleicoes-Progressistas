import { TseSyncController } from './tse-sync.controller';
import { TseSyncService } from './tse-sync.service';
import { UnauthorizedException } from '@nestjs/common';

describe('TseSyncController', () => {
  let controller: TseSyncController;
  let syncServiceMock: any;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ADMIN_SECRET;
    delete process.env.ADMIN_FEEDBACK_TOKEN;
    delete process.env.CRON_SECRET;

    syncServiceMock = {
      syncFromApi: jest.fn().mockResolvedValue({ totalProcessed: 10, totalImported: 10 }),
      syncPhotosOnly: jest.fn().mockResolvedValue({ totalProcessed: 5, totalUpdated: 5 }),
      syncFromCsv: jest.fn().mockResolvedValue({ totalProcessed: 20, totalImported: 20 }),
      getSyncStats: jest.fn().mockResolvedValue({ totalCandidates: 100 }),
      getLogs: jest.fn().mockReturnValue([]),
    };

    controller = new TseSyncController(syncServiceMock as unknown as TseSyncService);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should fail-closed with 401 when no secrets are set, even with common dev tokens', async () => {
    await expect(controller.triggerSyncAll('dev-secret')).rejects.toThrow(UnauthorizedException);
    await expect(controller.triggerSyncAll('admin123')).rejects.toThrow(UnauthorizedException);
    await expect(controller.triggerSyncAll(undefined)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow valid admin header when ADMIN_SECRET is set', async () => {
    process.env.ADMIN_SECRET = 'super-secret-key-32-chars-long!!';
    const result = await controller.triggerSyncAll('super-secret-key-32-chars-long!!');
    expect(result).toBeDefined();
    expect(syncServiceMock.syncFromApi).toHaveBeenCalled();
  });

  it('should still reject invalid header tokens when ADMIN_SECRET is set', async () => {
    process.env.ADMIN_SECRET = 'super-secret-key-32-chars-long!!';
    await expect(controller.triggerSyncAll('admin123')).rejects.toThrow(UnauthorizedException);
    await expect(controller.triggerSyncAll('dev-secret')).rejects.toThrow(UnauthorizedException);
  });

  it('should ignore query parameter tokens and require header', async () => {
    process.env.ADMIN_SECRET = 'super-secret-key-32-chars-long!!';
    // Sem header fornecido (adminToken = undefined)
    await expect(controller.triggerSyncAll(undefined)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow valid cron secret on triggerScheduledSync', async () => {
    process.env.CRON_SECRET = 'my-cron-secret';
    const result = await controller.triggerScheduledSync('my-cron-secret');
    expect(result).toBeDefined();
    expect(syncServiceMock.syncFromApi).toHaveBeenCalled();
  });

  it('should reject invalid cron secret on triggerScheduledSync', async () => {
    process.env.CRON_SECRET = 'my-cron-secret';
    await expect(controller.triggerScheduledSync('wrong-secret')).rejects.toThrow(UnauthorizedException);
    await expect(controller.triggerScheduledSync(undefined)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow photo sync with clamped limit parameter', async () => {
    process.env.ADMIN_SECRET = 'super-secret-key-32-chars-long!!';
    await controller.triggerSyncPhotos('super-secret-key-32-chars-long!!', undefined, '500');
    expect(syncServiceMock.syncPhotosOnly).toHaveBeenCalledWith(500);
  });
});
