import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { LocalJwtAuthGuard } from './local-jwt-auth.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  private useLocal: boolean;

  constructor(
    @Inject(SupabaseAuthGuard) private supabaseGuard: SupabaseAuthGuard,
    @Inject(LocalJwtAuthGuard) private localGuard: LocalJwtAuthGuard,
  ) {
    this.useLocal = process.env.NODE_ENV === 'development' && process.env.DB_PROVIDER === 'sqlite';
  }

  canActivate(context: ExecutionContext) {
    if (this.useLocal) {
      return this.localGuard.canActivate(context);
    }
    return this.supabaseGuard.canActivate(context);
  }
}
