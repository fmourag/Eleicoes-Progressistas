import { ElectionResult } from '../types/election-night';

export class ElectionNotificationsService {
  private static instance: ElectionNotificationsService;

  public static getInstance(): ElectionNotificationsService {
    if (!ElectionNotificationsService.instance) {
      ElectionNotificationsService.instance = new ElectionNotificationsService();
    }
    return ElectionNotificationsService.instance;
  }

  /**
   * Notificação 100% local — zero push remoto, zero vazamento de dados
   */
  public async notifyCandidateStatusChange(
    candidateName: string,
    cargo: string,
    newStatus: ElectionResult['status']
  ): Promise<void> {
    let title = '';
    let body = '';

    if (newStatus === 'ELEITO') {
      title = `🎉 ${candidateName} foi ELEITO(A)!`;
      body = `Resultado oficial confirmado pelo TSE para o cargo de ${cargo}.`;
    } else if (newStatus === 'SEGUNDO_TURNO') {
      title = `⚔️ 2º Turno: ${candidateName}`;
      body = `Disputa confirmada para o 2º Turno pelo TSE para ${cargo}.`;
    } else if (newStatus === 'NAO_ELEITO') {
      title = `ℹ️ ${candidateName} — Totalização TSE`;
      body = `Apuração concluída para o cargo de ${cargo}.`;
    } else {
      return;
    }

    try {
      // Tenta Web Notification API se disponível
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' });
          return;
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
            return;
          }
        }
      }
    } catch {}

    // Fallback silencioso / console para ambientes sem suporte a notificação ativa
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[Local Notification] ${title}: ${body}`);
    }
  }
}

export const electionNotificationsService = ElectionNotificationsService.getInstance();
