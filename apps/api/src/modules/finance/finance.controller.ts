import { Controller, Get, Post, Body, Query, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { timingSafeEqual } from 'node:crypto';
import { FinanceService } from './finance.service';
import { PixWebhookDto } from './dto/pix-webhook.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('costs')
  async getCosts(@Query('date') date?: string) {
    const refDate = date ? new Date(date) : undefined;
    return this.financeService.getCostsBreakdown(refDate);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('pix/webhook')
  async handlePixWebhook(
    @Body() dto: PixWebhookDto,
    @Headers('x-webhook-secret') secretHeader?: string,
  ) {
    const configuredSecret = process.env.PIX_WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    if (configuredSecret) {
      const incomingSecret = secretHeader || dto.secret || '';
      const secretBuf = Buffer.from(configuredSecret);
      const incomingBuf = Buffer.from(incomingSecret);

      if (secretBuf.length !== incomingBuf.length || !timingSafeEqual(secretBuf, incomingBuf)) {
        throw new HttpException('Assinatura do webhook inválida', HttpStatus.UNAUTHORIZED);
      }
    } else if (isProduction) {
      // Em produção, recusa chamadas se o webhook não estiver com chave criptográfica configurada
      throw new HttpException('Webhook de pagamentos não configurado em produção', HttpStatus.SERVICE_UNAVAILABLE);
    }

    return this.financeService.recordDonation(dto);
  }

  @Get('transparency')
  async getTransparency(@Query('date') date?: string) {
    const refDate = date ? new Date(date) : undefined;
    return this.financeService.getTransparency(refDate);
  }
}
