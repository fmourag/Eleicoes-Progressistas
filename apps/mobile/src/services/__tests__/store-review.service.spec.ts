import * as StoreReview from 'expo-store-review';
import {
  storeReviewService,
  resetStoreReviewState,
  getStoreReviewState,
  saveStoreReviewState,
  REVIEW_COOLDOWN_MS,
  MIN_ACTIVE_SESSIONS,
} from '../store-review.service';

jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
  hasAction: jest.fn().mockResolvedValue(true),
}));

describe('StoreReviewService', () => {
  beforeEach(() => {
    resetStoreReviewState();
    jest.clearAllMocks();
    (StoreReview.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (StoreReview.requestReview as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Registro de marcos neutros', () => {
    it('deve registrar sessões de forma incremental no armazenamento local', () => {
      expect(getStoreReviewState().activeSessionsCount).toBe(0);

      storeReviewService.recordSession();
      expect(getStoreReviewState().activeSessionsCount).toBe(1);

      storeReviewService.recordSession();
      storeReviewService.recordSession();
      expect(getStoreReviewState().activeSessionsCount).toBe(3);
    });

    it('deve registrar geração de PDF da cola eleitoral', () => {
      expect(getStoreReviewState().hasGeneratedPdf).toBe(false);

      storeReviewService.recordPdfGenerated();
      expect(getStoreReviewState().hasGeneratedPdf).toBe(true);
    });
  });

  describe('Critérios de elegibilidade neutros (shouldPrompt)', () => {
    it('deve retornar false para novo usuário sem marcos de engajamento atingidos', () => {
      expect(storeReviewService.shouldPrompt()).toBe(false);
    });

    it('deve retornar true quando o usuário atinge o marco neutro de sessões (>= 3)', () => {
      for (let i = 0; i < MIN_ACTIVE_SESSIONS; i++) {
        storeReviewService.recordSession();
      }
      expect(storeReviewService.shouldPrompt()).toBe(true);
    });

    it('deve retornar true quando o usuário gera PDF da cola (mesmo com poucas sessões)', () => {
      storeReviewService.recordSession(); // 1 sessão apenas
      expect(storeReviewService.shouldPrompt()).toBe(false);

      storeReviewService.recordPdfGenerated();
      expect(storeReviewService.shouldPrompt()).toBe(true);
    });

    it('deve respeitar estritamente a cota de 30 dias do Google Play', () => {
      expect(REVIEW_COOLDOWN_MS).toBe(30 * 24 * 60 * 60 * 1000);
      const now = Date.now();
      storeReviewService.recordPdfGenerated();

      // Define que foi solicitado há 10 dias (menos que o cooldown de 30 dias)
      const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;
      saveStoreReviewState({
        activeSessionsCount: 5,
        hasGeneratedPdf: true,
        lastPromptTimestamp: tenDaysAgo,
      });

      expect(storeReviewService.shouldPrompt(now)).toBe(false);

      // Passados 31 dias, deve voltar a ser elegível
      const thirtyOneDaysAfter = tenDaysAgo + 31 * 24 * 60 * 60 * 1000;
      expect(storeReviewService.shouldPrompt(thirtyOneDaysAfter)).toBe(true);
    });
  });

  describe('In-App Review Oficial (promptIfEligible)', () => {
    it('deve acionar StoreReview.requestReview() e salvar timestamp quando elegível', async () => {
      const now = Date.now();
      storeReviewService.recordPdfGenerated();

      const result = await storeReviewService.promptIfEligible(now);

      expect(result).toBe(true);
      expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
      expect(getStoreReviewState().lastPromptTimestamp).toBe(now);
    });

    it('não deve acionar StoreReview se não atingiu nenhum marco neutro', async () => {
      const result = await storeReviewService.promptIfEligible();

      expect(result).toBe(false);
      expect(StoreReview.requestReview).not.toHaveBeenCalled();
      expect(getStoreReviewState().lastPromptTimestamp).toBeNull();
    });

    it('não deve acionar StoreReview se a API nativa não estiver disponível no ambiente', async () => {
      (StoreReview.isAvailableAsync as jest.Mock).mockResolvedValue(false);
      storeReviewService.recordPdfGenerated();

      const result = await storeReviewService.promptIfEligible();

      expect(result).toBe(false);
      expect(StoreReview.requestReview).not.toHaveBeenCalled();
    });

    it('não deve lançar exceção caso StoreReview falhe internamente', async () => {
      (StoreReview.requestReview as jest.Mock).mockRejectedValue(new Error('Play Store Core Error'));
      storeReviewService.recordPdfGenerated();

      const result = await storeReviewService.promptIfEligible();
      expect(result).toBe(false);
    });
  });
});
