import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { OpsModeService } from './ops-mode.service';

@Injectable()
export class OpsModeGuard implements CanActivate {
  constructor(
    @Inject(OpsModeService)
    private readonly opsModeService: OpsModeService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const path: string = (request.path || request.url || '').split('?')[0];
    const method: string = request.method?.toUpperCase() || 'GET';

    // Endpoints essenciais de saúde, infraestrutura e finanças são sempre acessíveis
    if (
      path.startsWith('/api/health') ||
      path.startsWith('/api/ops') ||
      path.startsWith('/api/finance') ||
      path.startsWith('/api/geo')
    ) {
      return true;
    }

    const { mode, reason } = this.opsModeService.getMode();

    if (mode === 'archive') {
      // No modo archive: todos os endpoints dinâmicos retornam 410 GONE
      const isDynamic =
        path.startsWith('/api/matching') ||
        path.startsWith('/api/cola') ||
        path.startsWith('/api/ads') ||
        path.startsWith('/api/watchdog') ||
        path.startsWith('/api/public') ||
        path.includes('sync') ||
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

      if (isDynamic) {
        throw new HttpException(
          {
            statusCode: HttpStatus.GONE,
            error: 'Gone',
            message: 'Arquivo histórico Eleições 2026: Sistema operando em modo somente leitura de arquivo histórico.',
            mode,
            reason,
          },
          HttpStatus.GONE,
        );
      }
    } else if (mode === 'watchdog') {
      // No modo watchdog: matching/compute, matching/rank e cola retornam 410; anúncios desligados
      if (
        path.startsWith('/api/matching/compute') ||
        path.startsWith('/api/matching/rank') ||
        path.startsWith('/api/cola')
      ) {
        throw new HttpException(
          {
            statusCode: HttpStatus.GONE,
            error: 'Gone',
            message: 'Modo Watchdog ativado: Período eleitoral 2026 encerrado. Matching eleitoral e geração de colinha estão desativados.',
            mode,
            reason,
          },
          HttpStatus.GONE,
        );
      }
      if (path.startsWith('/api/ads')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.GONE,
            error: 'Gone',
            message: 'Modo Watchdog ativado: Rede de anúncios éticos desativada após o encerramento do pleito.',
            mode,
            reason,
          },
          HttpStatus.GONE,
        );
      }
    }

    return true;
  }
}
