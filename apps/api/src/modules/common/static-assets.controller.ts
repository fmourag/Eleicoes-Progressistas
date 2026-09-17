import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

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
    const staticDir = this.getStaticDir();
    const apkPath = join(staticDir, 'apk', 'eleicoes-progressistas-v2.2.5.apk');

    if (existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="eleicoes-progressistas-v2.2.5.apk"');
      const stream = createReadStream(apkPath);
      return stream.pipe(res);
    }

    // Fallback caso o arquivo físico não tenha sido sincronizado
    return res.redirect('https://github.com/fmourag/Eleicoes-Progressistas/releases/download/v2.2.5/eleicoes-progressistas-v2.2.5-beta.apk');
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
    return res.send('421aaf52ebc730d839cfadb50c3b47fbb26870855c5c02d9dd14484a1404dbba\n');
  }

  @Get(['web', 'web/*path'])
  getWebSpa(@Req() _req: Request, @Res() res: Response) {
    const staticDir = this.getStaticDir();
    const indexPath = join(staticDir, 'web', 'index.html');

    if (existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(indexPath);
    }

    return res.redirect('/beta');
  }
}
