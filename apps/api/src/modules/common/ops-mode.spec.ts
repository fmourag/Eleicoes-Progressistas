import { OpsModeService } from './ops-mode.service';
import { OpsModeGuard } from './ops-mode.guard';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

describe('OpsModeService & OpsModeGuard', () => {
  let service: OpsModeService;
  let guard: OpsModeGuard;

  beforeEach(() => {
    service = new OpsModeService();
    service.resetManualMode();
    delete process.env.APP_MODE;
    guard = new OpsModeGuard(service);
  });

  describe('OpsModeService', () => {
    it('should default to full mode prior to sunset date', () => {
      const info = service.getMode(new Date(2026, 8, 1)); // 01/09/2026
      expect(info.mode).toBe('full');
    });

    it('should stay full after sunset date if there is NO deficit', () => {
      const afterElection = new Date(2026, 10, 1); // 01/11/2026
      const info = service.getMode(afterElection, false);
      expect(info.mode).toBe('full');
    });

    it('should automatically transition to archive mode after 26/10/2026 if deficit exists', () => {
      const afterElection = new Date(2026, 10, 1); // 01/11/2026
      const info = service.getMode(afterElection, true);
      expect(info.mode).toBe('archive');
      expect(info.reason).toContain('pôr do sol');
    });

    it('should respect manual mode overrides', () => {
      service.setMode('watchdog', 'Manutenção eleitoral');
      const info = service.getMode();
      expect(info.mode).toBe('watchdog');
      expect(info.reason).toBe('Manutenção eleitoral');
    });
  });

  describe('OpsModeGuard (410 Gone)', () => {
    function createMockContext(path: string, method = 'GET'): ExecutionContext {
      return {
        switchToHttp: () => ({
          getRequest: () => ({ path, method }),
        }),
      } as any;
    }

    it('should allow all requests when mode is full', () => {
      service.setMode('full');
      expect(guard.canActivate(createMockContext('/api/matching/compute', 'POST'))).toBe(true);
      expect(guard.canActivate(createMockContext('/api/cola/pdf', 'GET'))).toBe(true);
    });

    it('should allow health, finance and ops endpoints even in archive mode', () => {
      service.setMode('archive');
      expect(guard.canActivate(createMockContext('/api/health'))).toBe(true);
      expect(guard.canActivate(createMockContext('/api/ops/mode'))).toBe(true);
      expect(guard.canActivate(createMockContext('/api/finance/costs'))).toBe(true);
    });

    it('should throw 410 on matching/compute and cola in watchdog mode', () => {
      service.setMode('watchdog');
      expect(() => guard.canActivate(createMockContext('/api/matching/compute', 'POST'))).toThrow(HttpException);
      expect(() => guard.canActivate(createMockContext('/api/cola/pdf', 'GET'))).toThrow(HttpException);
      expect(guard.canActivate(createMockContext('/api/candidates', 'GET'))).toBe(true);
    });

    it('should throw 410 on dynamic operations in archive mode', () => {
      service.setMode('archive');
      expect(() => guard.canActivate(createMockContext('/api/matching/compute', 'POST'))).toThrow(HttpException);
      expect(() => guard.canActivate(createMockContext('/api/matching/rank', 'POST'))).toThrow(HttpException);
      expect(() => guard.canActivate(createMockContext('/api/cola/pdf', 'GET'))).toThrow(HttpException);
      expect(() => guard.canActivate(createMockContext('/api/candidates/sync-tse', 'POST'))).toThrow(HttpException);
    });
  });
});
