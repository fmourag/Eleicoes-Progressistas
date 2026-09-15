import { TsePhotoPrefetchService } from './tse-photo-prefetch.service';
import axios from 'axios';
import * as fs from 'fs';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TsePhotoPrefetchService', () => {
  let service: TsePhotoPrefetchService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = {
      candidate: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    service = new TsePhotoPrefetchService(mockPrisma);
  });

  describe('Magic Bytes Validation', () => {
    it('should validate JPEG, PNG, WEBP and reject invalid bytes', () => {
      const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
      const webp = Buffer.concat([
        Buffer.from('RIFF', 'ascii'),
        Buffer.from([0, 0, 0, 0]),
        Buffer.from('WEBP', 'ascii'),
      ]);
      const html = Buffer.from('<html><body>Error 404</body></html>', 'utf-8');
      const empty = Buffer.from([]);

      expect(service.isValidImage(jpeg)).toBe(true);
      expect(service.isValidImage(png)).toBe(true);
      expect(service.isValidImage(webp)).toBe(true);
      expect(service.isValidImage(html)).toBe(false);
      expect(service.isValidImage(empty)).toBe(false);
    });
  });

  describe('Concurrent deduplication', () => {
    it('should deduplicate concurrent prefetch calls for the same tseId into 1 download', async () => {
      jest.spyOn(service, 'hasLocal').mockReturnValue(false);
      const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      mockedAxios.get.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: validJpeg } as any), 50)
          )
      );

      // Call prefetch twice concurrently
      service.prefetch('999001600001');
      service.prefetch('999001600001');

      // Wait for completion
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Invalid magic bytes handling', () => {
    it('should not update candidate in database if payload fails magic bytes check', async () => {
      const invalidHtml = Buffer.from('<html>Error 500</html>', 'utf-8');
      mockedAxios.get.mockResolvedValueOnce({ data: invalidHtml });

      const result = await service.executeDownload('280001600002');

      expect(result).toBeNull();
      expect(mockPrisma.candidate.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('Rate limiting queue', () => {
    it('should enforce minimum 1000ms spacing between sequential downloads', async () => {
      const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      mockedAxios.get.mockResolvedValue({ data: validJpeg });

      const startTime = Date.now();
      const p1 = service.scheduleDownload('280001600003');
      const p2 = service.scheduleDownload('280001600004');

      await Promise.all([p1, p2]);
      const totalElapsed = Date.now() - startTime;

      expect(totalElapsed).toBeGreaterThanOrEqual(950);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});
