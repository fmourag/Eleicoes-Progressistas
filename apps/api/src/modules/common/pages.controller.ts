import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

@Controller()
export class PagesController {
  @Get('privacidade')
  getPrivacy(@Res() res: Response) {
    const candidates = [
      join(process.cwd(), 'static', 'privacidade.html'),
      join(process.cwd(), '..', '..', 'static', 'privacidade.html'),
      join(__dirname, '..', '..', '..', 'static', 'privacidade.html'),
    ];
    for (const p of candidates) {
      if (existsSync(p)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(readFileSync(p, 'utf-8'));
      }
    }
    return res.status(404).send('Política de Privacidade não encontrada');
  }

  @Get('beta')
  getBeta(@Res() res: Response) {
    const candidates = [
      join(process.cwd(), 'static', 'beta.html'),
      join(process.cwd(), '..', '..', 'static', 'beta.html'),
      join(__dirname, '..', '..', '..', 'static', 'beta.html'),
    ];
    for (const p of candidates) {
      if (existsSync(p)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(readFileSync(p, 'utf-8'));
      }
    }
    return res.status(404).send('Página do Beta não encontrada');
  }
}
