import { TsePhotoService } from './tse-photo.service';
import * as fs from 'fs';
import * as path from 'path';

describe('TsePhotoService', () => {
  let photoService: TsePhotoService;

  beforeEach(() => {
    photoService = new TsePhotoService();
  });

  it('should validate JPEG magic bytes correctly', () => {
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const invalidJpeg = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG

    expect(photoService.isValidJpeg(validJpeg)).toBe(true);
    expect(photoService.isValidJpeg(invalidJpeg)).toBe(false);
    expect(photoService.isValidJpeg(Buffer.from([]))).toBe(false);
  });

  it('should check if local photo exists', () => {
    const exists = photoService.hasLocalPhoto('non_existent_id');
    expect(exists).toBe(false);
  });
});
