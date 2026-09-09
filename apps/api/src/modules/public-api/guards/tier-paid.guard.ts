import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class TierPaidGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.apiKey;

    if (!apiKey || apiKey.tier !== 'PAID') {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'TIER_UPGRADE_REQUIRED',
          message: 'Este endpoint requer chave do tier PAID (R$ 200/mês). Solicite ativação comercial via contrato PIX em /api-publico.',
          upgrade: '/api-publico',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
