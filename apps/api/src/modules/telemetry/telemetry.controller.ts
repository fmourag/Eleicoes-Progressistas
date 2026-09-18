import { Controller, Post, Get, Body, Req, Res, Query, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { TelemetryService } from './telemetry.service';
import { RecordAccessDto, RecordShareDto } from './dto/record-event.dto';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('access')
  async recordAccess(@Body() dto: RecordAccessDto, @Req() req: Request) {
    const userAgent = (req.headers['user-agent'] as string) || '';
    const detectedDevice = this.telemetryService.detectDeviceType(userAgent);
    const device = dto.deviceType || detectedDevice;
    const referrer = dto.referrer || (req.headers['referer'] as string) || undefined;

    await this.telemetryService.recordEvent(dto.eventType || 'WEB_VISIT', device, referrer);
    return { ok: true };
  }

  @Post('share')
  async recordShare(@Body() dto: RecordShareDto, @Req() req: Request) {
    const userAgent = (req.headers['user-agent'] as string) || '';
    const detectedDevice = this.telemetryService.detectDeviceType(userAgent);
    const device = dto.deviceType || detectedDevice;
    const eventType = 'SHARE_' + (dto.channel || 'GENERAL').toUpperCase();

    await this.telemetryService.recordEvent(eventType, device);
    return { ok: true };
  }

  @Get('dashboard')
  async getDashboardData(@Query('days') days?: string) {
    const parsedDays = days ? parseInt(days, 10) : 30;
    return this.telemetryService.getDashboardData(isNaN(parsedDays) ? 30 : parsedDays);
  }

  @Get('csv')
  async exportCsv(@Res() res: Response) {
    const data = await this.telemetryService.getDashboardData(90);
    let csv = 'Data,Acessos_Web,Downloads_APK,Compartilhamentos\n';
    for (const row of data.dailyHistory) {
      csv += row.date + ',' + row.webVisits + ',' + row.apkDownloads + ',' + row.shares + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="eleicoes-progressistas-metricas.csv"');
    return res.status(HttpStatus.OK).send(csv);
  }
}
