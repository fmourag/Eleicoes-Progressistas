import { Controller, Post, Get, Inject, UseGuards } from '@nestjs/common';
import { ProposalTranslationService } from './proposal-translation.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('proposals')
export class ProposalsController {
  constructor(@Inject(ProposalTranslationService) private readonly translationService: ProposalTranslationService) {}

  @UseGuards(AdminGuard)
  @Post('translate-batch')
  async triggerBatchTranslation() {
    return this.translationService.processNightlyBatch();
  }

  @Get('translation-stats')
  async getTranslationStats() {
    return this.translationService.getTranslationStats();
  }
}
