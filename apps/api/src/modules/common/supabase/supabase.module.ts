import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';
import { SupabaseAuthService } from './supabase-auth.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SupabaseClient => {
        const url = config.get<string>('SUPABASE_URL') || 'http://localhost:54321';
        const key = config.get<string>('SUPABASE_SERVICE_KEY') || 'dummy-local-key';
        return createClient(url, key);
      },
    },
    SupabaseAuthService,
  ],
  exports: [SUPABASE_CLIENT, SupabaseAuthService],
})
export class SupabaseModule {}
