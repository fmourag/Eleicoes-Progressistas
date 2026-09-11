import { Controller, Get, Header } from '@nestjs/common';
import { PRIVACY_HTML, BETA_HTML } from './static-pages';

@Controller()
export class PagesController {
  @Get('privacidade')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getPrivacy() {
    return PRIVACY_HTML;
  }

  @Get('beta')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getBeta() {
    return BETA_HTML;
  }
}
