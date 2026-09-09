import { Injectable, Logger } from '@nestjs/common';

export type OperationMode = 'full' | 'watchdog' | 'archive';

export interface OpsModeInfo {
  mode: OperationMode;
  reason: string;
  since: string;
}

@Injectable()
export class OpsModeService {
  private readonly logger = new Logger(OpsModeService.name);
  private manualMode: OperationMode | null = null;
  private manualReason: string | null = null;
  private manualSince: string | null = null;
  private autoArchiveTriggered = false;
  private autoArchiveSince: string | null = null;

  // Cláusula de Pôr do Sol: pós 26/10/2026 (segundo turno das Eleições Gerais 2026)
  private readonly SUNSET_DATE = new Date(2026, 9, 26, 23, 59, 59);

  getMode(referenceDate: Date = new Date(), simulatedDeficit?: boolean): OpsModeInfo {
    // 1. Override manual em runtime (se houver)
    if (this.manualMode) {
      return {
        mode: this.manualMode,
        reason: this.manualReason || 'Definido manualmente via controle operacional',
        since: this.manualSince || new Date().toISOString(),
      };
    }

    // 2. Variável de ambiente explícita
    const envMode = (process.env.APP_MODE || '').toLowerCase() as OperationMode;
    if (envMode === 'archive' || envMode === 'watchdog') {
      return {
        mode: envMode,
        reason: `Configuração estática via variável de ambiente APP_MODE=${envMode}`,
        since: '2026-09-07T00:00:00.000Z',
      };
    }

    // 3. Verificação da Cláusula de Pôr do Sol Automático
    // Se data > 26/10/2026 e houver déficit financeiro consecutivo
    if (referenceDate > this.SUNSET_DATE) {
      const isDeficit = simulatedDeficit !== undefined ? simulatedDeficit : this.checkFinancialDeficit();
      if (isDeficit) {
        if (!this.autoArchiveTriggered) {
          this.autoArchiveTriggered = true;
          this.autoArchiveSince = referenceDate.toISOString();
          this.logger.warn(
            `[SUNSET CLAUSE] Cláusula de pôr do sol ativada em ${referenceDate.toISOString()}: déficit operacional acumulado após 26/10/2026. Transicionando para modo ARCHIVE.`,
          );
          // Emissão de alerta para o monitoramento / Sentry
          this.notifySentry('OPERATIONAL_SUNSET_TRIGGERED', {
            date: referenceDate.toISOString(),
            reason: 'Déficit operacional consecutivo pós-eleições 2026',
          });
        }
        return {
          mode: 'archive',
          reason: 'Cláusula de pôr do sol automático ativada: Déficit operacional acumulado pós-eleições 2026.',
          since: this.autoArchiveSince || referenceDate.toISOString(),
        };
      }
    }

    // 4. Modo padrão Full
    return {
      mode: 'full',
      reason: 'Operação eleitoral plena com todos os serviços ativos.',
      since: '2026-01-01T00:00:00.000Z',
    };
  }

  setMode(mode: OperationMode, reason?: string) {
    this.manualMode = mode;
    this.manualReason = reason || `Alterado via API para ${mode}`;
    this.manualSince = new Date().toISOString();
    this.logger.log(`Modo de operação alterado manualmente para ${mode}: ${this.manualReason}`);
    return this.getMode();
  }

  resetManualMode() {
    this.manualMode = null;
    this.manualReason = null;
    this.manualSince = null;
    this.autoArchiveTriggered = false;
    this.autoArchiveSince = null;
  }

  private checkFinancialDeficit(): boolean {
    // Por padrão no ambiente de desenvolvimento, consulta a flag de simulação
    if (process.env.SIMULATE_FINANCIAL_DEFICIT === 'true') {
      return true;
    }
    return false;
  }

  private notifySentry(event: string, payload: any) {
    // Integração com Sentry (falha silenciosa se não configurado)
    try {
      if (process.env.SENTRY_DSN) {
        this.logger.log(`[Sentry Alert] ${event}: ${JSON.stringify(payload)}`);
      }
    } catch {}
  }
}
