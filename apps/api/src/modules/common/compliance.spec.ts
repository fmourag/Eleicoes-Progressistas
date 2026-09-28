import * as fs from 'fs';
import * as path from 'path';

describe('Google Play Compliance & Anti-Deceptive Claims Suite', () => {
  const rootDir = path.resolve(__dirname, '../../../../..');

  test('GovDisclaimer component contains independence statement and 3 official TSE URLs', () => {
    const disclaimerPath = path.join(rootDir, 'apps/mobile/components/GovDisclaimer.tsx');
    expect(fs.existsSync(disclaimerPath)).toBe(true);

    const content = fs.readFileSync(disclaimerPath, 'utf8');
    expect(content).toContain('é um aplicativo independente, sem vínculo com o TSE, governo ou partidos. Fonte oficial dos dados:');
    expect(content).toContain('https://www.tse.jus.br');
    expect(content).toContain('https://dadosabertos.tse.jus.br');
    expect(content).toContain('https://resultados.tse.jus.br');
  });

  test('HomeScreen (index.tsx) imports and renders GovDisclaimer and AboutModal', () => {
    const indexPath = path.join(rootDir, 'apps/mobile/app/index.tsx');
    const content = fs.readFileSync(indexPath, 'utf8');

    expect(content).toContain('GovDisclaimer');
    expect(content).toContain('<GovDisclaimer />');
    expect(content).toContain('AboutModal');
    expect(content).toContain('showAboutModal');
  });

  test('FeedbackScreen imports and renders GovDisclaimer', () => {
    const feedbackPath = path.join(rootDir, 'apps/mobile/app/feedback.tsx');
    const content = fs.readFileSync(feedbackPath, 'utf8');

    expect(content).toContain('GovDisclaimer');
    expect(content).toContain('<GovDisclaimer');
  });

  test('HTML public pages contain GovDisclaimer and official URLs', () => {
    const privPath = path.join(rootDir, 'apps/api/static/privacidade.html');
    const betaPath = path.join(rootDir, 'static/beta.html');
    const staticPagesPath = path.join(rootDir, 'apps/api/src/modules/common/static-pages.ts');

    const privContent = fs.readFileSync(privPath, 'utf8');
    const betaContent = fs.readFileSync(betaPath, 'utf8');
    const staticContent = fs.readFileSync(staticPagesPath, 'utf8');

    for (const content of [privContent, betaContent, staticContent]) {
      expect(content).toContain('Exoneração de Responsabilidade & Fonte Oficial');
      expect(content).toContain('https://www.tse.jus.br');
      expect(content).toContain('https://dadosabertos.tse.jus.br');
      expect(content).toContain('https://resultados.tse.jus.br');
    }
  });

  test('CivicBanner uses de-endorsed wording and Dados: TSE badge', () => {
    const bannerPath = path.join(rootDir, 'apps/mobile/components/CivicBanner.tsx');
    const content = fs.readFileSync(bannerPath, 'utf8');

    expect(content).not.toContain('Classificação oficial');
    expect(content).not.toContain('>TSE 2026<');
    expect(content).toContain('Classificação independente calculada sobre registros oficiais de votações nominais e posturas legislativas');
    expect(content).toContain('Dados: TSE');
  });

  test('STORE_LISTING_PTBR.md exists and starts with the official disclaimer and sources', () => {
    const storePath = path.join(rootDir, 'docs/STORE_LISTING_PTBR.md');
    expect(fs.existsSync(storePath)).toBe(true);

    const content = fs.readFileSync(storePath, 'utf8');
    expect(content).toContain('AVISO DE INDEPENDÊNCIA E FONTES OFICIAIS DOS DADOS');
    expect(content).toContain('https://www.tse.jus.br');
    expect(content).toContain('https://dadosabertos.tse.jus.br');
    expect(content).toContain('https://resultados.tse.jus.br');
    expect(content).toContain('Livros e referência');
  });
});
