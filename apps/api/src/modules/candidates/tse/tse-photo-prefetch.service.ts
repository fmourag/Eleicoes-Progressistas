import { Injectable, Logger, Inject } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as https from 'https';
import { PrismaService } from '../../common/prisma.service';
import { TSE_CONFIG } from './tse.config';

@Injectable()
export class TsePhotoPrefetchService {
  private readonly logger = new Logger(TsePhotoPrefetchService.name);
  private readonly photoDir: string;
  private readonly inFlight = new Map<string, Promise<string | null>>();
  private lastDownloadTime = 0;
  private queue: Promise<void> = Promise.resolve();
  private readonly httpsAgent = new https.Agent({ keepAlive: true });

  constructor(@Inject(PrismaService) private prisma: PrismaService) {
    this.photoDir = TSE_CONFIG.PHOTO_STORAGE_DIR;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.photoDir)) {
      fs.mkdirSync(this.photoDir, { recursive: true });
    }
  }

  public hasLocal(tseId: string): boolean {
    if (!tseId) return false;
    const localFilePath = path.join(this.photoDir, `tse_${tseId}.jpg`);
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath);
      return stats.size > 1024;
    }
    return false;
  }

  public isValidImage(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) return false;
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
    // WEBP: RIFF....WEBP
    if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return true;
    }
    return false;
  }

  /**
   * Prefetch assíncrono (fire-and-forget).
   * Deduplica chamadas concorrentes ao mesmo tseId e respeita intervalo mínimo de 1000ms.
   */
  public prefetch(tseId: string, remoteUrl?: string): void {
    if (!tseId || !/^\d{11,13}$/.test(tseId)) return;
    if (this.hasLocal(tseId)) return;

    if (this.inFlight.has(tseId)) return;

    const task = this.scheduleDownload(tseId, remoteUrl);
    this.inFlight.set(tseId, task);

    task
      .finally(() => {
        this.inFlight.delete(tseId);
      })
      .catch((err) => {
        this.logger.debug(`Prefetch failed for candidate ${tseId}: ${err?.message}`);
      });
  }

  public scheduleDownload(tseId: string, remoteUrl?: string): Promise<string | null> {
    const nextInQueue = this.queue.then(async () => {
      const now = Date.now();
      const elapsed = now - this.lastDownloadTime;
      const waitMs = Math.max(0, 1000 - elapsed);
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
      this.lastDownloadTime = Date.now();
      return this.executeDownload(tseId, remoteUrl);
    });

    this.queue = nextInQueue.then(() => {}).catch(() => {});
    return nextInQueue;
  }

  public async executeDownload(tseId: string, remoteUrl?: string): Promise<string | null> {
    const filename = `tse_${tseId}.jpg`;
    const localFilePath = path.join(this.photoDir, filename);
    const publicUrl = `${TSE_CONFIG.PHOTO_PUBLIC_PATH}/${filename}`;

    const downloadUrl =
      remoteUrl ||
      `${TSE_CONFIG.PHOTO_BASE_URL}/${TSE_CONFIG.DEFAULT_ELEICAO_ID}/${tseId}`;

    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        httpsAgent: this.httpsAgent,
        headers: {
          'User-Agent': TSE_CONFIG.USER_AGENT,
          Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
        },
      });

      const buffer = Buffer.from(response.data);

      if (!this.isValidImage(buffer)) {
        this.logger.warn(`Photo for ${tseId} is not a valid image format (magic bytes mismatch).`);
        return null;
      }

      fs.writeFileSync(localFilePath, buffer);

      // Em sucesso, atualiza candidato no banco
      try {
        await this.prisma.candidate.updateMany({
          where: { tseId },
          data: { photoUrl: publicUrl },
        });
      } catch (dbErr: any) {
        this.logger.debug(`Could not update photoUrl in DB for ${tseId}: ${dbErr?.message}`);
      }

      return publicUrl;
    } catch (error: any) {
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch {}
      }
      return null;
    }
  }
}
