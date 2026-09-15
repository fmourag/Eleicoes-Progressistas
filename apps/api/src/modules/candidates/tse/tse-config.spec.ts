import { TSE_CONFIG } from './tse.config';

describe('TSE Config', () => {
  it('should have an honest and identifiable USER_AGENT', () => {
    expect(TSE_CONFIG.USER_AGENT).toMatch(/^EleicoesProgressistas\//);
    expect(TSE_CONFIG.USER_AGENT).not.toMatch(/Mozilla|Chrome/i);
    expect(TSE_CONFIG.USER_AGENT).toContain('fmourag@gmail.com');
  });

  it('should contain official TSE URLs', () => {
    expect(TSE_CONFIG.API_BASE_URL).toBe('https://divulgacandcontas.tse.jus.br/divulga/rest/v1');
    expect(TSE_CONFIG.PHOTO_BASE_URL).toBe('https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1/candidatura/buscar/foto');
  });
});
