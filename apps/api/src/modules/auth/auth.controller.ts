import { Controller, Get, Post, Body, UseGuards, Req, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SyncUserDto } from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import * as jose from 'jose';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  /**
   * POST /api/auth/sync
   * Called by the mobile app after Supabase signup to sync user to our DB.
   * The Supabase token is verified via the guard.
   */
  @UseGuards(AuthGuard)
  @Post('sync')
  async sync(@Req() req: any, @Body() dto: SyncUserDto) {
    // Ensure the authenticated user can only sync their own data
    if (req.user.id !== dto.id) {
      throw new HttpException('Acesso negado: não é permitido sincronizar outro usuário', HttpStatus.FORBIDDEN);
    }
    return this.authService.syncUser(dto);
  }

  /**
   * GET /api/auth/me
   * Returns the current authenticated user from Supabase + our DB.
   */
  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const localUser = await this.authService.findById(req.user.id);
    return {
      supabase: req.user,
      local: localUser,
    };
  }

  /**
   * POST /api/auth/dev-login
   * Used only in Dev Mode Leve to bypass Supabase.
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('dev-login')
  async devLogin(@Body() body: { email: string; level?: string }) {
    if (process.env.NODE_ENV !== 'development') {
      throw new HttpException('Endpoint available only in development', HttpStatus.FORBIDDEN);
    }
    const level = body.level || 'VOTER';
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-not-for-production');
    const alg = 'HS256';
    const jwt = await new jose.SignJWT({ id: 'dev-user-123', email: body.email, level })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);
      
    return { access_token: jwt, user: { id: 'dev-user-123', email: body.email, level } };
  }
}
