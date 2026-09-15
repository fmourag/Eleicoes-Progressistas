import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as https from 'https';
import { TSE_CONFIG } from './tse.config';

@Injectable()
export class TsePhotoService {
  private readonly logger = new Logger(TsePhotoService.name);
  private readonly photoDir: string;
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
  });

  constructor() {
    this.photoDir = TSE_CONFIG.PHOTO_STORAGE_DIR;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.photoDir)) {
      fs.mkdirSync(this.photoDir, { recursive: true });
      this.logger.log(`Created photo cache directory: ${this.photoDir}`);
    }
  }

  /**
   * Valida se o buffer possui o magic number de JPEG (FF D8 FF)
   */
  public isValidJpeg(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 3) return false;
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  /**
   * Baixa e faz cache local da foto do candidato a partir da API TSE ou URL fornecida.
   * Retorna a URL pública relativa servida pelo NestJS (ex: /public/candidates/tse_123456.jpg)
   */
  async downloadAndCachePhoto(
    tseId: string,
    eleicaoId: string,
    customUrl?: string,
  ): Promise<string | null> {
    const filename = `tse_${tseId}.jpg`;
    const localFilePath = path.join(this.photoDir, filename);
    const publicUrl = `${TSE_CONFIG.PHOTO_PUBLIC_PATH}/${filename}`;

    // Se já existe localmente e tamanho > 1KB, aproveita cache
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath);
      if (stats.size > 1024) {
        return publicUrl;
      }
    }

    const downloadUrl =
      customUrl ||
      `${TSE_CONFIG.PHOTO_BASE_URL}/${eleicaoId}/${tseId}`;

    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        httpsAgent: this.httpsAgent,
        headers: {
          'User-Agent': TSE_CONFIG.USER_AGENT,
          Accept: 'image/jpeg,image/png,image/*;q=0.8',
        },
      });

      const buffer = Buffer.from(response.data);

      if (!this.isValidJpeg(buffer)) {
        this.logger.warn(
          `Candidate ${tseId} photo from ${downloadUrl} is not a valid JPEG (magic bytes mismatch).`,
        );
        return null;
      }

      fs.writeFileSync(localFilePath, buffer);
      return publicUrl;
    } catch (error: any) {
      this.logger.debug(
        `Failed to download photo for candidate ${tseId} (${downloadUrl}): ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Retorna se a foto do candidato já está em cache local
   */
  hasLocalPhoto(tseId: string): boolean {
    const localFilePath = path.join(this.photoDir, `tse_${tseId}.jpg`);
    return fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 1024;
  }
}
