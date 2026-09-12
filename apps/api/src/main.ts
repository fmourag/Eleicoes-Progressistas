import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { Request, Response, json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './modules/common/http-exception.filter';
import { PRIVACY_HTML, BETA_HTML, FEEDBACK_HTML } from './modules/common/static-pages';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validação de segredos críticos de produção
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const missingSecrets: string[] = [];
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me' || process.env.JWT_SECRET === 'dev-secret') {
      missingSecrets.push('JWT_SECRET (deve ser um segredo criptográfico forte)');
    }
    if (!process.env.DEVICE_HASH_SALT) {
      missingSecrets.push('DEVICE_HASH_SALT');
    }
    if (!process.env.ADMIN_SECRET) {
      missingSecrets.push('ADMIN_SECRET (recomendado para proteger rotinas administrativas)');
    }
    if (!process.env.PIX_WEBHOOK_SECRET) {
      missingSecrets.push('PIX_WEBHOOK_SECRET (essencial para autenticar webhooks de doações)');
    }
    if (missingSecrets.length > 0) {
      logger.warn(`[AVISO DE SEGURANÇA] Variáveis críticas não configuradas para produção: ${missingSecrets.join(', ')}`);
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Oculta a tecnologia do servidor para evitar fingerprinting
  app.disable('x-powered-by');

  // Proteção contra payloads excessivos / buffer overflow / exaustão de memória
  app.use(json({ limit: '512kb' }));
  app.use(urlencoded({ limit: '512kb', extended: true }));

  // Cabeçalhos de Segurança HTTP robustos via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'https:', 'http:'],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      noSniff: true,
      dnsPrefetchControl: { allow: false },
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: ['privacidade', 'beta'],
  });

  // Filtro Global de Exceções: oculta stack traces e detalhes de BD em respostas HTTP
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Configuração segura de CORS
  const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:8081', 'http://127.0.0.1:3000', 'http://127.0.0.1:8081'];

  app.enableCors({
    origin: isProduction ? configuredOrigins : (origin, callback) => {
      // Em desenvolvimento, aceita origens locais e da lista configurada
      if (!origin || configuredOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Não permitido pelo CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'x-admin-token', 'x-cron-secret', 'x-device-hash', 'x-webhook-secret'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/privacidade', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(PRIVACY_HTML);
  });
  expressApp.get('/beta', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(BETA_HTML);
  });
  expressApp.get('/feedback', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(FEEDBACK_HTML);
  });

  const apiPublicDir = existsSync(join(__dirname, '..', 'public'))
    ? join(__dirname, '..', 'public')
    : join(process.cwd(), 'apps', 'api', 'public');

  if (existsSync(apiPublicDir)) {
    app.useStaticAssets(apiPublicDir, {
      prefix: '/',
      maxAge: 86400000 * 7,
      setHeaders: (res: Response) => {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    });
    logger.log(`API public assets served from ${apiPublicDir}`);
  }

  const webDist = join(__dirname, '..', '..', 'mobile', 'dist');
  if (existsSync(webDist)) {
    app.useStaticAssets(webDist);
    expressApp.get(/^\/(?!api|privacidade|beta|feedback|candidates).*/, (_req: Request, res: Response) => {
      res.sendFile(join(webDist, 'index.html'));
    });
  } else {
    logger.warn(`Web dist not found at ${webDist} - run build:web`);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`API running on :${port}`);
  if (existsSync(webDist)) logger.log(`Web static served from ${webDist}`);
}
bootstrap();

