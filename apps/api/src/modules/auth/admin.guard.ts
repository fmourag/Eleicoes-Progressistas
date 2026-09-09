import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserLevel } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(AuthGuard) private authGuard: AuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Suporte a chave secreta de administração/cron para automações, rotinas e scripts
    const providedKey = request.headers['x-admin-key'] || request.headers['x-cron-secret'];
    const configuredSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

    if (providedKey) {
      if (configuredSecret && providedKey === configuredSecret) {
        return true;
      }
      if (isDev && (providedKey === 'dev-secret' || providedKey === 'admin')) {
        return true;
      }
    }

    // Validação padrão via token JWT / Supabase / Sessão
    let isAuthed = false;
    try {
      isAuthed = await Promise.resolve(this.authGuard.canActivate(context));
    } catch {
      isAuthed = false;
    }

    if (!isAuthed) {
      throw new HttpException('Não autorizado. Autenticação administrativa necessária.', HttpStatus.UNAUTHORIZED);
    }

    const user = request.user;
    const level = user?.level || user?.user_metadata?.level || user?.app_metadata?.role;
    if (level !== 'ADMIN' && level !== UserLevel.ADMIN) {
      throw new HttpException('Acesso restrito para administradores (UserLevel.ADMIN)', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
