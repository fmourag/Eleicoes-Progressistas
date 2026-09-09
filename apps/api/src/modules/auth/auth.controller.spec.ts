import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { SupabaseAuthService } from '../common/supabase/supabase-auth.service';
import { AuthGuard } from './auth.guard';
import { LocalJwtAuthGuard } from './local-jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let moduleRef: TestingModule;

  const mockAuthService = {
    syncUser: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com' }),
    findById: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com' }),
  };

  const mockSupabaseAuthGuard = {
    canActivate: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SupabaseAuthService, useValue: { verifyToken: jest.fn() } },
        { provide: SupabaseAuthGuard, useValue: mockSupabaseAuthGuard },
        { provide: LocalJwtAuthGuard, useValue: mockSupabaseAuthGuard },
        AuthGuard,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockSupabaseAuthGuard)
      .compile();

    moduleRef = module;
    controller = module.get<AuthController>(AuthController);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should sync user', async () => {
    const result = await controller.sync(
      { user: { id: '1' } },
      { id: '1', email: 'test@test.com', cep: '01001-000', municipality: 'São Paulo', state: 'SP' },
    );
    expect(result).toHaveProperty('id');
  });

  it('should return me', async () => {
    const result = await controller.me({ user: { id: '1' } });
    expect(result).toHaveProperty('supabase');
    expect(result).toHaveProperty('local');
  });
});
