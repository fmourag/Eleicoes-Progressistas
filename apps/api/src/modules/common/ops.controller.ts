import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { OpsModeService, OperationMode } from './ops-mode.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('ops')
export class OpsController {
  constructor(private readonly opsModeService: OpsModeService) {}

  @Get('mode')
  getMode(@Query('date') date?: string, @Query('deficit') deficit?: string) {
    const refDate = date ? new Date(date) : undefined;
    const isDeficit = deficit !== undefined ? deficit === 'true' : undefined;
    return this.opsModeService.getMode(refDate, isDeficit);
  }

  @UseGuards(AdminGuard)
  @Post('mode')
  setMode(@Body() body: { mode: OperationMode; reason?: string }) {
    return this.opsModeService.setMode(body.mode, body.reason);
  }
}
