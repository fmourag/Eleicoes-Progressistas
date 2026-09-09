import { Controller, Get, Post, Patch, Param, Query, Headers, Body, UseGuards, Inject } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdsService } from './ads.service';
import { ContextualAdQueryDto } from './dto/contextual-ad-query.dto';
import { CreateAdvertiserDto } from './dto/create-advertiser.dto';
import { ApplyAdvertiserDto } from './dto/apply-advertiser.dto';
import { ReviewAdvertiserDto } from './dto/review-advertiser.dto';
import { ContractAdvertiserDto } from './dto/contract-advertiser.dto';
import { AdminGuard } from '../auth/admin.guard';
import { createHash } from 'node:crypto';

@Controller('ads')
export class AdsController {
  constructor(@Inject(AdsService) private adsService: AdsService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('apply')
  async apply(@Body() dto: ApplyAdvertiserDto) {
    return this.adsService.apply(dto);
  }

  @Get('activation')
  async getActivation(@Query('date') date?: string) {
    const simDate = date ? new Date(date) : undefined;
    return this.adsService.getActivationStatus(simDate);
  }

  @Get('contextual')
  async getContextual(
    @Query() query: ContextualAdQueryDto,
    @Headers('x-device-id') deviceId?: string,
  ) {
    if (deviceId) {
      const cleanDeviceId = deviceId.trim().slice(0, 128);
      const salt = process.env.DEVICE_HASH_SALT || 'default-dev-salt-key';
      const deviceHash = createHash('sha256').update(cleanDeviceId + salt).digest('hex');
      const optedOut = await this.adsService.hasOptedOut(deviceHash);
      if (optedOut) return { optedOut: true, ad: null };
    }

    const pillar = query.pillar || query.pilar;
    const simDate = query.date ? new Date(query.date) : undefined;
    const ad = await this.adsService.getContextualAd(query.screen, pillar, simDate);
    return { optedOut: false, ad };
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('click/:id')
  async recordClick(@Param('id') id: string) {
    const cleanId = id.trim().slice(0, 64);
    await this.adsService.recordClick(cleanId);
    return { success: true };
  }

  @Get('transparency')
  async getTransparency() {
    return this.adsService.getTransparencyReport();
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('opt-out')
  async optOut(@Headers('x-device-id') deviceId?: string) {
    const idToHash = deviceId ? deviceId.trim().slice(0, 128) : 'anonymous-device';
    const salt = process.env.DEVICE_HASH_SALT || 'default-dev-salt-key';
    const deviceHash = createHash('sha256').update(idToHash + salt).digest('hex');
    await this.adsService.optOut(deviceHash);
    return { success: true, message: 'Anúncios ocultos por 30 dias' };
  }

  @UseGuards(AdminGuard)
  @Get('admin/applications')
  async getApplications() {
    return this.adsService.getApplications();
  }

  @UseGuards(AdminGuard)
  @Patch('admin/advertisers/:id/review')
  async reviewAdvertiser(
    @Param('id') id: string,
    @Body() dto: ReviewAdvertiserDto,
  ) {
    return this.adsService.reviewAdvertiser(id, dto);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/advertisers/:id/contract')
  async contractAdvertiser(
    @Param('id') id: string,
    @Body() dto: ContractAdvertiserDto,
  ) {
    return this.adsService.contractAdvertiser(id, dto);
  }

  @UseGuards(AdminGuard)
  @Post('admin/advertisers')
  async createAdvertiser(@Body() dto: CreateAdvertiserDto) {
    return this.adsService.createAdvertiser(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/advertisers/:id/approve')
  async approveAdvertiser(@Param('id') id: string) {
    return this.adsService.toggleApproval(id);
  }

  @UseGuards(AdminGuard)
  @Get('admin/report')
  async getAdminReport() {
    return this.adsService.getAdminReport();
  }
}
