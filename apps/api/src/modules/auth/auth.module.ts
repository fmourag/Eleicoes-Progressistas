import { Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { LocalJwtAuthGuard } from './local-jwt-auth.guard';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

@Global()
@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, LocalJwtAuthGuard, AuthGuard, AdminGuard],
  exports: [AuthService, SupabaseAuthGuard, LocalJwtAuthGuard, AuthGuard, AdminGuard],
})
export class AuthModule {}
