import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

export interface SupabaseUser {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class SupabaseAuthService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    @Inject(ConfigService) private config: ConfigService,
  ) {}

  /**
   * Verify a Supabase JWT token and return the user.
   * Uses Supabase's built-in JWT verification via the service client.
   */
  async verifyToken(token: string): Promise<SupabaseUser> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('invalid or expired token');
    }

    return {
      id: data.user.id,
      email: data.user.email ?? '',
      role: data.user.role ?? 'authenticated',
    };
  }

  /**
   * Get user metadata from Supabase.
   */
  async getUserMetadata(userId: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error || !data.user) return null;
    return data.user;
  }

  /**
   * Get Supabase client for admin operations.
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
