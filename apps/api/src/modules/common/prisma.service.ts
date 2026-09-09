import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import * as path from 'path';
import * as fs from 'fs';

function getPrismaOptions() {
  let url = process.env.DATABASE_URL;
  if (url && url.startsWith('file:')) {
    const rawPath = url.replace(/^file:/, '');
    let absPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
    if (!fs.existsSync(absPath)) {
      const candidate1 = path.resolve(process.cwd(), 'apps/api', rawPath);
      const candidate2 = path.resolve(__dirname, '../../../', rawPath);
      if (fs.existsSync(candidate1)) {
        absPath = candidate1;
      } else if (fs.existsSync(candidate2)) {
        absPath = candidate2;
      }
    }
    url = `file:${absPath.replace(/\\/g, '/')}`;
    return {
      datasources: {
        db: { url },
      },
    };
  }
  return undefined;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super(getPrismaOptions());
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      this.logger.warn(`Prisma DB offline - sem Docker? ${(e as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
