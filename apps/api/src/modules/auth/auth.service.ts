import { Injectable, Logger , Inject } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  /**
   * Sync a Supabase auth user into our local DB.
   * Called after the first authenticated request from a new user.
   */
  async syncUser(data: {
    id: string;
    email: string;
    cep: string;
    municipality: string;
    state: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { id: data.id } });
    if (existing) return existing;

    this.logger.log(`Syncing new user: ${data.email}`);
    return this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        passwordHash: 'supabase-managed',
        cep: data.cep,
        municipality: data.municipality,
        state: data.state,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
