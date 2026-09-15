import { TseSyncController } from './tse-sync.controller';
import { TseSyncService } from './tse-sync.service';
import { TSE_CONFIG } from './tse.config';
import { UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('TSE Hardening v2.2.3', () => {
  it('não deve ter rejectUnauthorized: false em nenhum arquivo do módulo', () => {
    const files = ['tse-sync.service.ts', 'tse-photo.service.ts', 'tse-http.service.ts'];
    const tseDir = path.join(process.cwd(), 'apps/api/src/modules/candidates/tse');
    files.forEach((f) => {
      const p = path.join(tseDir, f);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        expect(content).not.toMatch(/rejectUnauthorized\s*:\s*false/);
      }
    });
  });

  it('USER_AGENT deve ser identificável (sem Mozilla/Chrome)', () => {
    expect(TSE_CONFIG.USER_AGENT).toMatch(/^EleicoesProgressistas\//);
    expect(TSE_CONFIG.USER_AGENT).toMatch(/fmourag@gmail\.com/);
    expect(TSE_CONFIG.USER_AGENT).not.toMatch(/Mozilla|Chrome/i);
  });

  it('controller deve rejeitar dev-secret e admin123 mesmo como header válido', async () => {
    const oldSecret = process.env.ADMIN_SECRET;
    try {
      process.env.ADMIN_SECRET = 'test-real-secret-xyz';
      const mockSyncService = {
        syncFromApi: jest.fn().mockResolvedValue({ status: 'success' }),
      } as unknown as TseSyncService;

      const controller = new TseSyncController(mockSyncService);

      await expect(controller.triggerSyncAll('admin123')).rejects.toThrow(UnauthorizedException);
      await expect(controller.triggerSyncAll('dev-secret')).rejects.toThrow(UnauthorizedException);
      await expect(controller.triggerSyncAll('test-real-secret-xyz')).resolves.toBeDefined();
    } finally {
      process.env.ADMIN_SECRET = oldSecret;
    }
  });
});
