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
    const staticDir = this.getStaticDir();
    const apkDir = join(staticDir, 'apk');
    let apkFile = 'eleicoes-progressistas-v2.2.8.apk';
    let apkPath = join(apkDir, apkFile);
    if (!existsSync(apkPath) && existsSync(apkDir)) {
      const found = readdirSync(apkDir).filter((f) => f.endsWith('.apk')).sort().reverse()[0];
      if (found) {
        apkFile = found;
        apkPath = join(apkDir, found);
      }
    }

    if (existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${apkFile}"`);
      const stream = createReadStream(apkPath);
      return stream.pipe(res);
    }

    // Fallback caso o arquivo físico não tenha sido sincronizado
    return res.redirect('https://github.com/fmourag/Eleicoes-Progressistas/releases/download/v2.2.8/eleicoes-progressistas-v2.2.8-beta.apk');
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
  getWebSpa(@Req() req: Request, @Res() res: Response) {
    const staticDir = this.getStaticDir();

    // Se a requisição for de arquivo com extensão (ex: .js, .css, .png, .svg, .json), tenta servir o arquivo real
    if (/\.[a-zA-Z0-9]+$/.test(req.path)) {
      const relPath = req.path.replace(/^\/web\/?/, '');
      const candidates = [
        join(staticDir, 'web', relPath),
        join(staticDir, relPath),
        join(staticDir, req.path),
      ];
      for (const p of candidates) {
        if (existsSync(p)) return res.sendFile(p);
      }
      return res.status(404).send('Not Found');
    }

    const indexPath = existsSync(join(staticDir, 'web', 'index.html'))
      ? join(staticDir, 'web', 'index.html')
      : join(staticDir, 'index.html');

    if (existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(indexPath);
    }

    return res.redirect('/beta');
  }
}
