import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Header,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import * as crypto from 'crypto';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

function isValidAdmin(provided?: string): boolean {
  if (!provided || typeof provided !== 'string') return false;
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_FEEDBACK_TOKEN || 'dev-secret';
  const providedBuf = Buffer.from(provided);
  const secretBuf = Buffer.from(secret);
  if (providedBuf.length !== secretBuf.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(providedBuf, secretBuf);
  } catch {
    return false;
  }
}

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Get('dashboard')
  async getDashboard(
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
  ) {
    const token = adminToken || adminKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }
    return this.feedbackService.getDashboard();
  }

  @Get('export.csv')
  async exportCsv(
    @Res() res: Response,
    @Headers('x-admin-token') adminToken?: string,
    @Headers('x-admin-key') adminKey?: string,
  ) {
    const token = adminToken || adminKey;
    if (!isValidAdmin(token)) {
      throw new UnauthorizedException('Token administrativo inválido ou ausente.');
    }

    const csvData = await this.feedbackService.getExportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="feedback-export-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvData);
  }
}
