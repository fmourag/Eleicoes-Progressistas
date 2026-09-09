import { Injectable , Inject } from '@nestjs/common';
import { SupabaseAuthService } from '../common/supabase/supabase-auth.service';

/**
 * Guard that verifies Supabase JWT tokens.
 * Re-exports from common for cleaner imports.
 */
@Injectable()
export class SupabaseAuthGuard {
  constructor(@Inject(SupabaseAuthService) private supabaseAuth: SupabaseAuthService) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) return false;

    const user = await this.supabaseAuth.verifyToken(token);
    request.user = user;
    return true;
  }

  private extractToken(request: any): string | null {
    const auth = request.headers?.authorization;
    if (!auth) return null;
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    return token;
  }
}
