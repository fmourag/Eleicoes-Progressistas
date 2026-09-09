import { Controller, Get, Post, Query, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ColaService } from './cola.service';
import { GenerateColaPdfDto } from './dto/cola.dto';

@Controller('cola')
export class ColaController {
  constructor(private readonly colaService: ColaService) {}

  /**
   * Visualização direta do PDF no navegador (inline).
   * Exemplo: GET /api/cola/pdf?ids=id1,id2&state=RJ
   */
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Get('pdf')
  async getPdfInline(
    @Query('ids') idsParam: string,
    @Query('state') state: string,
    @Query('municipality') municipality: string,
    @Query('deviceHash') deviceHash: string,
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    const ids = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20) : [];
    const candidates = await this.colaService.getCandidatesByIds(ids);

    const pdfBuffer = await this.colaService.generatePdf({
      candidates,
      state,
      municipality,
      deviceHash,
      date,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="cola-eleitoral-2026.pdf"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache',
    });

    res.status(HttpStatus.OK).end(pdfBuffer);
  }

  /**
   * Download direto do arquivo PDF (attachment).
   * Exemplo: GET /api/cola/pdf/download?ids=id1,id2&state=RJ
   */
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Get('pdf/download')
  async getPdfDownload(
    @Query('ids') idsParam: string,
    @Query('state') state: string,
    @Query('municipality') municipality: string,
    @Query('deviceHash') deviceHash: string,
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    const ids = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20) : [];
    const candidates = await this.colaService.getCandidatesByIds(ids);

    const pdfBuffer = await this.colaService.generatePdf({
      candidates,
      state,
      municipality,
      deviceHash,
      date,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="cola-eleitoral-2026.pdf"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache',
    });

    res.status(HttpStatus.OK).end(pdfBuffer);
  }

  /**
   * Gera o PDF a partir de uma lista customizada enviada pelo frontend.
   */
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('pdf')
  async generateCustomPdf(
    @Body() dto: GenerateColaPdfDto,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.colaService.generatePdf(dto);
    const disposition = download === 'true' ? 'attachment' : 'inline';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="cola-eleitoral-2026.pdf"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache',
    });

    res.status(HttpStatus.OK).end(pdfBuffer);
  }
}
