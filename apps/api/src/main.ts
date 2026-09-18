import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { Request, Response, json, urlencoded, static as expressStatic } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './modules/common/http-exception.filter';
import { PRIVACY_HTML, BETA_HTML, FEEDBACK_HTML, DASHBOARD_HTML } from './modules/common/static-pages';

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
    exclude: [
      'privacidade',
      'beta',
      'download',
      'app',
      'apk',
      'download/apk',
      'download/apk/sha256',
      'web',
      'web/*path',
      'feedback',
      'feedback/painel',
      'painel',
      'admin/feedback',
      '_expo',
      '_expo/*path',
      'assets',
      'assets/*path',
      '',
    ],
  });

  // Filtro Global de Exceções: oculta stack traces e detalhes de BD em respostas HTTP
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Configuração flexível e segura de CORS
  const defaultAllowedOrigins = [
    'https://eleicoes-progressistas.pages.dev',
    'https://eleicoes-progressistas.onrender.com',
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:19006',
  ];

  const envOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const allAllowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile nativo, apps desktop, cURL, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Origens explícitas permitidas
      if (allAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Padrões dinâmicos autorizados (Cloudflare Pages *.pages.dev, Render *.onrender.com, domínios do app e localhost)
      const isAllowedPattern =
        /^https:\/\/([a-zA-Z0-9_-]+\.)*pages\.dev$/.test(origin) ||
        /^https:\/\/([a-zA-Z0-9_-]+\.)*onrender\.com$/.test(origin) ||
        /^https:\/\/([a-zA-Z0-9_-]+\.)*eleicoesprogressistas\.(org\.br|com\.br|app)$/.test(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (isAllowedPattern) {
        return callback(null, true);
      }

      logger.warn(`[CORS Bloqueado] Origem não autorizada: ${origin}`);
      callback(null, false);
    },
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-admin-key',
      'x-admin-token',
      'x-cron-secret',
      'x-device-hash',
      'x-webhook-secret',
      'x-client-version',
      'x-request-id',
      'Accept',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();

  const apiStaticDir = existsSync(join(__dirname, '..', 'static'))
    ? join(__dirname, '..', 'static')
    : join(process.cwd(), 'apps', 'api', 'static');

  const webDistDir = existsSync(join(__dirname, '..', '..', 'mobile', 'dist'))
    ? join(__dirname, '..', '..', 'mobile', 'dist')
    : join(process.cwd(), 'apps', 'mobile', 'dist');

  // Localização resiliente dos bundles e ativos do Expo Web
  const expoDir = existsSync(join(apiStaticDir, '_expo'))
    ? join(apiStaticDir, '_expo')
    : existsSync(join(apiStaticDir, 'web', '_expo'))
    ? join(apiStaticDir, 'web', '_expo')
    : existsSync(join(webDistDir, '_expo'))
    ? join(webDistDir, '_expo')
    : null;

  const assetsDir = existsSync(join(apiStaticDir, 'assets'))
    ? join(apiStaticDir, 'assets')
    : existsSync(join(apiStaticDir, 'web', 'assets'))
    ? join(apiStaticDir, 'web', 'assets')
    : existsSync(join(webDistDir, 'assets'))
    ? join(webDistDir, 'assets')
    : null;

  const candidatesDir = existsSync(join(apiStaticDir, 'candidates'))
    ? join(apiStaticDir, 'candidates')
    : existsSync(join(apiStaticDir, 'web', 'candidates'))
    ? join(apiStaticDir, 'web', 'candidates')
    : existsSync(join(webDistDir, 'candidates'))
    ? join(webDistDir, 'candidates')
    : null;

  // Servir rotas estáticas críticas com prioridade máxima
  if (expoDir) {
    logger.log(`Serving _expo bundles from ${expoDir}`);
    expressApp.use('/_expo', expressStatic(expoDir, { maxAge: '1y', immutable: true }));
    expressApp.use('/web/_expo', expressStatic(expoDir, { maxAge: '1y', immutable: true }));
  }

  if (assetsDir) {
    logger.log(`Serving web assets from ${assetsDir}`);
    expressApp.use('/assets', expressStatic(assetsDir, { maxAge: '30d' }));
    expressApp.use('/web/assets', expressStatic(assetsDir, { maxAge: '30d' }));
  }

  if (candidatesDir) {
    logger.log(`Serving candidate portraits from ${candidatesDir}`);
    expressApp.use('/candidates', expressStatic(candidatesDir, { maxAge: '7d' }));
    expressApp.use('/web/candidates', expressStatic(candidatesDir, { maxAge: '7d' }));
  }

  if (existsSync(apiStaticDir)) {
    app.useStaticAssets(apiStaticDir, {
      prefix: '/',
    });
    logger.log(`API static assets served from ${apiStaticDir}`);
  }

  const staticWebDir = join(apiStaticDir, 'web');
  if (existsSync(staticWebDir)) {
    app.useStaticAssets(staticWebDir, {
      prefix: '/web',
    });
    logger.log(`API static web assets served from ${staticWebDir}`);
  }

  const getSpaIndexHtml = (): string | null => {
    const candidates = [
      join(apiStaticDir, 'index.html'),
      join(apiStaticDir, 'web', 'index.html'),
      join(webDistDir, 'index.html'),
    ];
    for (const p of candidates) {
      if (existsSync(p)) return p;
    }
    return null;
  };

  // Rota raiz: serve o App SPA diretamente com alta performance
  expressApp.get('/', (_req: Request, res: Response) => {
    const spaIndex = getSpaIndexHtml();
    if (spaIndex) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(spaIndex);
    }
    res.redirect('/beta');
  });

  expressApp.get('/privacidade', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(PRIVACY_HTML);
  });
  expressApp.get(['/beta', '/download', '/app', '/apk'], (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(BETA_HTML);
  });
  expressApp.get(['/download/apk', '/app.apk'], (_req: Request, res: Response) => {
    const apkPath = join(apiStaticDir, 'apk', 'eleicoes-progressistas-v2.2.5.apk');
    if (existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="eleicoes-progressistas-v2.2.5.apk"');
      return res.sendFile(apkPath);
    }
    res.redirect('https://github.com/fmourag/Eleicoes-Progressistas/releases/download/v2.2.5/eleicoes-progressistas-v2.2.5-beta.apk');
  });
  expressApp.get('/download/apk/sha256', (_req: Request, res: Response) => {
    const shaPath = join(apiStaticDir, 'apk', 'sha256.txt');
    if (existsSync(shaPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.sendFile(shaPath);
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('421aaf52ebc730d839cfadb50c3b47fbb26870855c5c02d9dd14484a1404dbba\n');
  });
  expressApp.get(['/web', '/web/*path'], (req: Request, res: Response, next: () => void) => {
    // Se for requisição de recurso estático com extensão de arquivo, entrega para os middlewares estáticos
    if (/\.[a-zA-Z0-9]+$/.test(req.path)) {
      return next();
    }
    const spaIndex = getSpaIndexHtml();
    if (spaIndex) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(spaIndex);
    }
    res.redirect('/beta');
  });
  expressApp.get('/feedback', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(FEEDBACK_HTML);
  });
  expressApp.get(['/feedback/painel', '/painel', '/admin/feedback', '/api/feedback/painel', '/api/feedback/dashboard-view'], (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(DASHBOARD_HTML);
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

  // Fallback SPA para navegação do Expo Router no navegador
  const spaIndex = getSpaIndexHtml();
  if (spaIndex) {
    expressApp.get(/^\/(?!api|privacidade|beta|feedback|candidates|download|apk|_expo|assets).*/, (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(spaIndex);
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`API running on :${port}`);
  if (existsSync(webDistDir)) logger.log(`Web static served from ${webDistDir}`);
}
bootstrap().catch((err) => {
  console.error('FATAL BOOTSTRAP ERROR:', err);
  process.exit(1);
});

