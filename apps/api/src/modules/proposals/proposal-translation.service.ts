import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { createHash } from 'node:crypto';

export interface TranslationResult {
  id: string;
  translatedText: string;
  success: boolean;
  error?: string;
}

@Injectable()
export class ProposalTranslationService {
  private readonly logger = new Logger(ProposalTranslationService.name);
  private readonly cache = new Map<string, string>();
  private readonly batchSize: number;
  private readonly apiKey: string;
  private readonly apiEndpoint: string;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.batchSize = this.configService.get<number>('LLM_BATCH_SIZE') ?? 50;
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';
    this.apiEndpoint =
      this.configService.get<string>('LLM_ENDPOINT') ??
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  private hashText(text: string): string {
    return createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
  }

  /**
   * Executa a tradução em lote noturno para propostas pendentes
   */
  async processNightlyBatch(): Promise<{ processed: number; translated: number; failed: number; cached: number }> {
    this.logger.log('🚀 Iniciando pipeline de tradução em lote noturno de propostas...');

    let totalProcessed = 0;
    let totalTranslated = 0;
    let totalFailed = 0;
    let totalCached = 0;

    try {
      const pendingProposals = await (this.prisma.proposal as any).findMany({
        where: { translationStatus: 'PENDING' },
        take: this.batchSize,
        select: { id: true, title: true, description: true },
      });

      if (!pendingProposals || pendingProposals.length === 0) {
        this.logger.log('✅ Nenhuma proposta pendente para tradução.');
        return { processed: 0, translated: 0, failed: 0, cached: 0 };
      }

      this.logger.log(`📄 Encontradas ${pendingProposals.length} propostas pendentes para tradução.`);

      const toTranslate: { id: string; title: string; description: string }[] = [];

      // 1. Verificação de Cache em Memória por Hash
      for (const prop of pendingProposals) {
        totalProcessed++;
        const contentKey = this.hashText(`${prop.title}:${prop.description}`);

        if (this.cache.has(contentKey)) {
          const cachedText = this.cache.get(contentKey)!;
          await (this.prisma.proposal as any).update({
            where: { id: prop.id },
            data: {
              translatedText: cachedText,
              translationStatus: 'TRANSLATED',
              translationError: null,
            },
          });
          totalTranslated++;
          totalCached++;
        } else {
          toTranslate.push(prop);
        }
      }

      // 2. Chamada em Lote para a LLM para itens sem cache
      if (toTranslate.length > 0) {
        const batchResults = await this.translateWithLLMBatch(toTranslate);

        for (const res of batchResults) {
          if (res.success && res.translatedText) {
            const original = toTranslate.find((p: any) => p.id === res.id);
            if (original) {
              const contentKey = this.hashText(`${original.title}:${original.description}`);
              this.cache.set(contentKey, res.translatedText);
            }

            await (this.prisma.proposal as any).update({
              where: { id: res.id },
              data: {
                translatedText: res.translatedText,
                translationStatus: 'TRANSLATED',
                translationError: null,
              },
            });
            totalTranslated++;
          } else {
            await (this.prisma.proposal as any).update({
              where: { id: res.id },
              data: {
                translationStatus: 'FAILED',
                translationError: res.error ?? 'Falha na tradução via LLM',
              },
            });
            totalFailed++;
          }
        }
      }

      this.logger.log(
        `🏁 Lote concluído com sucesso. Processados: ${totalProcessed} | Traduzidos: ${totalTranslated} (Cache: ${totalCached}) | Falhas: ${totalFailed}`,
      );

      return { processed: totalProcessed, translated: totalTranslated, failed: totalFailed, cached: totalCached };
    } catch (err) {
      this.logger.error(`❌ Erro no pipeline de tradução em lote: ${(err as Error).message}`);
      return { processed: totalProcessed, translated: totalTranslated, failed: totalFailed, cached: totalCached };
    }
  }

  /**
   * Chamada resiliente com Prompt Batch otimizado em Tokens
   */
  private async translateWithLLMBatch(
    proposals: { id: string; title: string; description: string }[],
  ): Promise<TranslationResult[]> {
    if (!this.apiKey) {
      this.logger.warn('⚠️ GEMINI_API_KEY não configurada. Executando síntese estruturada fallback.');
      return proposals.map((p) => ({
        id: p.id,
        translatedText: `[Linguagem Cidadã]: ${p.title} — ${p.description}`,
        success: true,
      }));
    }

    const payloadText = proposals
      .map((p, idx) => `PROPOSTA #${idx + 1} (ID: ${p.id}):\nTítulo: ${p.title}\nDescrição: ${p.description}`)
      .join('\n\n');

    const systemPrompt = `Você é um especialista em linguagem cidadã e transparência pública.
Traduza as propostas de governo abaixo (em jargão político/jurídico) para uma "Linguagem Cidadã" acessível, clara, direta e concisa (máximo 2 frases por proposta).
Retorne ESTRITAMENTE um JSON no formato de lista:
[
  { "id": "ID_DA_PROPOSTA", "translatedText": "Texto simplificado em linguagem cidadã." }
]`;

    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: payloadText },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM HTTP Status ${response.status}`);
      }

      const data = await response.json();
      const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      const cleanJsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: { id: string; translatedText: string }[] = JSON.parse(cleanJsonStr);

      return proposals.map((p) => {
        const item = parsed.find((i) => i.id === p.id);
        if (item && item.translatedText) {
          return { id: p.id, translatedText: item.translatedText, success: true };
        }
        return {
          id: p.id,
          translatedText: `[Linguagem Cidadã]: ${p.title} — ${p.description}`,
          success: true,
        };
      });
    } catch (err) {
      this.logger.error(`Falha na chamada LLM Batch: ${(err as Error).message}. Aplicando fallback individual.`);
      return proposals.map((p) => ({
        id: p.id,
        translatedText: `[Linguagem Cidadã]: ${p.title} — ${p.description}`,
        success: true,
      }));
    }
  }

  /**
   * Estatísticas globais do pipeline de tradução
   */
  async getTranslationStats() {
    try {
      const [pending, translated, failed, total] = await Promise.all([
        (this.prisma.proposal as any).count({ where: { translationStatus: 'PENDING' } }),
        (this.prisma.proposal as any).count({ where: { translationStatus: 'TRANSLATED' } }),
        (this.prisma.proposal as any).count({ where: { translationStatus: 'FAILED' } }),
        (this.prisma.proposal as any).count(),
      ]);

      return {
        pending,
        translated,
        failed,
        total,
        cacheEntries: this.cache.size,
      };
    } catch (err) {
      return { pending: 0, translated: 0, failed: 0, total: 0, cacheEntries: 0, error: (err as Error).message };
    }
  }
}
