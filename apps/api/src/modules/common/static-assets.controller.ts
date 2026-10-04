import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { existsSync, createReadStream, readdirSync } from 'fs';

@Controller()
export class StaticAssetsController {
  private getStaticDir(): string {
    const candidates = [
      join(__dirname, '..', '..', '..', 'static'),
      join(__dirname, '..', '..', 'static'),
      join(__dirname, '..', 'static'),
      join(process.cwd(), 'apps', 'api', 'static'),
      join(process.cwd(), 'static'),
    ];
    for (const p of candidates) {
      if (existsSync(p)) return p;
    }
    return join(process.cwd(), 'apps', 'api', 'static');
  }

  @Get('download/apk')
  downloadApk(@Res() res: Response) {
    const GITHUB_RELEASE_APK_URL =
      process.env.GITHUB_RELEASE_APK_URL ||
      'https://github.com/fmourag/Eleicoes-Progressistas/releases/download/v2.2.22/eleicoes-progressistas-v2.2.21-beta.apk';

    // Redirecionamento 302 para CDN ilimitada do GitHub Releases (0 MB de banda no Render)
    return res.redirect(302, GITHUB_RELEASE_APK_URL);
  }

  @Get('download/apk/sha256')
  getApkSha256(@Res() res: Response) {
    const staticDir = this.getStaticDir();
    const shaPath = join(staticDir, 'apk', 'sha256.txt');

    if (existsSync(shaPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      const stream = createReadStream(shaPath);
      return stream.pipe(res);
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send('72799d22d732c3a58b399a095ec8390e48869699b58927361b80eae255950b7a\n');
  }

  @Get(['web', 'web/*path'])
  getWebSpa(@Req() req: Request, @Res() res: Response) {
    const PAGES_BASE_URL = process.env.PAGES_BASE_URL || 'https://eleicoes-progressistas.pages.dev/';
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.redirect(301, PAGES_BASE_URL);
  }
}
