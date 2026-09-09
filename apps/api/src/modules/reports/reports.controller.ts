import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AdminGuard } from '../auth/admin.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    @Inject(ReportsService)
    private readonly reportsService: ReportsService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // Catálogo Público & Pedidos
  // ─────────────────────────────────────────────────────────────

  @Get('products')
  async getCatalog() {
    return this.reportsService.getCatalog();
  }

  @Get('catalog')
  async getCatalogAlias() {
    return this.reportsService.getCatalog();
  }

  @Get('products/:slug')
  async getProduct(@Param('slug') slug: string) {
    return this.reportsService.getProduct(slug);
  }

  @Post('orders')
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.reportsService.createOrder(dto);
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    return this.reportsService.getOrder(id);
  }

  // ─────────────────────────────────────────────────────────────
  // Download do Relatório (JSON / CSV / PDF)
  // ─────────────────────────────────────────────────────────────

  @Get('download/:orderId')
  async downloadReport(
    @Param('orderId') orderId: string,
    @Query('format') format: string = 'json',
    @Res() res: Response,
  ) {
    const requestedFormat = (format || 'json').toLowerCase();

    if (requestedFormat === 'csv') {
      const csv = await this.reportsService.exportCsv(orderId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-b2b-${orderId.slice(0, 8)}.csv"`);
      return res.status(HttpStatus.OK).send(csv);
    }

    if (requestedFormat === 'pdf') {
      const pdfBuffer = await this.reportsService.exportPdf(orderId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-b2b-${orderId.slice(0, 8)}.pdf"`);
      return res.status(HttpStatus.OK).send(pdfBuffer);
    }

    // Default: JSON
    const reportData = await this.reportsService.getReportData(orderId);
    return res.status(HttpStatus.OK).json(reportData);
  }

  // ─────────────────────────────────────────────────────────────
  // Endpoints Administrativos (AdminGuard)
  // ─────────────────────────────────────────────────────────────

  @UseGuards(AdminGuard)
  @Get('admin/orders')
  async adminListOrders() {
    return this.reportsService.adminListOrders();
  }

  @UseGuards(AdminGuard)
  @Patch('admin/orders/:id/confirm')
  async adminConfirmPayment(
    @Param('id') id: string,
    @Body() dto: ConfirmOrderDto,
  ) {
    return this.reportsService.adminConfirmPayment(id, dto.paymentRef);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/orders/:id/deliver')
  async adminDeliverOrder(@Param('id') id: string) {
    return this.reportsService.adminDeliverOrder(id);
  }
}
