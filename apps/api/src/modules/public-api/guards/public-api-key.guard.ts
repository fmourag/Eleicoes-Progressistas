import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { OpsModeService } from '../../common/ops-mode.service';
import * as crypto from 'crypto';

@Injectable()
export class PublicApiKeyGuard implements CanActivate {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(OpsModeService)
    private readonly opsModeService: OpsModeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    // 1. Respeitar ops-mode: se modo archive, todos os endpoints retornam 410 GONE com pointer para dist-archive
    const { mode } = this.opsModeService.getMode();
    if (mode === 'archive') {
      throw new HttpException(
        {
          statusCode: HttpStatus.GONE,
          error: 'Gone',
          message: 'Sistema em modo archive histórico pós-eleitoral. Baixe os dados abertos estáticos em /dist-archive',
          manifestUrl: '/dist-archive/manifest.json',
        },
        HttpStatus.GONE,
      );
    }

    // 2. Extrai chave do header x-api-key
    const rawKey = request.headers['x-api-key'];
    if (!rawKey || typeof rawKey !== 'string') {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
          message: 'Chave de API ausente. Envie sua chave no header x-api-key. Solicite uma chave gratuita em /api-publico.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const key = rawKey.trim();
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    // 3. Busca no banco de dados por hash
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
    });

    if (!apiKey) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
          message: 'Chave de API inválida.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 4. Comparação em tempo constante (mitigando timing attacks)
    const providedBuffer = Buffer.from(keyHash, 'hex');
    const storedBuffer = Buffer.from(apiKey.keyHash, 'hex');
    if (
      providedBuffer.length !== storedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, storedBuffer)
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
          message: 'Chave de API inválida.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 5. Verifica status ativo
    if (!apiKey.isActive) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'Forbidden',
          message: 'Chave de API inativa ou revogada.',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // 6. Verifica expiração (tier PAID)
    const now = new Date();
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < now) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'Forbidden',
          message: 'Chave de API expirada. Renove sua assinatura mensal via contrato PIX em /api-publico.',
          upgrade: '/api-publico',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // 7. Rate Limiting Diário por Chave
    const lastReset = new Date(apiKey.usageResetAt);
    const isDifferentDay =
      now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
      now.getUTCMonth() !== lastReset.getUTCMonth() ||
      now.getUTCDate() !== lastReset.getUTCDate() ||
      now.getTime() - lastReset.getTime() >= 24 * 60 * 60 * 1000;

    let currentUsage = isDifferentDay ? 0 : apiKey.usageCount;

    // Fim do dia UTC para o cabeçalho X-RateLimit-Reset
    const endOfDay = new Date(now);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const resetTimestamp = Math.floor(endOfDay.getTime() / 1000);

    if (currentUsage >= apiKey.dailyLimit) {
      response.setHeader('X-RateLimit-Limit', apiKey.dailyLimit.toString());
      response.setHeader('X-RateLimit-Remaining', '0');
      response.setHeader('X-RateLimit-Reset', resetTimestamp.toString());

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Limite diário de requisições excedido (${apiKey.dailyLimit} req/dia). Atualize para o tier PAID (10.000 req/dia) via contrato PIX.`,
          upgrade: '/api-publico',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Incrementa uso e atualiza timestamp de reset se mudou o dia
    const newUsage = currentUsage + 1;
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        usageCount: isDifferentDay ? 1 : { increment: 1 },
        usageResetAt: isDifferentDay ? now : undefined,
      },
    });

    const remaining = Math.max(0, apiKey.dailyLimit - newUsage);

    // 8. Injeta headers de rate limit na resposta HTTP
    response.setHeader('X-RateLimit-Limit', apiKey.dailyLimit.toString());
    response.setHeader('X-RateLimit-Remaining', remaining.toString());
    response.setHeader('X-RateLimit-Reset', resetTimestamp.toString());

    // Anexa dados da chave à requisição para uso posterior pelos controllers/guards
    request.apiKey = {
      ...apiKey,
      usageCount: newUsage,
      usageResetAt: isDifferentDay ? now : apiKey.usageResetAt,
    };

    return true;
  }
}
