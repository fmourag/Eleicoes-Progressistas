import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jose from 'jose';

@Injectable()
export class LocalJwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) return false;

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-not-for-production');
      const { payload } = await jose.jwtVerify(token, secret);
      request.user = payload;
      return true;
    } catch (e) {
      return false;
    }
  }

  private extractToken(request: any): string | null {
    const auth = request.headers?.authorization;
    if (!auth) return null;
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    return token;
  }
}
