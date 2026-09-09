import { Controller, Get, Param , Inject } from '@nestjs/common';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(@Inject(GeoService) private geoService: GeoService) {}

  @Get('cep/:cep')
  async resolveCep(@Param('cep') cep: string) {
    return this.geoService.resolveCep(cep);
  }
}
