import { Controller, Post, Get, Patch, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PublicApiService } from './public-api.service';
import { CreatePublicKeyDto } from './dto/create-public-key.dto';
import { AdminCreateKeyDto } from './dto/admin-create-key.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('public')
export class PublicKeysController {
  constructor(
    @Inject(PublicApiService)
    private readonly publicApiService: PublicApiService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // Self-Service FREE — 5 requisições por hora + honeypot anti-bot
  // ─────────────────────────────────────────────────────────
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @Post('keys')
  async createPublicKey(@Body() dto: CreatePublicKeyDto) {
    return this.publicApiService.createSelfServeKey(dto);
  }

  // ─────────────────────────────────────────────────────────
  // Gestão Admin (Tier PAID / Manutenção) — Protegido por AdminGuard
  // ─────────────────────────────────────────────────────────
  @UseGuards(AdminGuard)
  @Post('admin/keys')
  async adminCreateKey(@Body() dto: AdminCreateKeyDto) {
    return this.publicApiService.adminCreateKey(dto);
  }

  @UseGuards(AdminGuard)
  @Get('admin/keys')
  async adminListKeys() {
    return this.publicApiService.adminListKeys();
  }

  @UseGuards(AdminGuard)
  @Patch('admin/keys/:id/revoke')
  async adminRevokeKey(@Param('id') id: string) {
    return this.publicApiService.adminRevokeKey(id);
  }
}
